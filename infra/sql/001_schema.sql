-- X420 product intelligence schema.
--
-- Design principles, in priority order:
--
-- 1. PROVENANCE IS NOT OPTIONAL. Every product row records where it came from,
--    when, and how (source_kind). A row with no verifiable origin is worthless
--    to a patient making a health decision, so the schema refuses to store one.
--
-- 2. OBSERVATIONS, NOT TRUTH. We never overwrite a product's potency with a
--    newer value. We append an observation. Prices and stock change constantly;
--    a system that overwrites cannot answer "was this accurate when we said it?"
--
-- 3. CONFIDENCE IS EXPLICIT. Data extracted by an LLM agent from unstructured
--    HTML is not the same quality as a lab COA. The schema forces that
--    distinction to be recorded rather than laundered away.
--
-- 4. NO PHI. There are no patient tables here. Deliberately. See docs/COMPLIANCE.md.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;   -- fuzzy product-name matching

-- ---------------------------------------------------------------------------
-- Provenance
-- ---------------------------------------------------------------------------

-- How a given fact reached us, ranked by how much we should trust it.
CREATE TYPE source_kind AS ENUM (
  'official_api',      -- licensed partner API (Dutchie Plus, Jane, etc.)
  'licensed_feed',     -- paid data vendor under contract
  'public_record',     -- government open data (OMMU, state lab results)
  'coa_document',      -- an actual certificate of analysis
  'agent_extraction',  -- LLM agent read a public page and extracted fields
  'manual_entry'       -- a human typed it in
);

-- How confident we are in an individual observation.
CREATE TYPE confidence AS ENUM ('verified', 'high', 'medium', 'low', 'unverified');

CREATE TABLE sources (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  kind            source_kind NOT NULL,
  name            text        NOT NULL,
  base_url        text,
  -- Licence/authorisation note: for agent_extraction, what robots.txt said and
  -- whether we have permission. Forces the question to be answered per source.
  authorization_note text,
  robots_allowed  boolean,
  active          boolean     NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (kind, name)
);

-- ---------------------------------------------------------------------------
-- Dispensaries (spine: Florida OMMU public records)
-- ---------------------------------------------------------------------------

CREATE TABLE dispensaries (
  id            text PRIMARY KEY,          -- stable slug from @x420/ommu
  company       text NOT NULL,
  address       text NOT NULL,
  city          text NOT NULL,
  state         text NOT NULL DEFAULT 'FL',
  zip           text NOT NULL,
  county        text NOT NULL,
  phone         text,
  email         text,
  website       text,
  license_number text,
  latitude      double precision,
  longitude     double precision,
  source_id     uuid REFERENCES sources(id),
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at  timestamptz NOT NULL DEFAULT now(),
  active        boolean     NOT NULL DEFAULT true
);

CREATE INDEX dispensaries_county_idx  ON dispensaries (county);
CREATE INDEX dispensaries_zip_idx     ON dispensaries (zip);
CREATE INDEX dispensaries_company_trgm ON dispensaries USING gin (company gin_trgm_ops);

-- ---------------------------------------------------------------------------
-- Brands & products
-- ---------------------------------------------------------------------------

CREATE TABLE brands (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        text NOT NULL UNIQUE,
  mmtc_name   text,        -- the licensed MMTC that owns/produces it, if known
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TYPE product_category AS ENUM (
  'flower','preroll','vape','concentrate','edible','tincture',
  'capsule','topical','transdermal','suppository','accessory','other'
);

-- The canonical product identity. Potency/price live in observations, not here.
CREATE TABLE products (
  id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id       uuid REFERENCES brands(id),
  name           text NOT NULL,
  category       product_category NOT NULL,
  strain_name    text,
  -- indica / sativa / hybrid. Stored as free text because the industry uses it
  -- inconsistently and we refuse to imply more precision than exists.
  strain_type    text,
  normalized_key text NOT NULL,   -- lower(brand|name|category) for dedupe
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (normalized_key)
);

CREATE INDEX products_name_trgm ON products USING gin (name gin_trgm_ops);
CREATE INDEX products_category_idx ON products (category);

-- ---------------------------------------------------------------------------
-- Observations — append-only, never updated in place
-- ---------------------------------------------------------------------------

CREATE TABLE product_observations (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id      uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  dispensary_id   text REFERENCES dispensaries(id),
  source_id       uuid NOT NULL REFERENCES sources(id),

  observed_at     timestamptz NOT NULL DEFAULT now(),
  source_url      text,

  -- Potency. Percent for flower/concentrate, mg for dosed products.
  thc_percent     numeric(6,3) CHECK (thc_percent  >= 0 AND thc_percent  <= 100),
  cbd_percent     numeric(6,3) CHECK (cbd_percent  >= 0 AND cbd_percent  <= 100),
  thc_mg          numeric(10,2) CHECK (thc_mg >= 0),
  cbd_mg          numeric(10,2) CHECK (cbd_mg >= 0),

  price_usd       numeric(10,2) CHECK (price_usd >= 0),
  unit_size       text,
  in_stock        boolean,

  terpenes        jsonb,      -- {"myrcene": 0.52, "limonene": 0.31}
  coa_url         text,
  raw             jsonb,      -- exactly what the source gave us, for audit

  confidence      confidence NOT NULL DEFAULT 'unverified',
  -- Which model/agent produced this, when source_kind = 'agent_extraction'.
  extracted_by    text,

  CONSTRAINT potency_present_or_null CHECK (
    thc_percent IS NOT NULL OR cbd_percent IS NOT NULL OR
    thc_mg IS NOT NULL OR cbd_mg IS NOT NULL OR
    price_usd IS NOT NULL OR in_stock IS NOT NULL
  )
);

CREATE INDEX obs_product_time_idx    ON product_observations (product_id, observed_at DESC);
CREATE INDEX obs_dispensary_idx      ON product_observations (dispensary_id, observed_at DESC);
CREATE INDEX obs_source_idx          ON product_observations (source_id);
CREATE INDEX obs_terpenes_gin        ON product_observations USING gin (terpenes);

-- Latest observation per (product, dispensary). This is what the API serves.
CREATE VIEW current_products AS
SELECT DISTINCT ON (o.product_id, o.dispensary_id)
  o.product_id,
  o.dispensary_id,
  p.name              AS product_name,
  b.name              AS brand_name,
  p.category,
  p.strain_name,
  p.strain_type,
  o.thc_percent, o.cbd_percent, o.thc_mg, o.cbd_mg,
  o.price_usd, o.unit_size, o.in_stock, o.terpenes, o.coa_url,
  o.confidence,
  o.observed_at,
  o.source_url,
  s.kind              AS source_kind,
  s.name              AS source_name
FROM product_observations o
JOIN products p  ON p.id = o.product_id
LEFT JOIN brands b ON b.id = p.brand_id
JOIN sources  s  ON s.id = o.source_id
ORDER BY o.product_id, o.dispensary_id, o.observed_at DESC;

-- ---------------------------------------------------------------------------
-- Agent research queue
-- ---------------------------------------------------------------------------

CREATE TYPE crawl_status AS ENUM ('pending','running','ok','blocked','failed','skipped');

-- Targets the research agents work through. `blocked` is a first-class outcome:
-- when robots.txt or a ToS says no, we record that and STOP, we don't retry
-- around it.
CREATE TABLE research_targets (
  id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  dispensary_id  text REFERENCES dispensaries(id),
  url            text NOT NULL UNIQUE,
  platform       text,          -- 'dutchie' | 'jane' | 'custom' | ...
  robots_allowed boolean,
  status         crawl_status NOT NULL DEFAULT 'pending',
  last_attempt_at timestamptz,
  next_attempt_at timestamptz,
  attempts       int NOT NULL DEFAULT 0,
  last_error     text,
  notes          text
);

CREATE INDEX research_status_idx ON research_targets (status, next_attempt_at);

CREATE TABLE crawl_runs (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  target_id     uuid REFERENCES research_targets(id) ON DELETE CASCADE,
  started_at    timestamptz NOT NULL DEFAULT now(),
  finished_at   timestamptz,
  status        crawl_status NOT NULL DEFAULT 'running',
  products_found int NOT NULL DEFAULT 0,
  model         text,
  cost_usd      numeric(10,4),
  error         text
);

CREATE INDEX crawl_runs_target_idx ON crawl_runs (target_id, started_at DESC);

-- ---------------------------------------------------------------------------
-- Seed the sources we actually have today
-- ---------------------------------------------------------------------------

INSERT INTO sources (kind, name, base_url, authorization_note, robots_allowed) VALUES
  ('public_record', 'Florida OMMU MMTC registry',
   'https://knowthefactsmmj.com/mmtc/',
   'Public records published by the Florida Department of Health. No authorization required.',
   true)
ON CONFLICT DO NOTHING;

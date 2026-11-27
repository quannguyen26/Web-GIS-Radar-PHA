-- =============================================================================
-- 003_bulletin_templates_and_drafts.sql
-- Bulletins feature, step 2.3 (2026-11-27).
-- Target database: the app DB (DB_APP_NAME, e.g. webgis_app). NOT the Geo DB.
--
-- What it does:
--   1. bulletin_templates: one row per template VERSION. The field description
--      (the "fields" array of backend/templates/<type>/fields.json) is copied
--      into a jsonb column; rows are never edited, a new version is a new row.
--      Only one active template per organization type.
--   2. bulletins: drafts for now (status DRAFT). Columns for publishing
--      (number, year, issue time, docx/pdf, manual flag) come in step 5.1.
--
-- After running it, load the radar station template (from the backend folder):
--   node scripts/load-template.mjs templates/radar-station/fields.json
--
-- Runs in one transaction: either everything is applied or nothing is.
-- Not re-runnable: a second run fails (tables already exist) and rolls back.
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. bulletin_templates
-- ---------------------------------------------------------------------------
CREATE TABLE bulletin_templates (
  id                serial       PRIMARY KEY,
  code              varchar(50)  NOT NULL,
  version           integer      NOT NULL
    CONSTRAINT chk_bulletin_templates_version CHECK (version >= 1),
  name              varchar(255) NOT NULL,
  organization_type varchar(50)  NOT NULL
    CONSTRAINT chk_bulletin_templates_organization_type
    CHECK (organization_type IN ('RADAR_STATION', 'PROVINCIAL_STATION')),
  fields            jsonb        NOT NULL
    CONSTRAINT chk_bulletin_templates_fields CHECK (jsonb_typeof(fields) = 'array'),
  docx_path         varchar(500),
  active            boolean      NOT NULL DEFAULT true,
  created_at        timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_bulletin_templates_code_version UNIQUE (code, version)
);
-- At most one active template per organization type
CREATE UNIQUE INDEX uq_bulletin_templates_active_type
  ON bulletin_templates (organization_type) WHERE active;

-- ---------------------------------------------------------------------------
-- 2. bulletins (drafts)
-- ---------------------------------------------------------------------------
CREATE TABLE bulletins (
  id              bigserial   PRIMARY KEY,
  template_id     integer     NOT NULL
    CONSTRAINT fk_bulletins_template REFERENCES bulletin_templates (id),
  organization_id integer     NOT NULL
    CONSTRAINT fk_bulletins_organization REFERENCES organizations (id),
  author_id       bigint      NOT NULL
    CONSTRAINT fk_bulletins_author REFERENCES users (id),
  status          varchar(20) NOT NULL DEFAULT 'DRAFT'
    CONSTRAINT chk_bulletins_status CHECK (status IN ('DRAFT', 'PUBLISHED')),
  -- Values typed by the author, keyed by the field "key" of the template
  field_values    jsonb       NOT NULL DEFAULT '{}'
    CONSTRAINT chk_bulletins_field_values CHECK (jsonb_typeof(field_values) = 'object'),
  created_at      timestamp   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      timestamp   NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- "My drafts": WHERE author_id = $1 AND status = 'DRAFT'
CREATE INDEX idx_bulletins_author_status ON bulletins (author_id, status);

COMMIT;

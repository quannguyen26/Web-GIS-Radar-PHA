-- =============================================================================
-- 001_ban_tin_users_organizations.sql
-- Bulletins feature, roadmap step 1.1 (2026-11-18).
-- Target database: the app DB (DB_APP_NAME, e.g. webgis_app). NOT the Geo DB.
--
-- What it does:
--   1. users.organization_id may be NULL, but only for SYSTEM_ADMIN
--      (and SYSTEM_ADMIN must have NULL).
--   2. users.signature_path: path of the signature PNG on the server disk.
--   3. New columns on organizations: file code, document symbol, place name,
--      bulletin start number, Gmail sender, encrypted app password, recipients.
--   4. Fill the new columns for the existing organizations.
--
-- Runs in one transaction: either everything is applied or nothing is.
-- Not re-runnable: running it a second time fails (columns already exist)
-- and the transaction rolls back without changing anything.
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. users.organization_id: optional only for SYSTEM_ADMIN
-- ---------------------------------------------------------------------------
-- The foreign key fk_users_organization stays: a non-NULL value must still
-- point to an existing organization.
ALTER TABLE users
  ALTER COLUMN organization_id DROP NOT NULL;

-- role_id = 1 is SYSTEM_ADMIN (roles table). A CHECK cannot look up another
-- table, so the id is used directly. Rule: SYSTEM_ADMIN <=> no organization.
ALTER TABLE users
  ADD CONSTRAINT chk_users_organization_by_role
  CHECK ((role_id = 1) = (organization_id IS NULL));

-- ---------------------------------------------------------------------------
-- 2. users.signature_path
-- ---------------------------------------------------------------------------
-- NULL = no signature yet (the user cannot publish a bulletin).
ALTER TABLE users
  ADD COLUMN signature_path varchar(500);

-- ---------------------------------------------------------------------------
-- 3. New columns on organizations (column "code" is kept unchanged)
-- ---------------------------------------------------------------------------
ALTER TABLE organizations
  -- 4-char prefix of bulletin file names, e.g. PDIN_DONG_20260928_01h20.docx
  ADD COLUMN file_code varchar(4)
    CONSTRAINT organizations_file_code_key UNIQUE
    CONSTRAINT chk_organizations_file_code CHECK (file_code ~ '^[A-Z0-9]{4}$'),
  -- Document symbol in the bulletin number / mail subject, e.g. RĐPĐ-913
  ADD COLUMN doc_symbol varchar(20),
  -- Place name written before the date, e.g. "Pha Đin, ngày ..."
  ADD COLUMN place_name varchar(100),
  -- First bulletin number of each year (set by the organization's Admin)
  ADD COLUMN bulletin_start_number integer NOT NULL DEFAULT 1
    CONSTRAINT chk_organizations_bulletin_start_number
    CHECK (bulletin_start_number >= 1),
  -- Gmail account used to send bulletins
  ADD COLUMN gmail_address varchar(255),
  -- Gmail app password, ENCRYPTED by the backend (never stored in plain text)
  ADD COLUMN gmail_app_password_enc text,
  -- Fixed list of recipient email addresses
  ADD COLUMN email_recipients text[] NOT NULL DEFAULT '{}';

-- ---------------------------------------------------------------------------
-- 4. Data for the existing organizations
-- ---------------------------------------------------------------------------
UPDATE organizations
SET file_code = 'PDIN', doc_symbol = 'RĐPĐ', place_name = 'Pha Đin',
    updated_at = CURRENT_TIMESTAMP
WHERE code = 'RDPD';

-- Only the file code is known for Sơn La (from SOLA_DONG_... sample file);
-- doc_symbol and place_name are filled later when the provincial template is done.
UPDATE organizations
SET file_code = 'SOLA', updated_at = CURRENT_TIMESTAMP
WHERE code = 'SOLA';

COMMIT;

-- =============================================================================
-- Rollback (run manually only if this change must be undone):
--
-- BEGIN;
-- ALTER TABLE organizations
--   DROP COLUMN email_recipients, DROP COLUMN gmail_app_password_enc,
--   DROP COLUMN gmail_address, DROP COLUMN bulletin_start_number,
--   DROP COLUMN place_name, DROP COLUMN doc_symbol, DROP COLUMN file_code;
-- ALTER TABLE users DROP COLUMN signature_path;
-- ALTER TABLE users DROP CONSTRAINT chk_users_organization_by_role;
-- ALTER TABLE users ALTER COLUMN organization_id SET NOT NULL;  -- fails if a SYSTEM_ADMIN exists
-- COMMIT;
-- =============================================================================

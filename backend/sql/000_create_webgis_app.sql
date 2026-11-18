-- =============================================================================
-- 000_create_webgis_app.sql
-- FULL, CURRENT schema of the app database (DB_APP_NAME = webgis_app):
-- every table, constraint and index, plus the lookup data (roles, titles,
-- organizations). Use it to build an EMPTY database from scratch.
--
-- RULE: whenever a new table/column/constraint is added (in a numbered file
-- 001, 002, ...), the same change is ALSO written here, so this file always
-- matches the latest structure. Last synced with: 001 (2026-11-18).
--
-- Which file to run?
--   * Brand-new empty database  -> run ONLY this file (it already contains
--                                  everything from 001, 002, ...).
--   * Existing database         -> run the numbered files it has not had yet
--                                  (001, 002, ...), never this file.
--
-- Not included: user accounts (password hashes are never stored in git) and
-- sessions. See "First System Admin" at the end of the file.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Step 1 (run separately, connected to the "postgres" database).
-- CREATE DATABASE cannot run inside a transaction, so it is kept commented.
-- Replace <db_user> with the DB_USER from backend/.env.
-- ---------------------------------------------------------------------------
-- CREATE DATABASE webgis_app
--   OWNER <db_user>
--   ENCODING 'UTF8'
--   LC_COLLATE 'en_US.UTF-8'
--   LC_CTYPE 'en_US.UTF-8'
--   TEMPLATE template0;

-- ---------------------------------------------------------------------------
-- Step 2: connect to webgis_app and run everything below.
-- ---------------------------------------------------------------------------
BEGIN;

-- ===== roles: what a user is allowed to do ==================================
CREATE TABLE roles (
  id          serial       PRIMARY KEY,
  code        varchar(50)  NOT NULL UNIQUE,
  name        varchar(100) NOT NULL,
  description text
);

-- ===== titles: job title of a user ==========================================
CREATE TABLE titles (
  id          serial       PRIMARY KEY,
  code        varchar(50)  NOT NULL UNIQUE,
  name        varchar(100) NOT NULL,
  description text
);

-- ===== organizations: radar station / provincial station ====================
CREATE TABLE organizations (
  id                     serial       PRIMARY KEY,
  code                   varchar(50)  NOT NULL UNIQUE,
  name                   varchar(255) NOT NULL,
  organization_type      varchar(50)  NOT NULL
    CONSTRAINT organizations_organization_type_check
    CHECK (organization_type IN ('RADAR_STATION', 'PROVINCIAL_STATION')),
  province               varchar(100),
  address                text,
  active                 boolean      NOT NULL DEFAULT true,
  created_at             timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at             timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- Added in 001 (Bulletins):
  -- 4-char prefix of bulletin file names, e.g. PDIN_DONG_20260928_01h20.docx
  file_code              varchar(4)
    CONSTRAINT organizations_file_code_key UNIQUE
    CONSTRAINT chk_organizations_file_code CHECK (file_code ~ '^[A-Z0-9]{4}$'),
  -- Document symbol in the bulletin number / mail subject, e.g. RĐPĐ-913
  doc_symbol             varchar(20),
  -- Place name written before the date, e.g. "Pha Đin, ngày ..."
  place_name             varchar(100),
  -- First bulletin number of each year (set by the organization's Admin)
  bulletin_start_number  integer      NOT NULL DEFAULT 1
    CONSTRAINT chk_organizations_bulletin_start_number
    CHECK (bulletin_start_number >= 1),
  -- Gmail account used to send bulletins
  gmail_address          varchar(255),
  -- Gmail app password, ENCRYPTED by the backend (never plain text)
  gmail_app_password_enc text,
  -- Fixed list of recipient email addresses
  email_recipients       text[]       NOT NULL DEFAULT '{}'
);

-- ===== users ================================================================
CREATE TABLE users (
  id              bigserial    PRIMARY KEY,
  username        varchar(100) NOT NULL UNIQUE,
  password_hash   varchar(255) NOT NULL,
  full_name       varchar(255) NOT NULL,
  email           varchar(255),
  phone           varchar(30),
  title_id        integer      NOT NULL
    CONSTRAINT fk_users_title REFERENCES titles (id),
  role_id         integer      NOT NULL
    CONSTRAINT fk_users_role REFERENCES roles (id),
  -- NULL only for SYSTEM_ADMIN (see chk_users_organization_by_role, from 001)
  organization_id integer
    CONSTRAINT fk_users_organization REFERENCES organizations (id),
  active          boolean      NOT NULL DEFAULT true,
  last_login      timestamp,
  created_at      timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- Added in 001: path of the signature PNG on the server disk (NULL = none)
  signature_path  varchar(500),
  -- role_id = 1 is SYSTEM_ADMIN: SYSTEM_ADMIN <=> no organization
  CONSTRAINT chk_users_organization_by_role
    CHECK ((role_id = 1) = (organization_id IS NULL))
);

-- ===== sessions: refresh tokens (one row per login) =========================
-- Note: user_id is integer while users.id is bigint (kept as in production).
CREATE TABLE sessions (
  id            serial    PRIMARY KEY,
  user_id       integer   NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  refresh_token text      NOT NULL UNIQUE,
  expires_at    timestamp NOT NULL,
  created_at    timestamp DEFAULT CURRENT_TIMESTAMP,
  updated_at    timestamp DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_sessions_user_id ON sessions (user_id);

-- ===== Lookup data ===========================================================
-- Ids are written explicitly because the code relies on them
-- (e.g. role_id = 1 is SYSTEM_ADMIN in chk_users_organization_by_role).
INSERT INTO roles (id, code, name, description) VALUES
  (1, 'SYSTEM_ADMIN', 'System Admin', 'Quản trị hệ thống'),
  (2, 'ADMIN',        'Admin',        'Quản trị người dùng và bản tin'),
  (3, 'USER',         'User',         'Người tạo và quản lý bản tin');

INSERT INTO titles (id, code, name, description) VALUES
  (1, 'QTV', 'Observer',   'Quan trắc viên'),
  (2, 'DBV', 'Forecaster', 'Dự báo viên');

INSERT INTO organizations
  (id, code, name, organization_type, province, file_code, doc_symbol, place_name)
VALUES
  (1, 'RDPD', 'Trạm Ra đa thời tiết Pha Đin', 'RADAR_STATION', 'Điện Biên',
   'PDIN', 'RĐPĐ', 'Pha Đin'),
  (2, 'SOLA', 'Đài Khí tượng Thủy văn tỉnh Sơn La', 'PROVINCIAL_STATION', 'Sơn La',
   'SOLA', NULL, NULL);

-- Explicit ids do not move the sequences: move them past the inserted rows.
SELECT setval('roles_id_seq',         (SELECT max(id) FROM roles));
SELECT setval('titles_id_seq',        (SELECT max(id) FROM titles));
SELECT setval('organizations_id_seq', (SELECT max(id) FROM organizations));

COMMIT;

-- =============================================================================
-- First System Admin (manual, once)
-- /api/auth/signup requires a logged-in user, so the very first account must
-- be inserted by hand. Generate a bcrypt hash in the backend folder:
--   node -e "import('bcrypt').then(b => b.default.hash(process.argv[1], 10).then(console.log))" "<password>"
-- then (never commit the real hash or password):
--
-- INSERT INTO users (username, password_hash, full_name, title_id, role_id, organization_id)
-- VALUES ('<username>', '<bcrypt hash>', '<full name>', 1, 1, NULL);
-- =============================================================================

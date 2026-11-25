-- =============================================================================
-- 002_titles_by_organization_type.sql
-- Bulletins feature, extra step 1.7c (2026-11-25).
-- Target database: the app DB (DB_APP_NAME, e.g. webgis_app). NOT the Geo DB.
--
-- Rule: a user's title must match the type of their organization:
--   RADAR_STATION      -> QTV (Quan trắc viên) only
--   PROVINCIAL_STATION -> DBV (Dự báo viên) only
-- The rule is stored as data (titles.organization_type) so a new title can be
-- added later without changing code. NULL = the title fits every type.
-- The backend checks the rule when creating or editing a user; SYSTEM_ADMIN
-- (no organization) is not concerned.
--
-- What it does:
--   1. Add titles.organization_type (same allowed values as organizations).
--   2. Set it for QTV and DBV; also set the Vietnamese names.
--
-- Runs in one transaction: either everything is applied or nothing is.
-- Not re-runnable: a second run fails (column already exists) and rolls back.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Before running: users that would break the rule (expected: no rows).
-- Run this SELECT alone first. If it returns rows, fix those users' title or
-- organization before applying the rest.
-- ---------------------------------------------------------------------------
-- SELECT u.id, u.username, o.code AS organization, o.organization_type,
--        t.code AS title
-- FROM users u
-- JOIN organizations o ON o.id = u.organization_id
-- JOIN titles t ON t.id = u.title_id
-- WHERE NOT (
--   (o.organization_type = 'RADAR_STATION'      AND t.code = 'QTV') OR
--   (o.organization_type = 'PROVINCIAL_STATION' AND t.code = 'DBV')
-- );

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. titles.organization_type
-- ---------------------------------------------------------------------------
ALTER TABLE titles
  ADD COLUMN organization_type varchar(50)
    CONSTRAINT chk_titles_organization_type
    CHECK (organization_type IN ('RADAR_STATION', 'PROVINCIAL_STATION'));

-- ---------------------------------------------------------------------------
-- 2. Data: which organization type each title belongs to, Vietnamese names
-- ---------------------------------------------------------------------------
UPDATE titles
SET organization_type = 'RADAR_STATION', name = 'Quan trắc viên'
WHERE code = 'QTV';

UPDATE titles
SET organization_type = 'PROVINCIAL_STATION', name = 'Dự báo viên'
WHERE code = 'DBV';

COMMIT;

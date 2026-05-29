-- Two Postgres roles. Run by a superuser (Neon's owner role is fine).
DO $$ BEGIN
  CREATE ROLE app_admin BYPASSRLS NOLOGIN;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE ROLE app_user NOLOGIN;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Schema-level usage
GRANT USAGE ON SCHEMA public TO app_admin, app_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO app_admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user, app_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;

-- Enable RLS on tenant-scoped tables
ALTER TABLE organizations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members    ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log      ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_events  ENABLE ROW LEVEL SECURITY;

-- Tenant isolation policies
CREATE POLICY tenant_isolation ON organizations
  USING (id = current_setting('app.org_id', true)::uuid)
  WITH CHECK (id = current_setting('app.org_id', true)::uuid);

CREATE POLICY tenant_isolation ON users
  USING (org_id = current_setting('app.org_id', true)::uuid)
  WITH CHECK (org_id = current_setting('app.org_id', true)::uuid);

CREATE POLICY tenant_isolation ON org_members
  USING (org_id = current_setting('app.org_id', true)::uuid)
  WITH CHECK (org_id = current_setting('app.org_id', true)::uuid);

CREATE POLICY tenant_isolation ON audit_log
  USING (org_id = current_setting('app.org_id', true)::uuid)
  WITH CHECK (org_id = current_setting('app.org_id', true)::uuid);

CREATE POLICY tenant_isolation ON domain_events
  USING (org_id = current_setting('app.org_id', true)::uuid)
  WITH CHECK (org_id = current_setting('app.org_id', true)::uuid);

-- audit_log is append-only for app_user
REVOKE UPDATE, DELETE ON audit_log FROM app_user;

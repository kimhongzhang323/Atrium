-- RLS for all tenant-scoped tables added in Stages 2–6.
-- Every listed table carries org_id; the policy is uniform.
-- Idempotent: drops and recreates the policy on each run.

DO $$
DECLARE
  t text;
  tenant_tables text[] := ARRAY[
    -- Stage 2
    'events', 'tasks', 'task_comments', 'event_members',
    -- Stage 3
    'departments', 'invitations',
    -- Stage 4
    'sponsors', 'sponsor_contacts', 'sponsor_interactions',
    'budget_lines', 'invoices', 'invoice_line_items',
    'approvals', 'payment_records',
    -- Stage 5
    'registrations', 'registration_check_ins',
    'draw_entries', 'draw_results',
    'inventory_items', 'inventory_movements',
    'file_links', 'file_permissions', 'file_access_log', 'file_versions',
    'signature_requests', 'signature_request_signers',
    -- Stage 6
    'event_snapshots', 'ai_signals', 'notifications', 'notification_preferences'
  ];
BEGIN
  FOREACH t IN ARRAY tenant_tables LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON %I TO app_user', t);
    EXECUTE format('GRANT ALL ON %I TO app_admin', t);
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I', t);
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON %I '
      || 'USING (org_id = current_setting(''app.org_id'', true)::uuid) '
      || 'WITH CHECK (org_id = current_setting(''app.org_id'', true)::uuid)',
      t
    );
  END LOOP;
END $$;

-- Append-only logs for app_user (mirrors audit_log).
REVOKE UPDATE, DELETE ON file_access_log FROM app_user;

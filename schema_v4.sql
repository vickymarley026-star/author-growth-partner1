-- Run AFTER schema_v3.sql. Step 1 is safe to run now.
-- STEP 1: harden the admin check functions
create or replace function is_admin() returns bool language sql security definer set search_path=public stable as $$
  select exists(select 1 from admins where user_id=auth.uid()) $$;
create or replace function is_admin_user() returns bool language sql security definer set search_path=public stable as $$
  select exists(select 1 from admins where user_id=auth.uid()) $$;

-- STEP 2 (run ONLY after you enabled two-factor in Admin > Security and logged in with a code):
-- this makes the DATABASE itself refuse admin actions unless the session passed two-factor.
-- create or replace function is_admin() returns bool language sql security definer set search_path=public stable as $$
--   select exists(select 1 from admins where user_id=auth.uid()) and coalesce(auth.jwt()->>'aal','aal1')='aal2' $$;

-- Run in Supabase: SQL Editor > New query > paste > Run
create table posts(id uuid primary key default gen_random_uuid(),title text,category text,excerpt text,body text,image_url text,read_min int default 7,published bool default true,created_at timestamptz default now());
create table projects(id uuid primary key default gen_random_uuid(),title text,kind text default 'A+ content design',image_url text,sort int default 0);
create table reviews(id uuid primary key default gen_random_uuid(),name text,role text,book text,rating int default 5,text text,approved bool default false,created_at timestamptz default now());
create table content(key text primary key,value text);
create table products(id uuid primary key default gen_random_uuid(),name text,plan text default 'monthly',price_kobo int,days int default 30,active bool default true);
create table orders(id uuid primary key default gen_random_uuid(),ref text unique,email text,product_id uuid references products(id),amount_kobo int,status text default 'pending',code text,created_at timestamptz default now());
create table codes(id uuid primary key default gen_random_uuid(),code text unique,product_id uuid references products(id),status text default 'unused',expires_at timestamptz,order_ref text);
create table admins(user_id uuid primary key references auth.users(id));
create function is_admin() returns bool language sql security definer as $$ select exists(select 1 from admins where user_id=auth.uid()) $$;
do $$ declare t text; begin foreach t in array array['posts','projects','reviews','content','products','orders','codes','admins'] loop
 execute format('alter table %I enable row level security',t);
 execute format('create policy "admin all" on %I for all using (is_admin()) with check (is_admin())',t); end loop; end $$;
create policy "public read" on posts for select using (published);
create policy "public read" on projects for select using (true);
create policy "public read" on reviews for select using (approved);
create policy "public submit" on reviews for insert with check (approved=false);
create policy "public read" on content for select using (true);
create policy "public read" on products for select using (active);
-- After creating your admin user in Authentication > Users, run:
-- insert into admins select id from auth.users where email='YOUR_EMAIL';

-- Run AFTER schema.sql (Supabase > SQL Editor)
create table pages(id uuid primary key default gen_random_uuid(),slug text unique not null,title text,blocks jsonb default '[]',published bool default true,in_nav bool default false,sort int default 0);
create table threads(id uuid primary key default gen_random_uuid(),token uuid unique default gen_random_uuid(),name text,email text,unread bool default true,last_at timestamptz default now());
create table messages(id uuid primary key default gen_random_uuid(),thread_id uuid references threads(id) on delete cascade,sender text,body text,created_at timestamptz default now());
create table notifications(id uuid primary key default gen_random_uuid(),type text,title text,body text,read bool default false,created_at timestamptz default now());
do $$ declare t text; begin foreach t in array array['pages','threads','messages','notifications'] loop
 execute format('alter table %I enable row level security',t);
 execute format('create policy "admin all" on %I for all using (is_admin()) with check (is_admin())',t); end loop; end $$;
create policy "public read" on pages for select using (published);
-- Visitor inbox: visitors never touch tables directly, only these two functions (identified by a secret token)
create function send_message(p_token uuid,p_name text,p_email text,p_body text) returns uuid language plpgsql security definer as $$
declare t threads;
begin
  select * into t from threads where token=p_token;
  if t.id is null then insert into threads(name,email) values(left(p_name,80),left(p_email,120)) returning * into t; end if;
  insert into messages(thread_id,sender,body) values(t.id,'visitor',left(p_body,2000));
  update threads set unread=true,last_at=now() where id=t.id;
  insert into notifications(type,title,body) values('message','New message from '||coalesce(t.name,'a visitor'),left(p_body,140));
  return t.token;
end $$;
create function get_thread(p_token uuid) returns setof messages language sql security definer as $$
  select m.* from messages m join threads t on t.id=m.thread_id where t.token=p_token order by m.created_at $$;
grant execute on function send_message(uuid,text,text,text), get_thread(uuid) to anon, authenticated;
create function notify_review() returns trigger language plpgsql security definer as $$
begin insert into notifications(type,title,body) values('review','New review from '||coalesce(new.name,'someone'),left(coalesce(new.text,''),140)); return new; end $$;
create trigger t_rev after insert on reviews for each row execute function notify_review();
create function notify_order() returns trigger language plpgsql security definer as $$
begin if new.status='paid' and old.status is distinct from 'paid' then insert into notifications(type,title,body) values('order','Payment received',coalesce(new.email,'')||' paid '||(new.amount_kobo/100)); end if; return new; end $$;
create trigger t_ord after update on orders for each row execute function notify_order();
alter publication supabase_realtime add table messages, notifications;

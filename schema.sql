-- Run AFTER schema_v4.sql: visitor accounts, profiles (name + picture), account-based inbox
create table profiles(id uuid primary key references auth.users(id) on delete cascade,display_name text,avatar_url text,created_at timestamptz default now(),
  constraint av_len check (length(coalesce(avatar_url,''))<=250000),constraint dn_len check (length(coalesce(display_name,''))<=60));
alter table profiles enable row level security;
create policy "own profile read" on profiles for select using (id=auth.uid());
create policy "own profile update" on profiles for update using (id=auth.uid()) with check (id=auth.uid());
create policy "admin all" on profiles for all using (is_admin()) with check (is_admin());
create function handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into profiles(id,display_name) values(new.id,left(coalesce(new.raw_user_meta_data->>'name',split_part(new.email,'@',1)),60)) on conflict do nothing; return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();
insert into profiles(id,display_name) select id,split_part(email,'@',1) from auth.users on conflict do nothing;
create function sync_thread_name() returns trigger language plpgsql security definer set search_path=public as $$
begin update threads set name=new.display_name where user_id=new.id; return new; end $$;
create trigger t_prof after update on profiles for each row execute function sync_thread_name();

-- threads belong to accounts
alter table threads add column user_id uuid unique references auth.users(id) on delete cascade;
create policy "own thread read" on threads for select using (user_id=auth.uid());
create policy "own msg read" on messages for select using (thread_id in (select id from threads where user_id=auth.uid()));
create policy "own msg send" on messages for insert with check (sender='visitor' and kind in ('text','media') and offer is null
  and length(coalesce(body,''))<=2000 and length(coalesce(media_url,''))<=2500000 and thread_id in (select id from threads where user_id=auth.uid()));
create function my_thread() returns uuid language plpgsql security definer set search_path=public as $$
declare t uuid; n text;
begin
  if auth.uid() is null then raise exception 'login required'; end if;
  select id into t from threads where user_id=auth.uid();
  if t is null then
    select display_name into n from profiles where id=auth.uid();
    insert into threads(user_id,name,email) values(auth.uid(),coalesce(n,'Member'),(select email from auth.users where id=auth.uid())) returning id into t;
  end if;
  return t;
end $$;
grant execute on function my_thread() to authenticated;

-- notifications + auto-responder now run as a trigger on every visitor message
create function on_visitor_msg() returns trigger language plpgsql security definer set search_path=public as $$
declare t threads; ar text;
begin
  if new.sender<>'visitor' then return new; end if;
  select * into t from threads where id=new.thread_id;
  update threads set unread=true,last_at=now() where id=t.id;
  insert into notifications(type,title,body) values('message','New message from '||coalesce(t.name,'a member'),left(coalesce(new.body,'Sent a file'),140));
  if (select value from content where key='ar:enabled')='1' and not exists(select 1 from messages where thread_id=t.id and sender='admin' and created_at>now()-interval '6 hours') then
    select value into ar from content where key='ar:message';
    insert into messages(thread_id,sender,kind,body) values(t.id,'admin','auto',coalesce(ar,'Thanks for your message! I will reply soon.'));
  end if;
  return new;
end $$;
create trigger t_vmsg after insert on messages for each row execute function on_visitor_msg();

-- remove the old anonymous (token) chat functions
drop function if exists send_message(uuid,text,text,text,text,text,text);
drop function if exists get_thread(uuid);
drop function if exists respond_offer(uuid,uuid,bool);
create function respond_offer(p_id uuid,p_accept bool) returns void language plpgsql security definer set search_path=public as $$
declare m messages; t threads;
begin
  select * into t from threads where user_id=auth.uid(); if t.id is null then raise exception 'no thread'; end if;
  select * into m from messages where id=p_id and thread_id=t.id and kind='offer';
  if m.id is null or coalesce(m.offer->>'status','pending')<>'pending' then return; end if;
  update messages set offer=jsonb_set(offer,'{status}',to_jsonb(case when p_accept then 'accepted' else 'declined' end)) where id=m.id;
  insert into messages(thread_id,sender,kind,body) values(t.id,'visitor','text',case when p_accept then 'I accepted your offer: ' else 'I declined your offer: ' end||(m.offer->>'title'));
  insert into notifications(type,title,body) values('order',case when p_accept then 'Offer accepted' else 'Offer declined' end,coalesce(t.name,'A member')||' - '||(m.offer->>'title')||' ('||coalesce(m.offer->>'currency','')||' '||(m.offer->>'price')||')');
end $$;
grant execute on function respond_offer(uuid,bool) to authenticated;

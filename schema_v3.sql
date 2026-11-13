-- Run AFTER schema_v2.sql: chat media, custom offers, quick replies, auto-responder
alter table messages add column kind text default 'text', add column media_url text, add column media_type text, add column offer jsonb;
create table quick_replies(id uuid primary key default gen_random_uuid(),title text,body text,sort int default 0);
alter table quick_replies enable row level security;
create policy "admin all" on quick_replies for all using (is_admin()) with check (is_admin());
insert into quick_replies(title,body,sort) values
('Greeting','Hi! Thanks for reaching out. Tell me about your book: genre, your Amazon link if it is live, and what you want to achieve.',1),
('Pricing','Pricing depends on the scope. Tell me which service you need and I will send you a custom offer with the timeline and price.',2),
('Next steps','Great! I will send a custom offer with the scope, timeline and price. Accept it in this chat and I will get started.',3);
drop function if exists send_message(uuid,text,text,text);
create function send_message(p_token uuid,p_name text,p_email text,p_body text,p_kind text default 'text',p_media text default null,p_mtype text default null) returns uuid language plpgsql security definer as $$
declare t threads; ar text;
begin
  if p_media is not null and length(p_media)>2500000 then raise exception 'File too large'; end if;
  if p_kind not in ('text','media') then raise exception 'bad kind'; end if;
  select * into t from threads where token=p_token;
  if t.id is null then insert into threads(name,email) values(left(p_name,80),left(p_email,120)) returning * into t; end if;
  insert into messages(thread_id,sender,kind,body,media_url,media_type) values(t.id,'visitor',p_kind,left(p_body,2000),p_media,left(p_mtype,100));
  update threads set unread=true,last_at=now() where id=t.id;
  insert into notifications(type,title,body) values('message','New message from '||coalesce(t.name,'a visitor'),left(coalesce(p_body,'Sent a file'),140));
  if (select value from content where key='ar:enabled')='1' and not exists(select 1 from messages where thread_id=t.id and sender='admin' and created_at>now()-interval '6 hours') then
    select value into ar from content where key='ar:message';
    insert into messages(thread_id,sender,kind,body) values(t.id,'admin','auto',coalesce(ar,'Thanks for your message! I will reply soon.'));
  end if;
  return t.token;
end $$;
grant execute on function send_message(uuid,text,text,text,text,text,text) to anon, authenticated;
create or replace function get_thread(p_token uuid) returns setof messages language sql security definer as $$
  select m.* from messages m join threads t on t.id=m.thread_id where t.token=p_token order by m.created_at $$;
create function respond_offer(p_token uuid,p_id uuid,p_accept bool) returns void language plpgsql security definer as $$
declare m messages; t threads;
begin
  select * into t from threads where token=p_token; if t.id is null then raise exception 'no thread'; end if;
  select * into m from messages where id=p_id and thread_id=t.id and kind='offer';
  if m.id is null or coalesce(m.offer->>'status','pending')<>'pending' then return; end if;
  update messages set offer=jsonb_set(offer,'{status}',to_jsonb(case when p_accept then 'accepted' else 'declined' end)) where id=m.id;
  insert into messages(thread_id,sender,kind,body) values(t.id,'visitor','text',case when p_accept then 'I accepted your offer: ' else 'I declined your offer: ' end||(m.offer->>'title'));
  update threads set unread=true,last_at=now() where id=t.id;
  insert into notifications(type,title,body) values('order',case when p_accept then 'Offer accepted' else 'Offer declined' end,coalesce(t.name,'A visitor')||' - '||(m.offer->>'title')||' ('||coalesce(m.offer->>'currency','')||' '||(m.offer->>'price')||')');
end $$;
grant execute on function respond_offer(uuid,uuid,bool) to anon, authenticated;

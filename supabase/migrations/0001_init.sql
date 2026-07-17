-- Domain: Account = auth.users; Personas, Events, Tags, Attachments
-- RLS: every row is scoped to account_id = auth.uid()

create table public.personas (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  is_self boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index personas_one_self_per_account
  on public.personas (account_id)
  where is_self = true;

create index personas_account_id_idx on public.personas (account_id);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  persona_id uuid not null references public.personas (id) on delete cascade,
  account_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  body text not null default '',
  occurred_on date not null,
  recorded_at timestamptz not null default now()
);

create index events_persona_occurred_on_idx
  on public.events (persona_id, occurred_on desc);

create index events_account_id_idx on public.events (account_id);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (account_id, name)
);

create index tags_account_id_idx on public.tags (account_id);

create table public.event_tags (
  event_id uuid not null references public.events (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (event_id, tag_id)
);

create index event_tags_tag_id_idx on public.event_tags (tag_id);

create table public.attachments (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  account_id uuid not null references auth.users (id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  content_type text not null,
  size_bytes bigint not null,
  created_at timestamptz not null default now()
);

create index attachments_event_id_idx on public.attachments (event_id);
create index attachments_account_id_idx on public.attachments (account_id);

alter table public.personas enable row level security;
alter table public.events enable row level security;
alter table public.tags enable row level security;
alter table public.event_tags enable row level security;
alter table public.attachments enable row level security;

create policy "personas_own"
  on public.personas for all
  using (account_id = auth.uid())
  with check (account_id = auth.uid());

create policy "events_own"
  on public.events for all
  using (account_id = auth.uid())
  with check (account_id = auth.uid());

create policy "tags_own"
  on public.tags for all
  using (account_id = auth.uid())
  with check (account_id = auth.uid());

create policy "event_tags_own"
  on public.event_tags for all
  using (
    exists (
      select 1 from public.events e
      where e.id = event_id and e.account_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.events e
      where e.id = event_id and e.account_id = auth.uid()
    )
  );

create policy "attachments_own"
  on public.attachments for all
  using (account_id = auth.uid())
  with check (account_id = auth.uid());

-- Self Persona on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.personas (account_id, name, is_self)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1), 'Me'),
    true
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Private attachments bucket (create in dashboard or via API):
-- insert into storage.buckets (id, name, public) values ('attachments', 'attachments', false);

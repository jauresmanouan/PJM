-- Pour la Joie de Marie : base de données (Supabase / Postgres)
-- À exécuter dans Supabase > SQL Editor. Le script peut être rejoué sans risque.
-- Aucune table n'est lisible depuis le navigateur : tout passe par les fonctions /api (clé service_role).

-- 1. Éditions ---------------------------------------------------------------
create table if not exists public.editions (
  year integer primary key check (year between 2024 and 2100),
  event_date date not null,
  goal integer not null default 1000,
  registration_open boolean not null default true
);

insert into public.editions (year, event_date, goal, registration_open) values
  (2024, '2024-12-08', 1000, false),
  (2025, '2025-12-08', 1000, false),
  (2026, '2026-12-08', 1000, true)
on conflict (year) do nothing;

-- 2. Participations ------------------------------------------------------------
create table if not exists public.participations (
  edition_year integer not null references public.editions (year),
  email text not null,
  firstname text not null,
  name text not null,
  quantity integer not null check (quantity between 1 and 100000),
  country char(2),
  contact_method text check (contact_method in ('whatsapp', 'telegram')),
  contact text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (edition_year, email)
);

-- Lien vers les éditions (ajouté si la table existait déjà sans lui).
do $$
begin
  alter table public.participations
    add constraint participations_edition_year_fkey
    foreign key (edition_year) references public.editions (year);
exception when duplicate_object then null;
end $$;

-- Colonnes de désabonnement (ajoutées si la table existait déjà).
alter table public.participations
  add column if not exists unsubscribe_token uuid not null default gen_random_uuid(),
  add column if not exists unsubscribed_at timestamptz,
  add column if not exists unsubscribe_reason text
    check (unsubscribe_reason in ('user', 'bounce', 'complaint'));

create unique index if not exists participations_unsubscribe_token_key
  on public.participations (unsubscribe_token);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists participations_set_updated_at on public.participations;
create trigger participations_set_updated_at
  before update on public.participations
  for each row execute function public.set_updated_at();

-- 3. Journal des emails ---------------------------------------------------------
-- Une ligne par (édition, destinataire, type d'email) : garantit qu'un rappel ne part qu'une fois.
create table if not exists public.email_logs (
  id bigint generated always as identity primary key,
  edition_year integer not null,
  email text not null,
  kind text not null check (kind in
    ('confirmation', 'relance_j14', 'relance_j7', 'relance_j1', 'jour_j', 'merci')),
  status text not null default 'pending'
    check (status in ('pending', 'sent', 'failed', 'bounced', 'complained')),
  resend_id text,
  error text,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  foreign key (edition_year, email)
    references public.participations (edition_year, email) on delete cascade,
  unique (edition_year, email, kind)
);

create index if not exists email_logs_resend_id_idx on public.email_logs (resend_id);

-- 4. Sécurité : aucun accès public ------------------------------------------------
alter table public.editions enable row level security;
alter table public.participations enable row level security;
alter table public.email_logs enable row level security;
revoke all on public.editions, public.participations, public.email_logs from anon, authenticated;

-- 5. Fonctions utilisées par /api ----------------------------------------------------
create or replace function public.participation_stats(edition_year integer)
returns jsonb
language sql
stable
security invoker
as $$
  select jsonb_build_object(
    'participants', count(*),
    'total_quantity', coalesce(sum(quantity), 0)
  )
  from public.participations
  where participations.edition_year = $1;
$$;

-- Destinataires à qui envoyer un email de relance :
--   non désabonnés, inscrits depuis au moins p_min_age,
--   sans email de ce type déjà envoyé (ou en cours depuis moins d'une heure),
--   et sans autre email reçu pendant p_cooldown (évite deux mails à deux jours d'écart).
create or replace function public.participants_due(
  p_year integer,
  p_kind text,
  p_min_age interval,
  p_cooldown interval
)
returns table (
  email text,
  firstname text,
  name text,
  quantity integer,
  unsubscribe_token uuid
)
language sql
stable
security invoker
as $$
  select p.email, p.firstname, p.name, p.quantity, p.unsubscribe_token
  from public.participations p
  where p.edition_year = p_year
    and p.unsubscribed_at is null
    and p.updated_at <= now() - p_min_age
    and not exists (
      select 1 from public.email_logs l
      where l.edition_year = p.edition_year
        and l.email = p.email
        and l.kind = p_kind
        and (l.status in ('sent', 'bounced', 'complained')
             or (l.status = 'pending' and l.created_at > now() - interval '1 hour'))
    )
    and not exists (
      select 1 from public.email_logs l
      where l.edition_year = p.edition_year
        and l.email = p.email
        and l.status = 'sent'
        and l.sent_at > now() - p_cooldown
    );
$$;

revoke all on function public.participation_stats(integer) from public, anon, authenticated;
revoke all on function public.participants_due(integer, text, interval, interval)
  from public, anon, authenticated;
grant execute on function public.participation_stats(integer) to service_role;
grant execute on function public.participants_due(integer, text, interval, interval) to service_role;


-- 6. Statistiques en direct : répartition par pays ---------------------------------
-- Indicatifs téléphoniques internationaux -> pays (sert quand le pays n'est pas renseigné).
create table if not exists public.dial_codes (
  prefix text primary key,
  iso char(2) not null
);
alter table public.dial_codes enable row level security;
revoke all on public.dial_codes from anon, authenticated;
insert into public.dial_codes (prefix, iso) values
  ('225', 'CI'),
  ('237', 'CM'),
  ('226', 'BF'),
  ('221', 'SN'),
  ('241', 'GA'),
  ('229', 'BJ'),
  ('228', 'TG'),
  ('223', 'ML'),
  ('224', 'GN'),
  ('227', 'NE'),
  ('243', 'CD'),
  ('242', 'CG'),
  ('235', 'TD'),
  ('236', 'CF'),
  ('212', 'MA'),
  ('213', 'DZ'),
  ('216', 'TN'),
  ('234', 'NG'),
  ('233', 'GH'),
  ('238', 'CV'),
  ('240', 'GQ'),
  ('250', 'RW'),
  ('257', 'BI'),
  ('261', 'MG'),
  ('33', 'FR'),
  ('32', 'BE'),
  ('41', 'CH'),
  ('44', 'GB'),
  ('49', 'DE'),
  ('39', 'IT'),
  ('34', 'ES'),
  ('351', 'PT'),
  ('352', 'LU'),
  ('31', 'NL'),
  ('1', 'US'),
  ('7', 'RU')
on conflict (prefix) do nothing;

-- Pays d'un participant : pays déclaré, sinon déduit du numéro (méthode validée sur l'édition 2025 : 93 sur 93).
create or replace function public.infer_country(p_country text, p_contact text)
returns char(2)
language sql
stable
security invoker
as $$
  with n as (
    select case
      when regexp_replace(coalesce(p_contact, ''), '[^0-9+]', '', 'g') like '00%'
        then '+' || substr(regexp_replace(coalesce(p_contact, ''), '[^0-9+]', '', 'g'), 3)
      else regexp_replace(coalesce(p_contact, ''), '[^0-9+]', '', 'g')
    end as v
  )
  select coalesce(
    nullif(upper(trim(coalesce(p_country, ''))), '')::char(2),
    (select d.iso from public.dial_codes d, n
       where n.v like '+%' and substr(n.v, 2) like d.prefix || '%'
       order by length(d.prefix) desc limit 1),
    (select d.iso from public.dial_codes d, n
       where n.v not like '+%' and length(n.v) >= 11 and n.v like d.prefix || '%'
       order by length(d.prefix) desc limit 1),
    (select 'FR'::char(2) from n where n.v not like '+%' and length(n.v) = 10 and left(n.v, 2) = '06'),
    (select 'CI'::char(2) from n where n.v not like '+%' and length(n.v) = 10 and left(n.v, 2) in ('01', '05', '07')),
    (select 'CM'::char(2) from n where n.v not like '+%' and length(n.v) = 9 and left(n.v, 1) = '6')
  );
$$;

-- Tout ce qu'affiche le bilan d'une édition, en un appel.
create or replace function public.edition_breakdown(p_year integer)
returns jsonb
language sql
stable
security invoker
as $$
  with p as (
    select quantity, public.infer_country(country, contact) as pays
    from public.participations
    where edition_year = p_year
  )
  select jsonb_build_object(
    'participants', (select count(*) from p),
    'total_quantity', (select coalesce(sum(quantity), 0) from p),
    'countries', coalesce((
      select jsonb_agg(jsonb_build_object('code', pays, 'count', n, 'roses', r) order by n desc, r desc, pays)
      from (select pays, count(*) as n, sum(quantity) as r from p where pays is not null group by pays) g
    ), '[]'::jsonb),
    'unknown', (select jsonb_build_object('count', count(*), 'roses', coalesce(sum(quantity), 0)) from p where pays is null)
  );
$$;

revoke all on function public.infer_country(text, text) from public, anon, authenticated;
revoke all on function public.edition_breakdown(integer) from public, anon, authenticated;
grant execute on function public.infer_country(text, text) to service_role;
grant execute on function public.edition_breakdown(integer) to service_role;

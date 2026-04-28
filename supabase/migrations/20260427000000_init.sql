-- =============================================================
-- 犬旅日和 初期マイグレーション
-- 設計書 v2 §6 に準拠
-- =============================================================

-- 拡張
create extension if not exists "uuid-ossp";
create extension if not exists pg_trgm;
create extension if not exists postgis;
create extension if not exists pgcrypto;

-- =============================================================
-- ENUMs
-- =============================================================
create type hotel_type as enum (
  'hotel', 'ryokan', 'pension', 'cottage',
  'glamping', 'minshuku', 'resort', 'other'
);

create type hotel_status as enum (
  'draft', 'reviewing', 'published', 'archived'
);

create type dog_size as enum (
  'extra_small', 'small', 'medium', 'large', 'extra_large'
);

create type source_type as enum (
  'rakuten', 'jalan', 'rurubu', 'ikkyu', 'official', 'manual'
);

create type queue_status as enum (
  'pending', 'approved', 'skipped', 'merged'
);

create type booking_provider as enum (
  'rakuten', 'jalan', 'ikkyu', 'rurubu', 'direct'
);

create type amenity_category as enum (
  'dog_facility', 'general', 'room'
);

create type article_category as enum (
  'area_guide', 'tips', 'ranking', 'news', 'feature'
);

-- =============================================================
-- 共通: updated_at 自動更新
-- =============================================================
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

-- =============================================================
-- regions (地方マスタ)
-- =============================================================
create table regions (
  id          uuid primary key default gen_random_uuid(),
  name        varchar(50) not null,
  slug        varchar(50) not null unique,
  sort_order  int not null default 0,
  created_at  timestamptz default now()
);

-- =============================================================
-- prefectures (都道府県マスタ)
-- =============================================================
create table prefectures (
  id          uuid primary key default gen_random_uuid(),
  region_id   uuid not null references regions(id),
  name        varchar(20) not null,
  slug        varchar(50) not null unique,
  lat         decimal(10,7),
  lng         decimal(10,7),
  created_at  timestamptz default now()
);

create index idx_prefectures_region on prefectures(region_id);

-- =============================================================
-- hotels (宿マスタ)
-- =============================================================
create table hotels (
  id              uuid primary key default gen_random_uuid(),
  prefecture_id   uuid not null references prefectures(id),
  name            varchar(200) not null,
  slug            varchar(200) not null unique,
  description     text,
  postal_code     varchar(10),
  address         varchar(300) not null,
  lat             decimal(10,7),
  lng             decimal(10,7),
  geo             geography(POINT, 4326),
  phone           varchar(20),
  website_url     text,
  hotel_type      hotel_type not null default 'other',
  checkin_time    time,
  checkout_time   time,
  room_count      int,
  pet_room_count  int,
  parking         varchar(100),
  access          text,
  status          hotel_status not null default 'draft',
  featured_order  int,
  view_count      int not null default 0,
  dedup_hash      varchar(64) unique,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index idx_hotels_prefecture on hotels(prefecture_id);
create index idx_hotels_status     on hotels(status) where status = 'published';
create index idx_hotels_geo        on hotels using gist(geo);
create index idx_hotels_name_trgm  on hotels using gin(name gin_trgm_ops);
create index idx_hotels_addr_trgm  on hotels using gin(address gin_trgm_ops);

-- lat/lng → geo 自動同期
create or replace function sync_hotel_geo() returns trigger as $$
begin
  if new.lat is not null and new.lng is not null then
    new.geo := ST_SetSRID(ST_MakePoint(new.lng, new.lat), 4326)::geography;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger hotels_sync_geo
  before insert or update of lat, lng on hotels
  for each row execute function sync_hotel_geo();

create trigger hotels_updated_at
  before update on hotels
  for each row execute function set_updated_at();

-- =============================================================
-- hotel_dog_policies (1:1)
-- =============================================================
create table hotel_dog_policies (
  hotel_id              uuid primary key references hotels(id) on delete cascade,
  accepted_sizes        dog_size[] not null default '{}',
  max_weight_kg         decimal(5,1),
  max_dogs              int not null default 1,
  breed_restriction     text,
  dog_fee               int,
  dog_fee_note          text,
  dog_free_in_room      boolean default false,
  required_vaccinations text[],
  dog_areas             text[],
  notes                 text,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

create index idx_dog_policies_sizes on hotel_dog_policies using gin(accepted_sizes);

create trigger dog_policies_updated_at
  before update on hotel_dog_policies
  for each row execute function set_updated_at();

-- =============================================================
-- amenities (設備マスタ)
-- =============================================================
create table amenities (
  id          uuid primary key default gen_random_uuid(),
  name        varchar(100) not null,
  slug        varchar(100) not null unique,
  category    amenity_category not null,
  icon        varchar(50),
  sort_order  int default 0
);

-- =============================================================
-- hotel_amenities (宿×設備 中間)
-- =============================================================
create table hotel_amenities (
  id          uuid primary key default gen_random_uuid(),
  hotel_id    uuid not null references hotels(id) on delete cascade,
  amenity_id  uuid not null references amenities(id),
  notes       text,
  unique(hotel_id, amenity_id)
);

create index idx_hotel_amenities_hotel on hotel_amenities(hotel_id);

-- =============================================================
-- hotel_images (Storage path保存)
-- =============================================================
create table hotel_images (
  id           uuid primary key default gen_random_uuid(),
  hotel_id     uuid not null references hotels(id) on delete cascade,
  storage_path text not null,
  alt_text     varchar(200),
  sort_order   int default 0,
  is_main      boolean default false,
  created_at   timestamptz default now()
);

create index idx_images_hotel_main on hotel_images(hotel_id) where is_main = true;
create index idx_images_hotel      on hotel_images(hotel_id);

-- =============================================================
-- booking_links (アフィリエイト出口)
-- =============================================================
create table booking_links (
  id            uuid primary key default gen_random_uuid(),
  hotel_id      uuid not null references hotels(id) on delete cascade,
  provider      booking_provider not null,
  affiliate_url text not null,
  is_active     boolean default true,
  unique(hotel_id, provider)
);

-- =============================================================
-- hotel_faqs
-- =============================================================
create table hotel_faqs (
  id          uuid primary key default gen_random_uuid(),
  hotel_id    uuid not null references hotels(id) on delete cascade,
  question    text not null,
  answer      text not null,
  sort_order  int default 0
);

create index idx_faqs_hotel on hotel_faqs(hotel_id);

-- =============================================================
-- hotel_sources (出典管理)
-- =============================================================
create table hotel_sources (
  id                uuid primary key default gen_random_uuid(),
  hotel_id          uuid not null references hotels(id) on delete cascade,
  source_type       source_type not null,
  source_url        text,
  source_id         varchar(100),
  affiliate_url     text,
  last_fetched_at   timestamptz,
  last_fetch_status varchar(20),
  unique(hotel_id, source_type)
);

create index idx_sources_type_id on hotel_sources(source_type, source_id);
create index idx_sources_hotel   on hotel_sources(hotel_id);

-- =============================================================
-- discovery_queue (人間レビュー待ち)
-- =============================================================
create table discovery_queue (
  id                uuid primary key default gen_random_uuid(),
  dedup_hash        varchar(64) not null unique,
  candidate_name    varchar(200) not null,
  candidate_address varchar(300),
  raw_payload       jsonb not null,
  discovered_by     varchar(50) not null,
  discovered_from   varchar(50) not null,
  status            queue_status not null default 'pending',
  slack_message_ts  varchar(50),
  resolved_hotel_id uuid references hotels(id),
  resolved_at       timestamptz,
  created_at        timestamptz default now()
);

create index idx_queue_status  on discovery_queue(status) where status = 'pending';
create index idx_queue_created on discovery_queue(created_at desc);

-- =============================================================
-- hotel_revisions (変更履歴)
-- =============================================================
create table hotel_revisions (
  id          bigserial primary key,
  hotel_id    uuid not null references hotels(id) on delete cascade,
  changed_by  varchar(100) not null,
  change_type varchar(20) not null,
  diff        jsonb not null,
  created_at  timestamptz default now()
);

create index idx_revisions_hotel on hotel_revisions(hotel_id, created_at desc);

-- =============================================================
-- agent_runs (エージェント実行ログ)
-- =============================================================
create table agent_runs (
  id            bigserial primary key,
  agent_name    varchar(50) not null,
  trigger_type  varchar(20) not null,
  started_at    timestamptz default now(),
  finished_at   timestamptz,
  status        varchar(20),
  stats         jsonb,
  error_message text
);

create index idx_agent_runs_started on agent_runs(started_at desc);

-- =============================================================
-- articles (記事)
-- =============================================================
create table articles (
  id              uuid primary key default gen_random_uuid(),
  title           varchar(200) not null,
  slug            varchar(200) not null unique,
  description     text,
  content         text not null,
  category        article_category not null,
  tags            text[],
  thumbnail_url   text,
  is_published    boolean default false,
  published_at    timestamptz,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index idx_articles_published on articles(is_published, published_at desc);

create trigger articles_updated_at
  before update on articles
  for each row execute function set_updated_at();

-- =============================================================
-- article_hotels (記事×宿 中間)
-- =============================================================
create table article_hotels (
  id          uuid primary key default gen_random_uuid(),
  article_id  uuid not null references articles(id) on delete cascade,
  hotel_id    uuid not null references hotels(id),
  sort_order  int default 0,
  unique(article_id, hotel_id)
);

-- =============================================================
-- RLS (Row Level Security)
-- =============================================================
-- 公開系: status='published' のみ anon で読める
alter table regions             enable row level security;
alter table prefectures         enable row level security;
alter table hotels              enable row level security;
alter table hotel_dog_policies  enable row level security;
alter table amenities           enable row level security;
alter table hotel_amenities     enable row level security;
alter table hotel_images        enable row level security;
alter table booking_links       enable row level security;
alter table hotel_faqs          enable row level security;
alter table articles            enable row level security;
alter table article_hotels      enable row level security;

-- 内部系: anon 不可、service_role のみ
alter table hotel_sources       enable row level security;
alter table hotel_revisions     enable row level security;
alter table discovery_queue     enable row level security;
alter table agent_runs          enable row level security;

-- マスタ: 全公開
create policy regions_public_read on regions
  for select to anon using (true);

create policy prefectures_public_read on prefectures
  for select to anon using (true);

create policy amenities_public_read on amenities
  for select to anon using (true);

-- hotels: status=published のみ
create policy hotels_public_read on hotels
  for select to anon using (status = 'published');

-- 子テーブル: 親hotelが公開なら公開
create policy dog_policies_public_read on hotel_dog_policies
  for select to anon using (
    exists (select 1 from hotels h where h.id = hotel_id and h.status = 'published')
  );

create policy hotel_amenities_public_read on hotel_amenities
  for select to anon using (
    exists (select 1 from hotels h where h.id = hotel_id and h.status = 'published')
  );

create policy hotel_images_public_read on hotel_images
  for select to anon using (
    exists (select 1 from hotels h where h.id = hotel_id and h.status = 'published')
  );

create policy booking_links_public_read on booking_links
  for select to anon using (
    is_active = true
    and exists (select 1 from hotels h where h.id = hotel_id and h.status = 'published')
  );

create policy hotel_faqs_public_read on hotel_faqs
  for select to anon using (
    exists (select 1 from hotels h where h.id = hotel_id and h.status = 'published')
  );

-- articles: is_published のみ
create policy articles_public_read on articles
  for select to anon using (is_published = true);

create policy article_hotels_public_read on article_hotels
  for select to anon using (
    exists (select 1 from articles a where a.id = article_id and a.is_published = true)
  );

-- 内部系（hotel_sources, hotel_revisions, discovery_queue, agent_runs）は
-- ポリシー無し = anon は全拒否、service_role のみアクセス可

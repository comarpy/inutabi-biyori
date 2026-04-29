-- ============================================================
-- 住所/電話単独の dedup hash を追加
-- duplicate判定で「名前は違うが同じ宿」を捕捉するため
-- ============================================================

-- hotels（既存マスター）に追加
alter table hotels
  add column address_dedup_hash varchar(64),
  add column phone_dedup_hash   varchar(64);

create index idx_hotels_address_hash on hotels(address_dedup_hash) where address_dedup_hash is not null;
create index idx_hotels_phone_hash   on hotels(phone_dedup_hash)   where phone_dedup_hash   is not null;

-- discovery_queue にも追加（再ディスカバリー時の検査用）
alter table discovery_queue
  add column address_dedup_hash varchar(64),
  add column phone_dedup_hash   varchar(64);

create index idx_queue_address_hash on discovery_queue(address_dedup_hash) where address_dedup_hash is not null;
create index idx_queue_phone_hash   on discovery_queue(phone_dedup_hash)   where phone_dedup_hash   is not null;

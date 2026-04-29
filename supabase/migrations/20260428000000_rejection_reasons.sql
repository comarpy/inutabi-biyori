-- ============================================================
-- discovery_queue に却下理由関連カラムを追加 (Phase 1)
-- 人間判断データを学習素材として蓄積する
-- ============================================================

create type rejection_category as enum (
  'business_hotel',          -- ビジネスホテル（実態が犬向きでない）
  'closed_or_uncertain',     -- 閉店・営業停止疑い
  'not_dog_friendly',        -- 犬対応が形式的・不十分
  'bad_data',                -- 情報が不正確・不完全
  'duplicate',               -- 既存と重複（dedup漏れ）
  'other'                    -- その他
);

alter table discovery_queue
  add column rejection_category rejection_category,
  add column rejection_reason   text,
  add column decided_by         text,
  add column decided_at         timestamptz;

-- インデックス（学習側で過去判断を集めるクエリを速くする）
create index idx_queue_decided           on discovery_queue(decided_at desc) where decided_at is not null;
create index idx_queue_rejection_category on discovery_queue(rejection_category) where rejection_category is not null;

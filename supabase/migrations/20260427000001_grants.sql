-- =============================================================
-- ロール権限付与
-- 「Automatically expose new tables = OFF」の場合、
-- 新規テーブルにロール権限が自動付与されないため明示的にGRANT
-- =============================================================

-- service_role: 全テーブル・全シーケンスに全権限
-- (RLSはバイパスするが、テーブル権限は別途必要)
grant all on all tables    in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant all on all functions in schema public to service_role;

-- 今後 supabase migration new で作るテーブルにもデフォルトで権限を付ける
alter default privileges in schema public grant all on tables    to service_role;
alter default privileges in schema public grant all on sequences to service_role;
alter default privileges in schema public grant all on functions to service_role;

-- anon: 公開対象テーブルのみSELECT
-- (RLSポリシーで更にstatus='published'などでフィルタ)
grant select on regions            to anon;
grant select on prefectures        to anon;
grant select on amenities          to anon;
grant select on hotels             to anon;
grant select on hotel_dog_policies to anon;
grant select on hotel_amenities    to anon;
grant select on hotel_images       to anon;
grant select on booking_links      to anon;
grant select on hotel_faqs         to anon;
grant select on articles           to anon;
grant select on article_hotels     to anon;

-- authenticated（将来ログインユーザーが必要になったら）も同様
grant select on regions            to authenticated;
grant select on prefectures        to authenticated;
grant select on amenities          to authenticated;
grant select on hotels             to authenticated;
grant select on hotel_dog_policies to authenticated;
grant select on hotel_amenities    to authenticated;
grant select on hotel_images       to authenticated;
grant select on booking_links      to authenticated;
grant select on hotel_faqs         to authenticated;
grant select on articles           to authenticated;
grant select on article_hotels     to authenticated;

-- 内部系（hotel_sources / hotel_revisions / discovery_queue / agent_runs）は
-- anon / authenticated には GRANT しない = service_roleのみアクセス可

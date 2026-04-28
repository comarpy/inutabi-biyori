-- =============================================================
-- マスタデータ初期投入
-- 8地方 + 47都道府県
-- =============================================================

-- 地方
insert into regions (name, slug, sort_order) values
  ('北海道',     'hokkaido',  1),
  ('東北',       'tohoku',    2),
  ('関東',       'kanto',     3),
  ('中部',       'chubu',     4),
  ('近畿',       'kinki',     5),
  ('中国',       'chugoku',   6),
  ('四国',       'shikoku',   7),
  ('九州・沖縄', 'kyushu',    8);

-- 都道府県（47件）
-- lat/lng は県庁所在地の概略値
insert into prefectures (region_id, name, slug, lat, lng) values
  -- 北海道
  ((select id from regions where slug='hokkaido'),  '北海道', 'hokkaido',  43.0642, 141.3469),
  -- 東北
  ((select id from regions where slug='tohoku'),    '青森県', 'aomori',    40.8244, 140.7400),
  ((select id from regions where slug='tohoku'),    '岩手県', 'iwate',     39.7036, 141.1527),
  ((select id from regions where slug='tohoku'),    '宮城県', 'miyagi',    38.2682, 140.8721),
  ((select id from regions where slug='tohoku'),    '秋田県', 'akita',     39.7186, 140.1024),
  ((select id from regions where slug='tohoku'),    '山形県', 'yamagata',  38.2404, 140.3633),
  ((select id from regions where slug='tohoku'),    '福島県', 'fukushima', 37.7503, 140.4676),
  -- 関東
  ((select id from regions where slug='kanto'),     '茨城県', 'ibaraki',   36.3418, 140.4468),
  ((select id from regions where slug='kanto'),     '栃木県', 'tochigi',   36.5658, 139.8836),
  ((select id from regions where slug='kanto'),     '群馬県', 'gunma',     36.3911, 139.0608),
  ((select id from regions where slug='kanto'),     '埼玉県', 'saitama',   35.8569, 139.6489),
  ((select id from regions where slug='kanto'),     '千葉県', 'chiba',     35.6047, 140.1233),
  ((select id from regions where slug='kanto'),     '東京都', 'tokyo',     35.6895, 139.6917),
  ((select id from regions where slug='kanto'),     '神奈川県','kanagawa', 35.4478, 139.6425),
  -- 中部
  ((select id from regions where slug='chubu'),     '新潟県', 'niigata',   37.9026, 139.0233),
  ((select id from regions where slug='chubu'),     '富山県', 'toyama',    36.6953, 137.2113),
  ((select id from regions where slug='chubu'),     '石川県', 'ishikawa',  36.5947, 136.6256),
  ((select id from regions where slug='chubu'),     '福井県', 'fukui',     36.0652, 136.2216),
  ((select id from regions where slug='chubu'),     '山梨県', 'yamanashi', 35.6642, 138.5684),
  ((select id from regions where slug='chubu'),     '長野県', 'nagano',    36.6513, 138.1810),
  ((select id from regions where slug='chubu'),     '岐阜県', 'gifu',      35.3912, 136.7223),
  ((select id from regions where slug='chubu'),     '静岡県', 'shizuoka',  34.9769, 138.3831),
  ((select id from regions where slug='chubu'),     '愛知県', 'aichi',     35.1802, 136.9066),
  -- 近畿
  ((select id from regions where slug='kinki'),     '三重県', 'mie',       34.7303, 136.5086),
  ((select id from regions where slug='kinki'),     '滋賀県', 'shiga',     35.0045, 135.8686),
  ((select id from regions where slug='kinki'),     '京都府', 'kyoto',     35.0211, 135.7556),
  ((select id from regions where slug='kinki'),     '大阪府', 'osaka',     34.6863, 135.5200),
  ((select id from regions where slug='kinki'),     '兵庫県', 'hyogo',     34.6913, 135.1830),
  ((select id from regions where slug='kinki'),     '奈良県', 'nara',      34.6852, 135.8329),
  ((select id from regions where slug='kinki'),     '和歌山県','wakayama', 34.2261, 135.1675),
  -- 中国
  ((select id from regions where slug='chugoku'),   '鳥取県', 'tottori',   35.5039, 134.2381),
  ((select id from regions where slug='chugoku'),   '島根県', 'shimane',   35.4723, 133.0505),
  ((select id from regions where slug='chugoku'),   '岡山県', 'okayama',   34.6618, 133.9344),
  ((select id from regions where slug='chugoku'),   '広島県', 'hiroshima', 34.3963, 132.4596),
  ((select id from regions where slug='chugoku'),   '山口県', 'yamaguchi', 34.1859, 131.4706),
  -- 四国
  ((select id from regions where slug='shikoku'),   '徳島県', 'tokushima', 34.0658, 134.5593),
  ((select id from regions where slug='shikoku'),   '香川県', 'kagawa',    34.3401, 134.0434),
  ((select id from regions where slug='shikoku'),   '愛媛県', 'ehime',     33.8416, 132.7657),
  ((select id from regions where slug='shikoku'),   '高知県', 'kochi',     33.5597, 133.5311),
  -- 九州・沖縄
  ((select id from regions where slug='kyushu'),    '福岡県', 'fukuoka',   33.6064, 130.4181),
  ((select id from regions where slug='kyushu'),    '佐賀県', 'saga',      33.2494, 130.2989),
  ((select id from regions where slug='kyushu'),    '長崎県', 'nagasaki',  32.7448, 129.8737),
  ((select id from regions where slug='kyushu'),    '熊本県', 'kumamoto',  32.7898, 130.7417),
  ((select id from regions where slug='kyushu'),    '大分県', 'oita',      33.2382, 131.6126),
  ((select id from regions where slug='kyushu'),    '宮崎県', 'miyazaki',  31.9111, 131.4239),
  ((select id from regions where slug='kyushu'),    '鹿児島県','kagoshima',31.5602, 130.5581),
  ((select id from regions where slug='kyushu'),    '沖縄県', 'okinawa',   26.2125, 127.6792);

-- 設備マスタ（v1で挙げた18種＋α）
insert into amenities (name, slug, category, icon, sort_order) values
  ('ドッグラン',           'dog-run',         'dog_facility', 'dog-run',     10),
  ('部屋ドッグラン',       'room-dog-run',    'dog_facility', 'home',        20),
  ('足洗い場',             'paw-wash',        'dog_facility', 'water-drop',  30),
  ('ドッグバス',           'dog-bath',        'dog_facility', 'bath',        40),
  ('グルーミングルーム',   'grooming-room',   'dog_facility', 'scissors',    50),
  ('ペットアメニティ貸出', 'pet-amenity',     'dog_facility', 'gift',        60),
  ('犬用食器',             'dog-bowl',        'dog_facility', 'bowl',        70),
  ('リードフック',          'leash-hook',      'dog_facility', 'hook',        80),
  ('一緒に食事可',         'dining-together', 'dog_facility', 'utensils',    90),
  ('犬用メニュー',         'dog-menu',        'dog_facility', 'menu',       100),
  ('施設内リードフリー',   'leash-free',      'dog_facility', 'unlocked',   110),
  ('温泉',                 'onsen',           'general',      'onsen',      200),
  ('露天風呂付客室',       'private-onsen',   'room',         'private',    210),
  ('部屋食',               'room-meal',       'room',         'room-meal',  220),
  ('一棟貸し',             'whole-rental',    'room',         'house',      230),
  ('BBQ',                  'bbq',             'general',      'bbq',        240),
  ('送迎',                 'shuttle',         'general',      'shuttle',    250),
  ('駐車場',               'parking',         'general',      'parking',    260);

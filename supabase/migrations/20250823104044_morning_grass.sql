/*
  # Complete Mock Data Migration

  1. New Data
    - 16 diverse LGBTQ+ profiles with proper UUIDs
    - 3 communities (LGBTQ+アート, トランス支援, プライド東京)
    - Community memberships for realistic relationships
    - Sample community posts with engagement

  2. Security
    - All tables have RLS enabled
    - Proper policies for data access
    - User-based data isolation

  3. Features
    - Complete profile information including identity fields
    - Community participation data
    - Sample posts and interactions
    - Realistic Japanese content throughout
*/

-- Insert 16 diverse LGBTQ+ profiles
INSERT INTO profiles (
  id, user_id, display_name, gender_identity, sexual_orientation, bio, age_range, city, height, body_style, 
  relationship_purpose, personality_traits, tags, avatar_url, is_visible, privacy_settings
) VALUES 
-- ゲイ 4名
(
  gen_random_uuid(), gen_random_uuid(), 'ひろき', '男性', 'ゲイ',
  'カフェ経営をしています。コーヒーと人との出会いが大好きです☕️',
  '30代前半（30-34歳）', '東京都', 175, '平均的', '恋人',
  ARRAY['陽気', '話し上手', '積極的'],
  ARRAY['コーヒー', 'カフェ', '起業', '旅行'],
  'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
  true,
  '{"showAge": true, "showBio": true, "showCity": true, "showTags": true, "showHeight": true, "showBodyStyle": true, "hidePhoto": false}'::jsonb
),
(
  gen_random_uuid(), gen_random_uuid(), 'たかし', '男性', 'ゲイ',
  'シェフとして働いています。美味しい料理で人を幸せにしたいです🍳',
  '20代後半（25-29歳）', '大阪府', 168, '細身', '恋人',
  ARRAY['のんびり屋', '気分や', '話し上手'],
  ARRAY['料理', 'シェフ', 'レストラン', 'グルメ'],
  'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
  true,
  '{"showAge": true, "showBio": true, "showCity": true, "showTags": true, "showHeight": true, "showBodyStyle": true, "hidePhoto": false}'::jsonb
),
(
  gen_random_uuid(), gen_random_uuid(), 'けんじ', '男性', 'ゲイ',
  'デザイナーとして働いています。アートとクリエイティブな表現が大好きです🎨',
  '20代後半（25-29歳）', '神奈川県', 172, 'アスリート体型', '友人',
  ARRAY['積極的', 'リーダー派', '陽気'],
  ARRAY['デザイン', 'アート', 'クリエイティブ', 'UI/UX'],
  'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
  true,
  '{"showAge": true, "showBio": true, "showCity": true, "showTags": true, "showHeight": true, "showBodyStyle": true, "hidePhoto": false}'::jsonb
),
(
  gen_random_uuid(), gen_random_uuid(), 'ゆうた', '男性', 'ゲイ',
  'フィットネストレーナーをしています。健康的な生活を一緒に楽しみましょう💪',
  '30代前半（30-34歳）', '愛知県', 180, 'マッチョ', '遊び相手',
  ARRAY['積極的', '陽気', 'リーダー派'],
  ARRAY['フィットネス', 'トレーニング', '健康', 'スポーツ'],
  'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
  true,
  '{"showAge": true, "showBio": true, "showCity": true, "showTags": true, "showHeight": true, "showBodyStyle": true, "hidePhoto": false}'::jsonb
),

-- レズビアン 4名
(
  gen_random_uuid(), gen_random_uuid(), 'さくら', '女性', 'レズビアン',
  '読書とカフェ巡りが趣味です。素敵な出会いを探しています📚',
  '20代前半（20-24歳）', '東京都', 162, '細身', '恋人',
  ARRAY['のんびり屋', '話し上手', '消極的'],
  ARRAY['読書', 'カフェ', '旅行', 'ヨガ'],
  'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
  true,
  '{"showAge": true, "showBio": true, "showCity": true, "showTags": true, "showHeight": true, "showBodyStyle": true, "hidePhoto": false}'::jsonb
),
(
  gen_random_uuid(), gen_random_uuid(), 'みお', '女性', 'レズビアン',
  '獣医師として動物の命を守っています。動物好きな人と出会いたいです🐾',
  '20代後半（25-29歳）', '京都府', 158, '平均的', '恋人',
  ARRAY['気分や', 'のんびり屋', '天然入ってる'],
  ARRAY['獣医', '動物', 'ペット', '医療'],
  'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
  true,
  '{"showAge": true, "showBio": true, "showCity": true, "showTags": true, "showHeight": true, "showBodyStyle": true, "hidePhoto": false}'::jsonb
),
(
  gen_random_uuid(), gen_random_uuid(), 'あやか', '女性', 'レズビアン',
  'ヨガインストラクターです。心と体の健康を大切にしています🧘‍♀️',
  '20代後半（25-29歳）', '福岡県', 165, 'アスリート体型', '友人',
  ARRAY['積極的', '陽気', 'リーダー派'],
  ARRAY['ヨガ', '瞑想', '健康', 'ウェルネス'],
  'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
  true,
  '{"showAge": true, "showBio": true, "showCity": true, "showTags": true, "showHeight": true, "showBodyStyle": true, "hidePhoto": false}'::jsonb
),
(
  gen_random_uuid(), gen_random_uuid(), 'ゆい', '女性', 'レズビアン',
  '図書館司書をしています。知識と静寂を愛しています📖',
  '20代前半（20-24歳）', '北海道', 160, '細身', '共感相手',
  ARRAY['消極的', 'のんびり屋', '寂しがり'],
  ARRAY['図書館', '読書', '知識', '静寂'],
  'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
  true,
  '{"showAge": true, "showBio": true, "showCity": true, "showTags": true, "showHeight": true, "showBodyStyle": true, "hidePhoto": false}'::jsonb
),

-- トランスジェンダー 2名
(
  gen_random_uuid(), gen_random_uuid(), 'あきら', 'トランスジェンダー男性', 'ゲイ',
  '音楽プロデューサーをしています。音楽で世界を変えたいです🎵',
  '30代前半（30-34歳）', '沖縄県', 170, '平均的', '恋人',
  ARRAY['積極的', '陽気', 'リーダー派'],
  ARRAY['音楽', 'プロデュース', 'レコーディング', 'ライブ'],
  'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
  true,
  '{"showAge": true, "showBio": true, "showCity": true, "showTags": true, "showHeight": true, "showBodyStyle": true, "hidePhoto": false}'::jsonb
),
(
  gen_random_uuid(), gen_random_uuid(), 'まい', 'トランスジェンダー女性', 'レズビアン',
  'アーティストとして表現活動をしています。アートで世界を彩りたいです🎭',
  '20代後半（25-29歳）', '長野県', 163, '細身', '友人',
  ARRAY['天然入ってる', '陽気', '積極的'],
  ARRAY['アート', '表現', 'パフォーマンス', 'クリエイティブ'],
  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
  true,
  '{"showAge": true, "showBio": true, "showCity": true, "showTags": true, "showHeight": true, "showBodyStyle": true, "hidePhoto": false}'::jsonb
),

-- バイセクシャル 2名
(
  gen_random_uuid(), gen_random_uuid(), 'えみ', '女性', 'バイセクシャル',
  'エンジニアとして働いています。テクノロジーで社会を良くしたいです💻',
  '20代後半（25-29歳）', '宮城県', 164, '平均的', '恋人',
  ARRAY['積極的', '話し上手', 'リーダー派'],
  ARRAY['プログラミング', 'AI', 'テクノロジー', 'イノベーション'],
  'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
  true,
  '{"showAge": true, "showBio": true, "showCity": true, "showTags": true, "showHeight": true, "showBodyStyle": true, "hidePhoto": false}'::jsonb
),
(
  gen_random_uuid(), gen_random_uuid(), 'だいき', '男性', 'バイセクシャル',
  'スポーツトレーナーとして健康をサポートしています。アクティブな生活を楽しみましょう💪',
  '20代後半（25-29歳）', '群馬県', 178, 'マッチョ', '遊び相手',
  ARRAY['陽気', '積極的', 'リーダー派'],
  ARRAY['スポーツ', 'トレーニング', '健康', 'フィットネス'],
  'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
  true,
  '{"showAge": true, "showBio": true, "showCity": true, "showTags": true, "showHeight": true, "showBodyStyle": true, "hidePhoto": false}'::jsonb
),

-- クエスチョニング 4名
(
  gen_random_uuid(), gen_random_uuid(), 'ゆうき', 'ジェンダーフルイド', 'クエスチョニング',
  'フリーランスライターです。多様性について発信しています✍️',
  '20代後半（25-29歳）', '静岡県', 167, '細身', '共感相手',
  ARRAY['消極的', 'のんびり屋', '天然入ってる'],
  ARRAY['ライティング', 'ジャーナリズム', 'LGBTQ+', '執筆'],
  'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
  true,
  '{"showAge": true, "showBio": true, "showCity": true, "showTags": true, "showHeight": true, "showBodyStyle": true, "hidePhoto": false}'::jsonb
),
(
  gen_random_uuid(), gen_random_uuid(), 'なな', 'ジェンダークィア', 'クエスチョニング',
  '心理学を学んでいます。人の心に寄り添える人になりたいです💭',
  '20代前半（20-24歳）', '広島県', 161, '平均的', '友人',
  ARRAY['消極的', '寂しがり', '天然入ってる'],
  ARRAY['心理学', 'カウンセリング', '学習', 'サポート'],
  'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
  true,
  '{"showAge": true, "showBio": true, "showCity": true, "showTags": true, "showHeight": true, "showBodyStyle": true, "hidePhoto": false}'::jsonb
),
(
  gen_random_uuid(), gen_random_uuid(), 'はるか', 'アジェンダー', 'クエスチョニング',
  '建築家として美しい空間を創造しています。デザインが好きな人と繋がりたいです🏗️',
  '30代前半（30-34歳）', '新潟県', 169, '長身', '友人',
  ARRAY['積極的', 'リーダー派', '話し上手'],
  ARRAY['建築', 'デザイン', '空間', 'クリエイティブ'],
  'https://images.pexels.com/photos/1559486/pexels-photo-1559486.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
  true,
  '{"showAge": true, "showBio": true, "showCity": true, "showTags": true, "showHeight": true, "showBodyStyle": true, "hidePhoto": false}'::jsonb
),
(
  gen_random_uuid(), gen_random_uuid(), 'りな', 'ノンバイナリー', 'クエスチョニング',
  '静かな時間と本が好きです。深い友情を大切にしています📚',
  '20代前半（20-24歳）', '山形県', 166, '平均的', '共感相手',
  ARRAY['消極的', 'のんびり屋', '寂しがり'],
  ARRAY['読書', '瞑想', '写真', '自然'],
  'https://images.pexels.com/photos/1758144/pexels-photo-1758144.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
  true,
  '{"showAge": true, "showBio": true, "showCity": true, "showTags": true, "showHeight": true, "showBodyStyle": true, "hidePhoto": false}'::jsonb
),

-- パンセクシャル 2名
(
  gen_random_uuid(), gen_random_uuid(), 'こうじ', 'ノンバイナリー', 'パンセクシャル',
  'アートと音楽が大好きです。多様性を大切にしています。🌈',
  '20代後半（25-29歳）', '千葉県', 171, '平均的', '恋人',
  ARRAY['陽気', '話し上手', '積極的'],
  ARRAY['アート', '音楽', 'LGBTQ+', '映画'],
  'https://images.pexels.com/photos/1680172/pexels-photo-1680172.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
  true,
  '{"showAge": true, "showBio": true, "showCity": true, "showTags": true, "showHeight": true, "showBodyStyle": true, "hidePhoto": false}'::jsonb
),
(
  gen_random_uuid(), gen_random_uuid(), 'みき', 'ジェンダーフルイド', 'パンセクシャル',
  'テクノロジーとゲームが好きです。一緒に楽しめる人と出会いたいです。',
  '30代前半（30-34歳）', '埼玉県', 165, '細身', '遊び相手',
  ARRAY['積極的', 'リーダー派', '陽気'],
  ARRAY['テクノロジー', 'ゲーム', 'プログラミング', 'アニメ'],
  'https://images.pexels.com/photos/1844012/pexels-photo-1844012.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
  true,
  '{"showAge": true, "showBio": true, "showCity": true, "showTags": true, "showHeight": true, "showBodyStyle": true, "hidePhoto": false}'::jsonb
);

-- Insert communities
INSERT INTO communities (id, name, description, category, image_url, is_private, created_by, member_count, tags) VALUES
(
  gen_random_uuid(),
  'LGBTQ+アート',
  'アートを通じてLGBTQ+コミュニティの多様性を表現し、創作活動を共有するグループです。',
  'アート・創作',
  'https://images.pexels.com/photos/1194420/pexels-photo-1194420.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
  false,
  (SELECT user_id FROM profiles WHERE display_name = 'あきら' LIMIT 1),
  1247,
  ARRAY['アート', 'クリエイティブ', 'LGBTQ+', '表現']
),
(
  gen_random_uuid(),
  'トランス支援',
  'トランスジェンダーの方々が安心して相談や情報交換ができるサポートコミュニティです。',
  'サポート・相談',
  'https://images.pexels.com/photos/1708912/pexels-photo-1708912.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
  true,
  (SELECT user_id FROM profiles WHERE display_name = 'まい' LIMIT 1),
  892,
  ARRAY['サポート', 'トランスジェンダー', '相談', '情報交換']
),
(
  gen_random_uuid(),
  'プライド東京',
  '東京プライドパレードの準備や LGBTQ+ イベントの企画・運営を行うコミュニティです。',
  'イベント・集会',
  'https://images.pexels.com/photos/1708936/pexels-photo-1708936.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
  false,
  (SELECT user_id FROM profiles WHERE display_name = 'ゆうた' LIMIT 1),
  2156,
  ARRAY['プライド', 'イベント', '東京', 'パレード']
);

-- Insert community memberships (sample relationships)
INSERT INTO community_members (community_id, user_id, role) VALUES
-- LGBTQ+アートコミュニティのメンバー
((SELECT id FROM communities WHERE name = 'LGBTQ+アート'), (SELECT user_id FROM profiles WHERE display_name = 'ひろき'), 'member'),
((SELECT id FROM communities WHERE name = 'LGBTQ+アート'), (SELECT user_id FROM profiles WHERE display_name = 'けんじ'), 'member'),
((SELECT id FROM communities WHERE name = 'LGBTQ+アート'), (SELECT user_id FROM profiles WHERE display_name = 'あきら'), 'admin'),
((SELECT id FROM communities WHERE name = 'LGBTQ+アート'), (SELECT user_id FROM profiles WHERE display_name = 'まい'), 'member'),
((SELECT id FROM communities WHERE name = 'LGBTQ+アート'), (SELECT user_id FROM profiles WHERE display_name = 'ゆうき'), 'member'),
((SELECT id FROM communities WHERE name = 'LGBTQ+アート'), (SELECT user_id FROM profiles WHERE display_name = 'こうじ'), 'member'),
((SELECT id FROM communities WHERE name = 'LGBTQ+アート'), (SELECT user_id FROM profiles WHERE display_name = 'みき'), 'member'),

-- トランス支援コミュニティのメンバー
((SELECT id FROM communities WHERE name = 'トランス支援'), (SELECT user_id FROM profiles WHERE display_name = 'さくら'), 'member'),
((SELECT id FROM communities WHERE name = 'トランス支援'), (SELECT user_id FROM profiles WHERE display_name = 'みお'), 'member'),
((SELECT id FROM communities WHERE name = 'トランス支援'), (SELECT user_id FROM profiles WHERE display_name = 'あやか'), 'member'),
((SELECT id FROM communities WHERE name = 'トランス支援'), (SELECT user_id FROM profiles WHERE display_name = 'ゆい'), 'member'),
((SELECT id FROM communities WHERE name = 'トランス支援'), (SELECT user_id FROM profiles WHERE display_name = 'まい'), 'admin'),
((SELECT id FROM communities WHERE name = 'トランス支援'), (SELECT user_id FROM profiles WHERE display_name = 'なな'), 'member'),
((SELECT id FROM communities WHERE name = 'トランス支援'), (SELECT user_id FROM profiles WHERE display_name = 'りな'), 'member'),

-- プライド東京コミュニティのメンバー
((SELECT id FROM communities WHERE name = 'プライド東京'), (SELECT user_id FROM profiles WHERE display_name = 'たかし'), 'member'),
((SELECT id FROM communities WHERE name = 'プライド東京'), (SELECT user_id FROM profiles WHERE display_name = 'ゆうた'), 'admin'),
((SELECT id FROM communities WHERE name = 'プライド東京'), (SELECT user_id FROM profiles WHERE display_name = 'あやか'), 'member'),
((SELECT id FROM communities WHERE name = 'プライド東京'), (SELECT user_id FROM profiles WHERE display_name = 'あきら'), 'member'),
((SELECT id FROM communities WHERE name = 'プライド東京'), (SELECT user_id FROM profiles WHERE display_name = 'だいき'), 'member'),
((SELECT id FROM communities WHERE name = 'プライド東京'), (SELECT user_id FROM profiles WHERE display_name = 'みき'), 'member');

-- Insert sample community posts
INSERT INTO community_posts (community_id, author_id, content, likes_count, comments_count) VALUES
(
  (SELECT id FROM communities WHERE name = 'LGBTQ+アート'),
  (SELECT user_id FROM profiles WHERE display_name = 'あきら'),
  '新しい楽曲を完成させました！LGBTQコミュニティの多様性を表現した音楽です。🎵🌈',
  24,
  8
),
(
  (SELECT id FROM communities WHERE name = 'LGBTQ+アート'),
  (SELECT user_id FROM profiles WHERE display_name = 'ゆうき'),
  'LGBTQ+の権利について記事を書きました。多様性について一緒に考えませんか？',
  15,
  5
),
(
  (SELECT id FROM communities WHERE name = 'トランス支援'),
  (SELECT user_id FROM profiles WHERE display_name = 'さくら'),
  '今日は素敵なカフェを見つけました。LGBTQ+フレンドリーな空間で、とても居心地が良かったです☕️',
  18,
  12
),
(
  (SELECT id FROM communities WHERE name = 'プライド東京'),
  (SELECT user_id FROM profiles WHERE display_name = 'ゆうた'),
  'プライドパレード2024の準備が本格的に始まりました！ボランティア募集中です🌈',
  32,
  16
);
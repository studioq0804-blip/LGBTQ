/*
  # Rainbow Match - プロフィールと認証システム

  1. 新しいテーブル
    - `profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `display_name` (text, 表示名)
      - `gender_identity` (text, 性自認)
      - `sexual_orientation` (text, 性的指向)
      - `bio` (text, 自己紹介)
      - `age_range` (text, 年代区分)
      - `city` (text, 都道府県)
      - `height` (integer, 身長cm)
      - `body_style` (text, 体型)
      - `relationship_purpose` (text, 出会いの目的)
      - `personality_traits` (text[], 性格配列)
      - `tags` (text[], 趣味タグ配列)
      - `avatar_url` (text, アバター画像URL)
      - `is_visible` (boolean, 表示設定)
      - `last_active` (timestamptz, 最終アクティブ)
      - `privacy_settings` (jsonb, プライバシー設定)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `likes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, いいねした人)
      - `target_user_id` (uuid, いいねされた人)
      - `is_super_like` (boolean, スーパーいいね)
      - `created_at` (timestamptz)

    - `matches`
      - `id` (uuid, primary key)
      - `user_a` (uuid, ユーザーA)
      - `user_b` (uuid, ユーザーB)
      - `created_at` (timestamptz)

  2. セキュリティ
    - RLSを有効化
    - 認証ユーザーのみアクセス可能
    - 自分のデータのみ編集可能

  3. インデックス
    - 検索性能向上のためのインデックス
    - 年代、都道府県、目的でのフィルタリング対応
*/

-- プロフィールテーブル
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  gender_identity text DEFAULT '',
  sexual_orientation text DEFAULT '',
  bio text DEFAULT '',
  age_range text DEFAULT '',
  city text DEFAULT '',
  height integer,
  body_style text DEFAULT '',
  relationship_purpose text DEFAULT '',
  personality_traits text[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  avatar_url text DEFAULT '',
  is_visible boolean DEFAULT true,
  last_active timestamptz DEFAULT now(),
  privacy_settings jsonb DEFAULT '{
    "showGenderIdentity": true,
    "showSexualOrientation": true,
    "showAge": true,
    "showCity": true,
    "showHeight": true,
    "showBodyStyle": true,
    "showTags": true,
    "showBio": true
  }'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- いいねテーブル
CREATE TABLE IF NOT EXISTS likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_super_like boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, target_user_id)
);

-- マッチテーブル
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_b uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_a, user_b),
  CHECK (user_a != user_b)
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_age_range ON profiles(age_range);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON profiles(city);
CREATE INDEX IF NOT EXISTS idx_profiles_relationship_purpose ON profiles(relationship_purpose);
CREATE INDEX IF NOT EXISTS idx_profiles_sexual_orientation ON profiles(sexual_orientation);
CREATE INDEX IF NOT EXISTS idx_profiles_gender_identity ON profiles(gender_identity);
CREATE INDEX IF NOT EXISTS idx_profiles_is_visible ON profiles(is_visible);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON profiles(last_active DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_tags ON profiles USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_profiles_personality_traits ON profiles USING gin(personality_traits);

CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_target_user_id ON likes(target_user_id);
CREATE INDEX IF NOT EXISTS idx_likes_created_at ON likes(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_matches_user_a ON matches(user_a);
CREATE INDEX IF NOT EXISTS idx_matches_user_b ON matches(user_b);
CREATE INDEX IF NOT EXISTS idx_matches_created_at ON matches(created_at DESC);

-- RLS有効化
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- プロフィールのRLSポリシー
-- DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;

CREATE POLICY "Profiles are viewable by everyone or owner" ON profiles
  FOR SELECT USING (is_visible = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile" ON profiles
  FOR DELETE USING (auth.uid() = user_id);

-- いいねのRLSポリシー
CREATE POLICY "Users can view their own likes" ON likes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own likes" ON likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON likes
  FOR DELETE USING (auth.uid() = user_id);

-- マッチのRLSポリシー
CREATE POLICY "Users can view their own matches" ON matches
  FOR SELECT USING (auth.uid() = user_a OR auth.uid() = user_b);

-- updated_at自動更新関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at自動更新トリガー
CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- マッチ自動作成関数
CREATE OR REPLACE FUNCTION create_match_on_mutual_like()
RETURNS TRIGGER AS $$
BEGIN
  -- 相互いいねをチェック
  IF EXISTS (
    SELECT 1 FROM likes 
    WHERE user_id = NEW.target_user_id 
    AND target_user_id = NEW.user_id
  ) THEN
    -- マッチを作成（重複チェック付き）
    INSERT INTO matches (user_a, user_b)
    VALUES (
      LEAST(NEW.user_id, NEW.target_user_id),
      GREATEST(NEW.user_id, NEW.target_user_id)
    )
    ON CONFLICT (user_a, user_b) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- マッチ自動作成トリガー
CREATE TRIGGER trigger_create_match_on_like
  AFTER INSERT ON likes
  FOR EACH ROW EXECUTE FUNCTION create_match_on_mutual_like();
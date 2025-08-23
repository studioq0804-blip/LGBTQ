/*
  # コミュニティ機能のデータベーススキーマ

  1. 新しいテーブル
    - `communities`
      - `id` (uuid, primary key)
      - `name` (text, コミュニティ名)
      - `description` (text, 説明)
      - `category` (text, カテゴリー)
      - `image_url` (text, カバー画像URL)
      - `is_private` (boolean, プライベート設定)
      - `created_by` (uuid, 作成者ID)
      - `member_count` (integer, メンバー数)
      - `tags` (text[], タグ配列)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `community_members`
      - `id` (uuid, primary key)
      - `community_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `role` (text, 'member' | 'moderator' | 'admin')
      - `joined_at` (timestamptz)
    
    - `community_posts`
      - `id` (uuid, primary key)
      - `community_id` (uuid, foreign key)
      - `author_id` (uuid, foreign key)
      - `content` (text, 投稿内容)
      - `likes_count` (integer, いいね数)
      - `comments_count` (integer, コメント数)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. セキュリティ
    - RLSを有効化
    - 適切なポリシーを設定
    - プライベートコミュニティのアクセス制御

  3. インデックス
    - 検索性能向上のためのインデックス
    - カテゴリー、作成日時、メンバー数でのソート対応
*/

-- コミュニティテーブル
CREATE TABLE IF NOT EXISTS communities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  image_url text,
  is_private boolean DEFAULT false,
  created_by uuid NOT NULL,
  member_count integer DEFAULT 0,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- コミュニティメンバーテーブル
CREATE TABLE IF NOT EXISTS community_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(community_id, user_id)
);

-- コミュニティ投稿テーブル
CREATE TABLE IF NOT EXISTS community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  author_id uuid NOT NULL,
  content text NOT NULL,
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_communities_category ON communities(category);
CREATE INDEX IF NOT EXISTS idx_communities_created_at ON communities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_communities_member_count ON communities(member_count DESC);
CREATE INDEX IF NOT EXISTS idx_communities_name ON communities USING gin(to_tsvector('simple', name));
CREATE INDEX IF NOT EXISTS idx_communities_description ON communities USING gin(to_tsvector('simple', description));
CREATE INDEX IF NOT EXISTS idx_communities_tags ON communities USING gin(tags);

CREATE INDEX IF NOT EXISTS idx_community_members_community_id ON community_members(community_id);
CREATE INDEX IF NOT EXISTS idx_community_members_user_id ON community_members(user_id);

CREATE INDEX IF NOT EXISTS idx_community_posts_community_id ON community_posts(community_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);

-- RLS有効化
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

-- コミュニティのRLSポリシー
CREATE POLICY "Communities are viewable by everyone" ON communities
  FOR SELECT USING (true);

CREATE POLICY "Users can create communities" ON communities
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Community creators can update their communities" ON communities
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Community creators can delete their communities" ON communities
  FOR DELETE USING (auth.uid() = created_by);

-- コミュニティメンバーのRLSポリシー
CREATE POLICY "Community members are viewable by community members" ON community_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM community_members cm 
      WHERE cm.community_id = community_members.community_id 
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join communities" ON community_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave communities" ON community_members
  FOR DELETE USING (auth.uid() = user_id);

-- コミュニティ投稿のRLSポリシー
CREATE POLICY "Community posts are viewable by community members" ON community_posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM community_members cm 
      WHERE cm.community_id = community_posts.community_id 
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Community members can create posts" ON community_posts
  FOR INSERT WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (
      SELECT 1 FROM community_members cm 
      WHERE cm.community_id = community_posts.community_id 
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Post authors can update their posts" ON community_posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Post authors can delete their posts" ON community_posts
  FOR DELETE USING (auth.uid() = author_id);

-- メンバー数更新のトリガー関数
CREATE OR REPLACE FUNCTION update_community_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE communities 
    SET member_count = member_count + 1,
        updated_at = now()
    WHERE id = NEW.community_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE communities 
    SET member_count = GREATEST(member_count - 1, 0),
        updated_at = now()
    WHERE id = OLD.community_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- メンバー数更新トリガー
CREATE TRIGGER trigger_update_community_member_count
  AFTER INSERT OR DELETE ON community_members
  FOR EACH ROW EXECUTE FUNCTION update_community_member_count();

-- updated_at自動更新関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at自動更新トリガー
CREATE TRIGGER trigger_communities_updated_at
  BEFORE UPDATE ON communities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_community_posts_updated_at
  BEFORE UPDATE ON community_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
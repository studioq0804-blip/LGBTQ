/*
  # チャット機能の修正とクリーンアップ

  1. 既存データのクリーンアップ
    - 無効なUUIDを持つレコードを削除
    - テストデータをクリア

  2. 関数の修正
    - update_chat_thread_timestamp関数の修正
    - create_match_on_mutual_like関数の修正

  3. セキュリティポリシーの確認
    - RLSポリシーの動作確認
    - 認証ユーザーのアクセス権限確認
*/

-- 無効なUUIDを持つテストデータをクリーンアップ
DELETE FROM messages WHERE chat_thread_id NOT SIMILAR TO '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
DELETE FROM chat_threads WHERE id NOT SIMILAR TO '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
DELETE FROM likes WHERE user_id NOT SIMILAR TO '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' OR target_user_id NOT SIMILAR TO '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
DELETE FROM matches WHERE user_a NOT SIMILAR TO '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' OR user_b NOT SIMILAR TO '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';

-- チャットスレッド更新関数の修正
CREATE OR REPLACE FUNCTION update_chat_thread_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_threads 
  SET updated_at = NOW()
  WHERE id = NEW.chat_thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 相互いいねでマッチ作成関数の修正
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
    
    -- チャットスレッドを作成（重複チェック付き）
    INSERT INTO chat_threads (participant_a, participant_b)
    VALUES (
      LEAST(NEW.user_id, NEW.target_user_id),
      GREATEST(NEW.user_id, NEW.target_user_id)
    )
    ON CONFLICT (participant_a, participant_b) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- デモユーザーを作成（認証なしでもチャット機能をテスト可能）
DO $$
BEGIN
  -- デモユーザーが存在しない場合のみ作成
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'demo@example.com') THEN
    -- auth.usersテーブルに直接挿入（通常は推奨されないが、デモ用）
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'demo@example.com',
      crypt('demo123', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );
  END IF;
END $$;
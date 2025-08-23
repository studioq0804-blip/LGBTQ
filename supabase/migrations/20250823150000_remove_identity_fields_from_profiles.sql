-- profilesテーブルから不要になったカラムを削除します。
ALTER TABLE public.profiles DROP COLUMN IF EXISTS display_name;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS gender_identity;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS sexual_orientation;

-- 関連するインデックスを削除します。
DROP INDEX IF EXISTS idx_profiles_gender_identity;
DROP INDEX IF EXISTS idx_profiles_sexual_orientation;

-- 既存のレコードのprivacy_settingsから不要なキーを削除します。
UPDATE public.profiles
SET privacy_settings = privacy_settings - 'showGenderIdentity' - 'showSexualOrientation';

-- privacy_settingsのデフォルト値を更新します。
ALTER TABLE public.profiles
ALTER COLUMN privacy_settings
SET DEFAULT '{
  "showAge": true,
  "showCity": true,
  "showHeight": true,
  "showBodyStyle": true,
  "showTags": true,
  "showBio": true
}'::jsonb;

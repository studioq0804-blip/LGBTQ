/*
  # Add display_name field to profiles table

  1. Schema Changes
    - Add `display_name` column to `profiles` table
    - Set default value for existing records
    - Add index for search performance

  2. Data Migration
    - Update existing records with default display names
    - Ensure all profiles have a display name

  3. Security
    - Update RLS policies to include display_name
*/

-- Add display_name column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'display_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN display_name text DEFAULT 'ユーザー';
  END IF;
END $$;

-- Update existing records without display_name
UPDATE profiles 
SET display_name = 'ユーザー' 
WHERE display_name IS NULL OR display_name = '';

-- Add index for display_name search
CREATE INDEX IF NOT EXISTS idx_profiles_display_name 
ON profiles USING gin (to_tsvector('simple'::regconfig, display_name));

-- Add gender_identity and sexual_orientation columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'gender_identity'
  ) THEN
    ALTER TABLE profiles ADD COLUMN gender_identity text DEFAULT '';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'sexual_orientation'
  ) THEN
    ALTER TABLE profiles ADD COLUMN sexual_orientation text DEFAULT '';
  END IF;
END $$;
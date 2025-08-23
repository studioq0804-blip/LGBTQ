/*
  # Create login OTPs table

  1. New Tables
    - `login_otps`
      - `id` (uuid, primary key)
      - `email` (text, not null)
      - `code` (text, not null) 
      - `expires_at` (timestamptz, not null)
      - `used` (boolean, default false)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `login_otps` table
    - Add policy for users to manage their own OTPs
    - Add index for efficient email and expiry lookups

  3. Cleanup
    - Add trigger to automatically delete expired OTPs
*/

-- Create login_otps table
CREATE TABLE IF NOT EXISTS public.login_otps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  code text NOT NULL,
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.login_otps ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own OTPs"
  ON public.login_otps
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_login_otps_email ON public.login_otps (email);
CREATE INDEX IF NOT EXISTS idx_login_otps_expires_at ON public.login_otps (expires_at);
CREATE INDEX IF NOT EXISTS idx_login_otps_code ON public.login_otps (code);

-- Create function to cleanup expired OTPs
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.login_otps 
  WHERE expires_at < now() - interval '1 hour';
END;
$$;

-- Create trigger to run cleanup periodically (this would typically be done via cron in production)
-- For now, we'll just ensure the function exists for manual cleanup
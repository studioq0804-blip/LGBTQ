import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is properly configured with valid values
const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co' &&
  supabaseAnonKey !== 'your-anon-key' &&
  supabaseUrl.includes('supabase.co') &&
  supabaseAnonKey.length > 50 // JWT tokens are typically longer
);

console.log('Supabase configuration status:', {
  configured: isSupabaseConfigured,
  hasUrl: Boolean(supabaseUrl),
  hasKey: Boolean(supabaseAnonKey),
  urlValid: supabaseUrl?.includes('supabase.co'),
  keyLength: supabaseAnonKey?.length || 0
});

// Always create client but handle errors gracefully
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

export { isSupabaseConfigured };
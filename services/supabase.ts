
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!supabaseUrl && 
         supabaseUrl.startsWith('http') && 
         !!supabaseAnonKey && 
         supabaseAnonKey !== 'placeholder';
};

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient => {
  if (!supabaseInstance) {
    // If not configured, we use a placeholder that won't crash on init but will fail on calls
    const url = isSupabaseConfigured() ? supabaseUrl : 'https://placeholder.supabase.co';
    const key = isSupabaseConfigured() ? supabaseAnonKey : 'placeholder';
    
    supabaseInstance = createClient(url, key);
  }
  return supabaseInstance;
};

// For backward compatibility with existing imports
export const supabase = getSupabase();

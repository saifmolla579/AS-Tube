
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// User provided credentials
const HARDCODED_URL = 'https://lwbidztzuzyfngxqffeq.supabase.co';
const HARDCODED_KEY = 'sb_publishable_LubYHAy2jrzJa-kKwfSerQ_3JVE8Mtk';

// Helper to validate URL
const isValidUrl = (url: any): boolean => {
  return typeof url === 'string' && url.startsWith('http');
};

const getValidConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const url = isValidUrl(envUrl) ? envUrl : HARDCODED_URL;
  const key = (envKey && envKey !== 'placeholder') ? envKey : HARDCODED_KEY;

  return { url, key };
};

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  const { url, key } = getValidConfig();
  return isValidUrl(url) && !!key && key !== 'placeholder';
};

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient => {
  if (!supabaseInstance) {
    const { url, key } = getValidConfig();
    supabaseInstance = createClient(url, key);
  }
  return supabaseInstance;
};

// For backward compatibility with existing imports
export const supabase = getSupabase();

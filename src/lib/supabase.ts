import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const isDevelopment = process.env.NODE_ENV === 'development';

let browserClient: SupabaseClient<Database> | null = null;

function getSupabaseEnv() {
  return {
    url: supabaseUrl,
    anonKey: supabaseAnonKey
  };
}

export function getSupabaseConfigError() {
  const { url, anonKey } = getSupabaseEnv();

  if (!url || !anonKey) {
    return 'Supabase environment variables are missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.';
  }

  return null;
}

export function getSupabaseClient() {
  const configError = getSupabaseConfigError();
  if (configError) {
    throw new Error(configError);
  }

  if (browserClient) {
    return browserClient;
  }

  const { url, anonKey } = getSupabaseEnv();
  browserClient = createClient<Database>(url!, anonKey!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });

  if (isDevelopment) {
    const hasServiceRoleInClient = anonKey?.startsWith('eyJ') && anonKey.includes('service_role');
    if (hasServiceRoleInClient) {
      console.error('Unsafe Supabase config: service role key appears to be used client-side.');
    }
  }

  return browserClient;
}

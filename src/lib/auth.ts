import { User } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';
import { getSupabaseClient } from '@/lib/supabase';

export const USER_ROLES = ['customer', 'provider', 'admin'] as const;

export type UserRole = (typeof USER_ROLES)[number];
export type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export function isValidUserRole(value: string | null | undefined): value is UserRole {
  return USER_ROLES.includes((value ?? '') as UserRole);
}

export function getRedirectForProfile(profile: Pick<ProfileRow, 'role'> | null, next?: string | null) {
  if (next) return next;

  if (profile?.role === 'admin') return '/control';
  if (profile?.role === 'provider') return '/pro';
  return '/account';
}

export async function getCurrentUser() {
  const supabase = getSupabaseClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('getCurrentUser error', error);
    }
    return null;
  }

  return user;
}

export async function getCurrentProfile(userId?: string) {
  const supabase = getSupabaseClient();
  const effectiveUserId = userId ?? (await getCurrentUser())?.id;

  if (!effectiveUserId) return null;

  const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', effectiveUserId).maybeSingle();

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('getCurrentProfile error', error);
    }
    return null;
  }

  return profile;
}

export async function ensureCustomerProfile(
  user: User,
  formData?: {
    full_name?: string;
    phone?: string;
    email?: string;
    default_location?: string;
  }
) {
  const supabase = getSupabaseClient();
  const now = new Date().toISOString();

  const payload: Database['public']['Tables']['profiles']['Insert'] = {
    id: user.id,
    role: 'customer',
    pro_application_status: 'not_applied',
    full_name: formData?.full_name?.trim() || (user.user_metadata?.full_name as string | undefined) || null,
    phone: formData?.phone?.trim() || null,
    email: formData?.email?.trim() || user.email || null,
    default_location: formData?.default_location?.trim() || null,
    updated_at: now
  };

  const { data, error } = await supabase.from('profiles').upsert(payload).select('*').maybeSingle();

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('ensureCustomerProfile error', error);
    }
    return { profile: null, error };
  }

  return { profile: data ?? null, error: null };
}

export async function getCurrentSession() {
  const supabase = getSupabaseClient();
  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
}

export async function getCurrentUserProfile() {
  const session = await getCurrentSession();

  if (!session?.user) {
    return null;
  }

  const profile = await getCurrentProfile(session.user.id);

  return {
    session,
    profile
  };
}

import { User } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';
import { getSupabaseClient } from '@/lib/supabase';
import { normalizeEmail, normalizeKenyanPhone, normalizeLocation, normalizeName } from '@/lib/validation';

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
  const fallbackEmail = formData?.email ? normalizeEmail(formData.email) : user.email ?? null;

  const payload: Database['public']['Tables']['profiles']['Insert'] = {
    id: user.id,
    role: 'customer',
    pro_application_status: 'not_applied',
    full_name: formData?.full_name ? normalizeName(formData.full_name) : ((user.user_metadata?.full_name as string | undefined) ?? null),
    phone: formData?.phone ? normalizeKenyanPhone(formData.phone) : null,
    email: fallbackEmail,
    default_location: formData?.default_location ? normalizeLocation(formData.default_location) : null
  };

  const { error: upsertError } = await supabase.from('profiles').upsert(payload, { onConflict: 'id' });
  if (upsertError) {
    if (process.env.NODE_ENV === 'development') {
      console.error('ensureCustomerProfile upsert error', upsertError);
    }
    return { profile: null, error: upsertError };
  }

  const { data: profile, error: fetchError } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
  if (fetchError || !profile) {
    if (process.env.NODE_ENV === 'development' && fetchError) {
      console.error('ensureCustomerProfile fetch error', fetchError);
    }

    const basicPayload: Database['public']['Tables']['profiles']['Insert'] = {
      id: user.id,
      role: 'customer',
      email: fallbackEmail,
      pro_application_status: 'not_applied'
    };

    const { error: fallbackUpsertError } = await supabase.from('profiles').upsert(basicPayload, { onConflict: 'id' });
    if (fallbackUpsertError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('ensureCustomerProfile fallback upsert error', fallbackUpsertError);
      }
      return { profile: null, error: fallbackUpsertError };
    }

    const { data: fallbackProfile, error: fallbackFetchError } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    if (fallbackFetchError || !fallbackProfile) {
      if (process.env.NODE_ENV === 'development') {
        console.error('ensureCustomerProfile fallback fetch error', fallbackFetchError);
      }
      return { profile: null, error: fallbackFetchError ?? fetchError ?? new Error('Profile fetch failed after upsert.') };
    }

    return { profile: fallbackProfile, error: null };
  }

  return { profile, error: null };
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

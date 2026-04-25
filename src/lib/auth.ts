import { getSupabaseClient } from '@/lib/supabase';

export const USER_ROLES = ['customer', 'provider', 'admin'] as const;

export type UserRole = (typeof USER_ROLES)[number];

export function isValidUserRole(value: string | null | undefined): value is UserRole {
  return USER_ROLES.includes((value ?? '') as UserRole);
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

  const supabase = getSupabaseClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .maybeSingle();

  return {
    session,
    profile
  };
}

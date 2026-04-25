'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isValidUserRole, USER_ROLES, UserRole } from '@/lib/auth';
import { getSupabaseClient } from '@/lib/supabase';

type ProfileForm = {
  role: UserRole;
  full_name: string;
  phone: string;
  email: string;
  default_location: string;
  latitude: string;
  longitude: string;
};

const initialForm: ProfileForm = {
  role: 'customer',
  full_name: '',
  phone: '',
  email: '',
  default_location: '',
  latitude: '',
  longitude: ''
};

export default function AccountPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ProfileForm>(initialForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      const supabase = getSupabaseClient();
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!session?.user) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();

      if (!isMounted) return;

      setFormData({
        role: isValidUserRole(profile?.role) ? profile.role : 'customer',
        full_name: profile?.full_name ?? '',
        phone: profile?.phone ?? '',
        email: profile?.email ?? session.user.email ?? '',
        default_location: profile?.default_location ?? '',
        latitude: profile?.latitude?.toString() ?? '',
        longitude: profile?.longitude?.toString() ?? ''
      });
      setIsLoading(false);
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const onSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setStatusMessage('');
    setIsSaving(true);

    try {
      const supabase = getSupabaseClient();
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error('No user session');
      }

      const payload = {
        id: session.user.id,
        role: formData.role,
        full_name: formData.full_name.trim() || null,
        phone: formData.phone.trim() || null,
        email: formData.email.trim() || session.user.email || null,
        default_location: formData.default_location.trim() || null,
        latitude: formData.latitude ? Number(formData.latitude) : null,
        longitude: formData.longitude ? Number(formData.longitude) : null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase.from('profiles').upsert(payload);
      if (error) throw error;

      setStatusMessage('Profile updated successfully.');
    } catch {
      setErrorMessage('Unable to save profile right now. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const onSignOut = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (isLoading) {
    return (
      <div className="section-shell max-w-2xl py-10">
        <section className="card-premium p-6">Loading your account...</section>
      </div>
    );
  }

  return (
    <div className="section-shell max-w-2xl py-10">
      <section className="card-premium p-6 sm:p-8">
        <p className="eyebrow">Account</p>
        <h1 className="page-title mt-2">Profile settings</h1>

        <form className="mt-6 space-y-4" onSubmit={onSave}>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Role</span>
            <select
              value={formData.role}
              onChange={(event) => setFormData((current) => ({ ...current, role: event.target.value as UserRole }))}
              className="focus-ring input-field"
            >
              {USER_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Full name</span>
            <input
              value={formData.full_name}
              onChange={(event) => setFormData((current) => ({ ...current, full_name: event.target.value }))}
              className="focus-ring input-field"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Phone</span>
              <input
                value={formData.phone}
                onChange={(event) => setFormData((current) => ({ ...current, phone: event.target.value }))}
                className="focus-ring input-field"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Email</span>
              <input
                type="email"
                value={formData.email}
                onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
                className="focus-ring input-field"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Default location</span>
            <input
              value={formData.default_location}
              onChange={(event) => setFormData((current) => ({ ...current, default_location: event.target.value }))}
              className="focus-ring input-field"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Latitude</span>
              <input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(event) => setFormData((current) => ({ ...current, latitude: event.target.value }))}
                className="focus-ring input-field"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Longitude</span>
              <input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(event) => setFormData((current) => ({ ...current, longitude: event.target.value }))}
                className="focus-ring input-field"
              />
            </label>
          </div>

          {errorMessage ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100">{errorMessage}</p> : null}
          {statusMessage ? <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700 ring-1 ring-emerald-100">{statusMessage}</p> : null}

          <button type="submit" disabled={isSaving} className="focus-ring btn btn-primary min-h-11 w-full disabled:opacity-60">
            {isSaving ? 'Saving profile...' : 'Save profile'}
          </button>
        </form>

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={onSignOut} className="focus-ring btn btn-secondary">
            Sign out
          </button>
          <Link href="/pro" className="focus-ring btn btn-secondary">
            Provider hub
          </Link>
        </div>
      </section>
    </div>
  );
}

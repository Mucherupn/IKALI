'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ControlAdminDashboard } from '@/components/control-admin-dashboard';
import { getSupabaseClient } from '@/lib/supabase';

type AccessState = 'loading' | 'unauthenticated' | 'forbidden' | 'allowed';

export default function ControlPage() {
  const [accessState, setAccessState] = useState<AccessState>('loading');

  useEffect(() => {
    async function check() {
      const supabase = getSupabaseClient();
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setAccessState('unauthenticated');
        return;
      }

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).maybeSingle();
      setAccessState(profile?.role === 'admin' ? 'allowed' : 'forbidden');
    }

    check();
  }, []);

  if (accessState === 'loading') return <div className="section-shell py-10">Loading admin dashboard...</div>;

  if (accessState === 'unauthenticated') {
    return (
      <div className="section-shell max-w-2xl py-10">
        <section className="card-premium p-6 sm:p-8">
          <h1 className="page-title">Admin login required</h1>
          <Link href="/login?next=%2Fcontrol" className="focus-ring btn btn-primary mt-4 inline-flex">
            Sign in
          </Link>
        </section>
      </div>
    );
  }

  if (accessState === 'forbidden') {
    return (
      <div className="section-shell max-w-2xl py-10">
        <section className="card-premium p-6 sm:p-8">
          <h1 className="page-title">Admin only</h1>
          <p className="mt-2 text-sm text-slate-600">Your account does not have access to /control.</p>
        </section>
      </div>
    );
  }

  return <ControlAdminDashboard />;
}

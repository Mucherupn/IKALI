'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';

type AccessState = 'loading' | 'unauthenticated' | 'forbidden' | 'allowed';

export default function ProPage() {
  const [accessState, setAccessState] = useState<AccessState>('loading');

  useEffect(() => {
    let isMounted = true;

    async function checkAccess() {
      const supabase = getSupabaseClient();
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (!session?.user) {
        setAccessState('unauthenticated');
        return;
      }

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).maybeSingle();
      const canAccess = profile?.role === 'provider' || profile?.role === 'admin';
      setAccessState(canAccess ? 'allowed' : 'forbidden');
    }

    checkAccess();

    return () => {
      isMounted = false;
    };
  }, []);

  if (accessState === 'loading') {
    return (
      <div className="section-shell py-10">
        <section className="card-premium p-6">Checking provider access...</section>
      </div>
    );
  }

  if (accessState === 'unauthenticated') {
    return (
      <div className="section-shell max-w-2xl py-10">
        <section className="card-premium p-6 sm:p-8">
          <h1 className="page-title">Provider Hub</h1>
          <p className="mt-3 text-slate-600">Please log in with a provider account to access /pro.</p>
          <Link href="/login?next=%2Fpro" className="focus-ring btn btn-primary mt-5 inline-flex">
            Log in
          </Link>
        </section>
      </div>
    );
  }

  if (accessState === 'forbidden') {
    return (
      <div className="section-shell max-w-2xl py-10">
        <section className="card-premium p-6 sm:p-8">
          <h1 className="page-title">Provider access required</h1>
          <p className="mt-3 text-slate-600">Your account is not marked as provider/admin yet. Update your role in Account settings.</p>
          <Link href="/account" className="focus-ring btn btn-secondary mt-5 inline-flex">
            Go to account
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="section-shell py-10">
      <section className="card-premium p-6 sm:p-8">
        <p className="eyebrow">/pro</p>
        <h1 className="page-title mt-2">Provider Hub</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          You are logged in as a provider/admin. This workspace is ready for professional tools such as lead management, booking updates, and payout setup.
        </p>
      </section>
    </div>
  );
}

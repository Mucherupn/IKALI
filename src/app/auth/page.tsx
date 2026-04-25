'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthLandingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const nextPath = searchParams.get('next');

  useEffect(() => {
    if (mode !== 'signup' && mode !== 'login') return;
    const destination = mode === 'signup' ? '/signup' : '/login';
    const query = nextPath ? `?next=${encodeURIComponent(nextPath)}` : '';
    router.replace(`${destination}${query}`);
  }, [mode, nextPath, router]);

  const signupHref = nextPath ? `/signup?next=${encodeURIComponent(nextPath)}` : '/signup';
  const loginHref = nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : '/login';

  return (
    <div className="section-shell max-w-xl py-10">
      <section className="card-premium p-6 sm:p-8">
        <p className="eyebrow">Account access</p>
        <h1 className="page-title mt-2">Sign in or create your I-Kali account</h1>
        <p className="mt-2 text-sm text-slate-600">One account lets you request services and apply to become a pro anytime.</p>

        <div className="mt-6 grid gap-3">
          <Link href={loginHref} className="focus-ring btn btn-primary min-h-11 w-full text-center">
            Sign in
          </Link>
          <Link href={signupHref} className="focus-ring btn btn-secondary min-h-11 w-full text-center">
            Sign up
          </Link>
        </div>
      </section>
    </div>
  );
}

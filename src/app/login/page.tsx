'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') || '/account';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) throw error;

      router.push(nextPath);
      router.refresh();
    } catch {
      setErrorMessage('Unable to log in. Please confirm your email and password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="section-shell max-w-xl py-10">
      <section className="card-premium p-6 sm:p-8">
        <p className="eyebrow">Welcome back</p>
        <h1 className="page-title mt-2">Log in</h1>
        <p className="mt-2 text-sm text-slate-600">You only need an account when hiring a pro or submitting a booking.</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="focus-ring input-field"
              placeholder="you@example.com"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="focus-ring input-field"
              placeholder="••••••••"
            />
          </label>

          {errorMessage ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100">{errorMessage}</p> : null}

          <button type="submit" disabled={isSubmitting} className="focus-ring btn btn-primary min-h-11 w-full disabled:opacity-60">
            {isSubmitting ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p className="mt-5 text-sm text-slate-600">
          New to I Kali?{' '}
          <Link href={`/signup?next=${encodeURIComponent(nextPath)}`} className="font-semibold text-[#D71920] hover:text-[#A80F1A]">
            Create an account
          </Link>
        </p>
      </section>
    </div>
  );
}

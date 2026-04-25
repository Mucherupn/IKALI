'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { ensureCustomerProfile, getCurrentProfile, getRedirectForProfile } from '@/lib/auth';
import { getSupabaseClient, getSupabaseConfigError } from '@/lib/supabase';
import { isValidEmail, normalizeEmail } from '@/lib/validation';

const isDevelopment = process.env.NODE_ENV === 'development';

function toLoginErrorMessage(message: string) {
  const normalized = message.toLowerCase();

  if (
    normalized.includes('invalid login credentials') ||
    normalized.includes('email not confirmed') ||
    normalized.includes('email_not_confirmed') ||
    normalized.includes('invalid_credentials')
  ) {
    return 'Invalid email or password.';
  }

  return 'Unable to sign in right now. Please try again.';
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next');
  const configError = getSupabaseConfigError();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setEmailError('');
    setPasswordError('');

    if (configError) {
      setErrorMessage('Authentication is unavailable due to missing Supabase configuration.');
      return;
    }

    const normalizedEmail = normalizeEmail(email);
    let hasError = false;

    if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
      setEmailError('Enter a valid email address.');
      hasError = true;
    }

    if (!password) {
      setPasswordError('Password is required.');
      hasError = true;
    }

    if (hasError) {
      setErrorMessage('Please fix the highlighted fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password
      });

      if (error) {
        if (isDevelopment) {
          console.error('Login auth error', error);
        }
        setErrorMessage(toLoginErrorMessage(error.message));
        return;
      }

      if (!data.user) {
        setErrorMessage('Sign in completed without a user account. Please try again.');
        return;
      }

      let profile = await getCurrentProfile(data.user.id);
      if (!profile) {
        const ensured = await ensureCustomerProfile(data.user, { email: normalizedEmail });
        if (ensured.error) {
          if (isDevelopment) {
            console.error('Login profile ensure error', ensured.error);
          }
          setErrorMessage('You are signed in, but profile setup failed. Please refresh and try again.');
          return;
        }
        profile = ensured.profile;
      }

      const destination = getRedirectForProfile(profile, nextPath);
      router.push(destination);
      router.refresh();
    } catch (error) {
      if (isDevelopment) {
        console.error('Login unexpected error', error);
      }
      setErrorMessage('Unable to sign in right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="section-shell max-w-xl py-10">
      <section className="card-premium p-6 sm:p-8">
        <p className="eyebrow">Welcome back</p>
        <h1 className="page-title mt-2">Sign in</h1>
        <p className="mt-2 text-sm text-slate-600">Use your I-Kali account to request services, manage bookings, or continue pro onboarding.</p>
        {configError ? <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800 ring-1 ring-amber-100">Developer setup error: {configError}</p> : null}

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
            {emailError ? <p className="mt-1 text-xs text-red-600">{emailError}</p> : null}
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="focus-ring input-field"
              placeholder="••••••••"
            />
            {passwordError ? <p className="mt-1 text-xs text-red-600">{passwordError}</p> : null}
          </label>

          {errorMessage ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100">{errorMessage}</p> : null}

          <button type="submit" disabled={isSubmitting || Boolean(configError)} className="focus-ring btn btn-primary min-h-11 w-full disabled:opacity-60">
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-5 text-sm text-slate-600">
          New to I Kali?{' '}
          <Link href={`/signup${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ''}`} className="font-semibold text-[#D71920] hover:text-[#A80F1A]">
            Create an account
          </Link>
        </p>
      </section>
    </div>
  );
}

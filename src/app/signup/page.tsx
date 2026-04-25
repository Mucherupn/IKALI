'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') || '/account';

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [defaultLocation, setDefaultLocation] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  function toSignupErrorMessage(message: string | undefined) {
    const normalized = message?.toLowerCase() ?? '';
    if (normalized.includes('already') || normalized.includes('registered') || normalized.includes('exists')) {
      return 'An account with this email already exists. Please sign in instead.';
    }
    return 'Unable to create account. Please review your details and try again.';
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Password and confirm password must match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            role: 'customer'
          }
        }
      });

      if (error) {
        setErrorMessage(toSignupErrorMessage(error.message));
        return;
      }

      if (!data.user) {
        setErrorMessage('Unable to create account right now. Please try again.');
        return;
      }

      if (!data.session) {
        setSuccessMessage('Account created. Please check your email to confirm your account.');
        return;
      }

      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        role: 'customer',
        pro_application_status: 'not_applied',
        full_name: fullName.trim() || null,
        phone: phone.trim() || null,
        email: email.trim(),
        default_location: defaultLocation.trim() || null,
        updated_at: new Date().toISOString()
      });

      if (profileError) {
        setSuccessMessage('Account created. Please sign in to finish setting up your profile.');
        return;
      }

      router.push(nextPath);
      router.refresh();
    } catch {
      setErrorMessage('Unable to create account right now. Please try again shortly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="section-shell max-w-xl py-10">
      <section className="card-premium p-6 sm:p-8">
        <p className="eyebrow">Join I Kali</p>
        <h1 className="page-title mt-2">Create your I-Kali account.</h1>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Full name*</span>
            <input required value={fullName} onChange={(event) => setFullName(event.target.value)} className="focus-ring input-field" placeholder="Your name" />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Phone number*</span>
              <input required value={phone} onChange={(event) => setPhone(event.target.value)} className="focus-ring input-field" placeholder="+254..." />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Location*</span>
              <input required value={defaultLocation} onChange={(event) => setDefaultLocation(event.target.value)} className="focus-ring input-field" placeholder="Nairobi" />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Email*</span>
            <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="focus-ring input-field" />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Password*</span>
            <input type="password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} className="focus-ring input-field" />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Confirm password*</span>
            <input type="password" required minLength={6} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="focus-ring input-field" />
          </label>

          {errorMessage ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100">{errorMessage}</p> : null}
          {successMessage ? <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700 ring-1 ring-emerald-100">{successMessage}</p> : null}

          <button type="submit" disabled={isSubmitting} className="focus-ring btn btn-primary min-h-11 w-full disabled:opacity-60">
            {isSubmitting ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <p className="mt-5 text-sm text-slate-600">
          Already registered?{' '}
          <Link href={`/login?next=${encodeURIComponent(nextPath)}`} className="font-semibold text-[#D71920] hover:text-[#A80F1A]">
            Sign in
          </Link>
        </p>
      </section>
    </div>
  );
}

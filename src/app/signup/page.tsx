'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { ensureCustomerProfile, getRedirectForProfile } from '@/lib/auth';
import { getSupabaseClient, getSupabaseConfigError } from '@/lib/supabase';
import {
  isValidEmail,
  isValidFullName,
  normalizeEmail,
  normalizeKenyanPhone,
  normalizeLocation,
  normalizeName,
  validatePassword
} from '@/lib/validation';

const isDevelopment = process.env.NODE_ENV === 'development';

function toSignupErrorMessage(message: string | undefined) {
  const normalized = message?.toLowerCase() ?? '';

  if (normalized.includes('email rate limit exceeded') || normalized.includes('rate limit')) {
    return 'Too many signup attempts. Please wait a few minutes and try again.';
  }

  if (normalized.includes('already') || normalized.includes('registered') || normalized.includes('exists')) {
    return 'An account with this email already exists. Please sign in instead.';
  }

  if (normalized.includes('password')) {
    return 'Password does not meet requirements.';
  }

  if (message && message.trim().length > 0) {
    return message;
  }

  return 'Unable to create account right now. Please try again shortly.';
}

type SignupErrors = {
  fullName?: string;
  phone?: string;
  defaultLocation?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') || '/account';
  const configError = getSupabaseConfigError();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [defaultLocation, setDefaultLocation] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<SignupErrors>({});
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSignInLink, setShowSignInLink] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setShowSignInLink(false);
    setFieldErrors({});

    if (configError) {
      setErrorMessage('Signup is unavailable due to missing Supabase configuration.');
      return;
    }

    const normalizedName = normalizeName(fullName);
    const normalizedEmail = normalizeEmail(email);
    const normalizedPhone = normalizeKenyanPhone(phone);
    const normalizedLocation = normalizeLocation(defaultLocation);

    const errors: SignupErrors = {};

    if (!normalizedName) {
      errors.fullName = 'Full name is required.';
    } else if (!isValidFullName(normalizedName)) {
      errors.fullName = 'Enter a valid full name.';
    }

    if (!normalizedEmail) {
      errors.email = 'Email is required.';
    } else if (!isValidEmail(normalizedEmail)) {
      errors.email = 'Enter a valid email address.';
    }

    if (!phone.trim()) {
      errors.phone = 'Phone number is required.';
    } else if (!normalizedPhone) {
      errors.phone = 'Enter a valid Kenyan phone number.';
    }

    if (!normalizedLocation) {
      errors.defaultLocation = 'Location is required.';
    } else if (normalizedLocation.length < 2) {
      errors.defaultLocation = 'Enter a valid location.';
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      errors.password = passwordCheck.message;
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Confirm your password.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage('Please fix the highlighted fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: normalizedName,
            role: 'customer'
          }
        }
      });

      if (error) {
        if (isDevelopment) {
          console.error('Signup auth error', error);
        }
        setErrorMessage(toSignupErrorMessage(error.message));
        return;
      }

      if (!data.user) {
        setErrorMessage('Unable to create account right now. Please try again.');
        return;
      }

      const ensured = await ensureCustomerProfile(data.user, {
        full_name: normalizedName,
        phone: normalizedPhone!,
        email: normalizedEmail,
        default_location: normalizedLocation
      });

      if (ensured.error && isDevelopment) {
        console.error('Signup profile upsert error', ensured.error);
      }

      if (!data.session) {
        setSuccessMessage('Account created. Please sign in to continue.');
        setShowSignInLink(true);
        return;
      }

      setSuccessMessage('Account created successfully.');

      const destination = getRedirectForProfile(ensured.profile, nextPath);
      router.push(destination);
      router.refresh();
    } catch (error) {
      if (isDevelopment) {
        console.error('Signup unexpected error', error);
      }
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
        {configError ? <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800 ring-1 ring-amber-100">Developer setup error: {configError}</p> : null}

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Full name*</span>
            <input required value={fullName} onChange={(event) => setFullName(event.target.value)} className="focus-ring input-field" placeholder="Your name" />
            {fieldErrors.fullName ? <p className="mt-1 text-xs text-red-600">{fieldErrors.fullName}</p> : null}
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Phone number*</span>
              <input required value={phone} onChange={(event) => setPhone(event.target.value)} className="focus-ring input-field" placeholder="+254..." />
              {fieldErrors.phone ? <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p> : null}
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Location*</span>
              <input required value={defaultLocation} onChange={(event) => setDefaultLocation(event.target.value)} className="focus-ring input-field" placeholder="Nairobi" />
              {fieldErrors.defaultLocation ? <p className="mt-1 text-xs text-red-600">{fieldErrors.defaultLocation}</p> : null}
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Email*</span>
            <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="focus-ring input-field" />
            {fieldErrors.email ? <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p> : null}
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Password*</span>
            <input type="password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className="focus-ring input-field" />
            {fieldErrors.password ? <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p> : null}
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Confirm password*</span>
            <input type="password" required minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="focus-ring input-field" />
            {fieldErrors.confirmPassword ? <p className="mt-1 text-xs text-red-600">{fieldErrors.confirmPassword}</p> : null}
          </label>

          {errorMessage ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100">{errorMessage}</p> : null}
          {successMessage ? <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700 ring-1 ring-emerald-100">{successMessage}</p> : null}
          {showSignInLink ? (
            <Link href={`/login?next=${encodeURIComponent(nextPath)}`} className="inline-flex text-sm font-semibold text-[#D71920] hover:text-[#A80F1A]">
              Sign in now
            </Link>
          ) : null}

          <button type="submit" disabled={isSubmitting || Boolean(configError)} className="focus-ring btn btn-primary min-h-11 w-full disabled:opacity-60">
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

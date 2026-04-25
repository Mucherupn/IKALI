'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Database } from '@/lib/database.types';
import { getSupabaseClient } from '@/lib/supabase';
import {
  isValidEmail,
  isValidFullName,
  normalizeEmail,
  normalizeKenyanPhone,
  normalizeLocation,
  normalizeName
} from '@/lib/validation';

type ExistingApplication = Pick<
  Database['public']['Tables']['pro_applications']['Row'],
  'id' | 'status' | 'created_at' | 'updated_at' | 'rejection_reason' | 'admin_notes'
>;

const initialFormState = {
  full_name: '',
  phone: '',
  email: '',
  main_service_category_id: '',
  other_services: '',
  service_areas: '',
  years_experience: '0',
  bio: '',
  availability: '',
  location: '',
  profile_photo_url: '',
  portfolio_notes: '',
  proof_document_url: '',
  certification_notes: '',
  references: '',
  price_guide: ''
};

type ProApplicationErrors = Partial<Record<keyof typeof initialFormState, string>> & {
  agreements?: string;
};

export default function BecomeAProApplyPage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<ProApplicationErrors>({});
  const [success, setSuccess] = useState(false);
  const [existingApplication, setExistingApplication] = useState<ExistingApplication | null>(null);
  const [agreements, setAgreements] = useState({ verification: false, accurateInfo: false });
  const [form, setForm] = useState(initialFormState);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    async function boot() {
      const supabase = getSupabaseClient();
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace('/auth?mode=signup&next=/become-a-pro/apply');
        return;
      }

      const [profileRes, categoriesRes, existingApplicationRes] = await Promise.all([
        supabase.from('profiles').select('full_name, phone, email, default_location').eq('id', session.user.id).maybeSingle(),
        supabase.from('service_categories').select('id, name').eq('is_active', true).order('name'),
        supabase
          .from('pro_applications')
          .select('id, status, created_at, updated_at, rejection_reason, admin_notes')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
      ]);

      setCategories(categoriesRes.data ?? []);
      setExistingApplication(existingApplicationRes.data ?? null);

      setForm((current) => ({
        ...current,
        full_name: profileRes.data?.full_name ?? '',
        phone: profileRes.data?.phone ?? '',
        email: profileRes.data?.email ?? session.user.email ?? '',
        location: profileRes.data?.default_location ?? ''
      }));

      setIsReady(true);
    }

    boot();
  }, [router]);

  const applicationStatus = existingApplication?.status;
  const isPending = applicationStatus === 'pending' || applicationStatus === 'needs_more_info';
  const isApproved = applicationStatus === 'approved';
  const isRejected = applicationStatus === 'rejected';

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setFieldErrors({});

    const normalizedName = normalizeName(form.full_name);
    const normalizedEmail = normalizeEmail(form.email);
    const normalizedPhone = normalizeKenyanPhone(form.phone);
    const normalizedLocation = normalizeLocation(form.location);
    const serviceAreas = form.service_areas.trim();
    const availability = form.availability.trim();
    const bio = form.bio.trim();
    const yearsExperience = Number(form.years_experience);
    const priceGuide = form.price_guide.trim();

    const errors: ProApplicationErrors = {};

    if (!normalizedName) {
      errors.full_name = 'Full name is required.';
    } else if (!isValidFullName(normalizedName)) {
      errors.full_name = 'Enter a valid full name.';
    }

    if (!normalizedPhone) {
      errors.phone = 'Enter a valid Kenyan phone number.';
    }

    if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
      errors.email = 'Enter a valid email address.';
    }

    if (!normalizedLocation || normalizedLocation.length < 2) {
      errors.location = 'Enter a valid location.';
    }

    if (!form.main_service_category_id) {
      errors.main_service_category_id = 'Select your main service.';
    }

    if (!serviceAreas || serviceAreas.length < 2) {
      errors.service_areas = 'Enter your service areas.';
    }

    if (!Number.isFinite(yearsExperience) || yearsExperience < 0 || yearsExperience > 60) {
      errors.years_experience = 'Years of experience must be between 0 and 60.';
    }

    if (!availability) {
      errors.availability = 'Availability is required.';
    }

    if (!bio) {
      errors.bio = 'Bio is required.';
    } else if (bio.length < 30) {
      errors.bio = 'Bio must be at least 30 characters.';
    } else if (bio.length > 600) {
      errors.bio = 'Bio must be 600 characters or less.';
    }

    if (priceGuide.length > 120) {
      errors.price_guide = 'Price guide must be 120 characters or less.';
    }

    if (!agreements.verification || !agreements.accurateInfo) {
      errors.agreements = 'Please confirm both trust statements.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage('Please fix the highlighted fields.');
      setIsSubmitting(false);
      return;
    }

    try {
      const supabase = getSupabaseClient();
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace('/auth?mode=signup&next=/become-a-pro/apply');
        return;
      }

      const { data: latestApplication } = await supabase
        .from('pro_applications')
        .select('id, status, rejection_reason, admin_notes, created_at, updated_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestApplication?.status === 'pending' || latestApplication?.status === 'needs_more_info') {
        setExistingApplication({
          id: latestApplication.id,
          status: latestApplication.status,
          created_at: latestApplication.created_at ?? existingApplication?.created_at ?? new Date().toISOString(),
          updated_at: latestApplication.updated_at ?? new Date().toISOString(),
          rejection_reason: latestApplication.rejection_reason ?? null,
          admin_notes: latestApplication.admin_notes ?? null
        });
        setErrorMessage('Your pro application is under review.');
        setIsSubmitting(false);
        return;
      }

      const payload: Database['public']['Tables']['pro_applications']['Insert'] = {
        user_id: session.user.id,
        full_name: normalizedName,
        phone: normalizedPhone!,
        email: normalizedEmail,
        main_service_category_id: form.main_service_category_id,
        other_services: form.other_services.trim() || null,
        service_areas: serviceAreas,
        years_experience: yearsExperience,
        bio,
        availability,
        location: normalizedLocation,
        profile_photo_url: form.profile_photo_url.trim() || 'placeholder://profile-photo',
        proof_document_url: form.proof_document_url.trim() || null,
        portfolio_notes: [form.portfolio_notes, form.certification_notes, form.references].filter(Boolean).join('\n') || null,
        price_guide: priceGuide || null,
        status: 'pending',
        updated_at: new Date().toISOString()
      };

      if (latestApplication?.status === 'rejected') {
        const updates: Database['public']['Tables']['pro_applications']['Update'] = {
          ...payload,
          status: 'pending',
          rejection_reason: null,
          admin_notes: null,
          updated_at: new Date().toISOString()
        };
        const { error: updateApplicationError } = await supabase.from('pro_applications').update(updates).eq('id', latestApplication.id);
        if (updateApplicationError) throw updateApplicationError;
      } else {
        const { error: applicationError } = await supabase.from('pro_applications').insert(payload);
        if (applicationError) throw applicationError;
      }

      const { error: profileError } = await supabase.from('profiles').upsert({
        id: session.user.id,
        role: 'customer',
        full_name: normalizedName || null,
        phone: normalizedPhone || null,
        email: normalizedEmail || session.user.email || null,
        default_location: normalizedLocation || null,
        pro_application_status: 'pending',
        updated_at: new Date().toISOString()
      });

      if (profileError) throw profileError;

      setSuccess(true);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Pro application submit error', error);
      }
      setErrorMessage('Unable to submit your application right now. Please review your details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isReady) {
    return <div className="section-shell py-10 text-sm text-slate-600">Preparing application form…</div>;
  }

  if (isPending) {
    return (
      <div className="section-shell max-w-3xl py-10">
        <section className="card-premium p-6 sm:p-8">
          <h1 className="page-title">Your pro application is under review.</h1>
          <p className="mt-3 text-slate-700">An I-Kali admin will review your account and contact you if more details are needed.</p>
        </section>
      </div>
    );
  }

  if (isApproved) {
    return (
      <div className="section-shell max-w-3xl py-10">
        <section className="card-premium p-6 sm:p-8">
          <h1 className="page-title">Your pro account is active.</h1>
          <p className="mt-3 text-slate-700">Your application has already been approved.</p>
          <Link href="/pro" className="focus-ring btn btn-primary mt-5 inline-flex">
            Go to Pro Dashboard
          </Link>
        </section>
      </div>
    );
  }

  if (success) {
    return (
      <div className="section-shell max-w-3xl py-10">
        <section className="card-premium p-6 sm:p-8">
          <h1 className="page-title">Application submitted</h1>
          <p className="mt-4 text-slate-700">Your application has been received. An I-Kali admin will review your account within 24 hours.</p>
          <p className="mt-2 text-slate-700">Once approved, your provider profile can appear in service results.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="section-shell max-w-4xl py-10">
      <section className="card-premium p-6 sm:p-8">
        <h1 className="page-title">Apply to become an I-Kali Pro.</h1>
        <p className="mt-2 text-sm text-slate-600">Complete all required details so the admin team can verify and review your application.</p>

        {isRejected ? (
          <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800 ring-1 ring-amber-200">
            Your application was not approved. You can submit an updated application below.
            {existingApplication?.rejection_reason ? ` Reason: ${existingApplication.rejection_reason}` : ''}
          </p>
        ) : null}

        <form className="mt-6 space-y-6" onSubmit={onSubmit}>
          <section>
            <h2 className="text-base font-semibold text-slate-900">1. Account and contact</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <input required value={form.full_name} onChange={(event) => setForm((current) => ({ ...current, full_name: event.target.value }))} className="focus-ring input-field" placeholder="Full name*" />
              {fieldErrors.full_name ? <p className="-mt-2 text-xs text-red-600">{fieldErrors.full_name}</p> : null}
              <input required value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} className="focus-ring input-field" placeholder="Phone number*" />
              {fieldErrors.phone ? <p className="-mt-2 text-xs text-red-600">{fieldErrors.phone}</p> : null}
              <input required type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} className="focus-ring input-field" placeholder="Email*" />
              {fieldErrors.email ? <p className="-mt-2 text-xs text-red-600">{fieldErrors.email}</p> : null}
              <input required value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} className="focus-ring input-field" placeholder="Location*" />
              {fieldErrors.location ? <p className="-mt-2 text-xs text-red-600">{fieldErrors.location}</p> : null}
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900">2. Service details</h2>
            <div className="mt-3 grid gap-4">
              <select required value={form.main_service_category_id} onChange={(event) => setForm((current) => ({ ...current, main_service_category_id: event.target.value }))} className="focus-ring input-field">
                <option value="">Main service category*</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {fieldErrors.main_service_category_id ? <p className="-mt-2 text-xs text-red-600">{fieldErrors.main_service_category_id}</p> : null}
              <input required value={form.other_services} onChange={(event) => setForm((current) => ({ ...current, other_services: event.target.value }))} className="focus-ring input-field" placeholder="Other services offered*" />
              <input required value={form.service_areas} onChange={(event) => setForm((current) => ({ ...current, service_areas: event.target.value }))} className="focus-ring input-field" placeholder="Service areas*" />
              {fieldErrors.service_areas ? <p className="-mt-2 text-xs text-red-600">{fieldErrors.service_areas}</p> : null}
              <input required type="number" min={0} value={form.years_experience} onChange={(event) => setForm((current) => ({ ...current, years_experience: event.target.value }))} className="focus-ring input-field" placeholder="Years of experience*" />
              {fieldErrors.years_experience ? <p className="-mt-2 text-xs text-red-600">{fieldErrors.years_experience}</p> : null}
              <input required value={form.availability} onChange={(event) => setForm((current) => ({ ...current, availability: event.target.value }))} className="focus-ring input-field" placeholder="Availability*" />
              {fieldErrors.availability ? <p className="-mt-2 text-xs text-red-600">{fieldErrors.availability}</p> : null}
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900">3. Professional profile</h2>
            <div className="mt-3 grid gap-4">
              <textarea required rows={3} value={form.bio} onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))} className="focus-ring input-field" placeholder="Short bio*" />
              {fieldErrors.bio ? <p className="-mt-2 text-xs text-red-600">{fieldErrors.bio}</p> : null}
              <input value={form.price_guide} onChange={(event) => setForm((current) => ({ ...current, price_guide: event.target.value }))} className="focus-ring input-field" placeholder="Price guide" />
              {fieldErrors.price_guide ? <p className="-mt-2 text-xs text-red-600">{fieldErrors.price_guide}</p> : null}
              <input value={form.profile_photo_url} onChange={(event) => setForm((current) => ({ ...current, profile_photo_url: event.target.value }))} className="focus-ring input-field" placeholder="Profile photo URL placeholder" />
              <textarea value={form.portfolio_notes} onChange={(event) => setForm((current) => ({ ...current, portfolio_notes: event.target.value }))} className="focus-ring input-field" placeholder="Portfolio notes or project examples" rows={2} />
              <input value={form.proof_document_url} onChange={(event) => setForm((current) => ({ ...current, proof_document_url: event.target.value }))} className="focus-ring input-field" placeholder="Proof / ID / certification URL placeholder" />
              <textarea value={form.certification_notes} onChange={(event) => setForm((current) => ({ ...current, certification_notes: event.target.value }))} className="focus-ring input-field" placeholder="Proof/ID/certification notes" rows={2} />
              <textarea value={form.references} onChange={(event) => setForm((current) => ({ ...current, references: event.target.value }))} className="focus-ring input-field" placeholder="References or additional project examples" rows={2} />
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900">4. Trust confirmation</h2>
            <div className="mt-3 space-y-3 text-sm text-slate-700">
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={agreements.verification}
                  onChange={(event) => setAgreements((current) => ({ ...current, verification: event.target.checked }))}
                  className="mt-0.5"
                />
                <span>I agree to I-Kali verification checks and understand admin review is required before public listing.</span>
              </label>
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={agreements.accurateInfo}
                  onChange={(event) => setAgreements((current) => ({ ...current, accurateInfo: event.target.checked }))}
                  className="mt-0.5"
                />
                <span>I confirm the information submitted is accurate.</span>
              </label>
            </div>
            {fieldErrors.agreements ? <p className="mt-2 text-xs text-red-600">{fieldErrors.agreements}</p> : null}
          </section>

          {/* TODO: Replace URL/notes placeholders with Supabase Storage upload fields once storage + policies are ready. */}
          {errorMessage ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100">{errorMessage}</p> : null}

          <button disabled={isSubmitting} type="submit" className="focus-ring btn btn-primary min-h-11 w-full sm:w-auto">
            {isSubmitting ? 'Submitting…' : 'Submit application'}
          </button>
        </form>
      </section>
    </div>
  );
}

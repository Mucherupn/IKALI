'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Database } from '@/lib/database.types';
import { getSupabaseClient } from '@/lib/supabase';

type ExistingApplication = Pick<
  Database['public']['Tables']['pro_applications']['Row'],
  'id' | 'status' | 'created_at' | 'updated_at'
>;

export default function BecomeAProApplyPage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [existingApplication, setExistingApplication] = useState<ExistingApplication | null>(null);
  const [agreements, setAgreements] = useState({ verification: false, accurateInfo: false });
  const [form, setForm] = useState({
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
  });
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
        supabase.from('pro_applications').select('id, status, created_at, updated_at').eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(1).maybeSingle()
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

    if (!agreements.verification || !agreements.accurateInfo) {
      setErrorMessage('Please confirm both trust statements before submitting your application.');
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
        .select('id, status')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestApplication?.status === 'pending' || latestApplication?.status === 'needs_more_info') {
        setExistingApplication({
          id: latestApplication.id,
          status: latestApplication.status,
          created_at: existingApplication?.created_at ?? new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        setErrorMessage('Your pro application is under review.');
        setIsSubmitting(false);
        return;
      }

      const payload: Database['public']['Tables']['pro_applications']['Insert'] = {
        user_id: session.user.id,
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        main_service_category_id: form.main_service_category_id,
        other_services: form.other_services.trim() || null,
        service_areas: form.service_areas.trim(),
        years_experience: Number(form.years_experience) || 0,
        bio: form.bio.trim(),
        availability: form.availability.trim(),
        location: form.location.trim(),
        profile_photo_url: form.profile_photo_url.trim() || 'placeholder://profile-photo',
        proof_document_url: form.proof_document_url.trim() || null,
        portfolio_notes: [form.portfolio_notes, form.certification_notes, form.references].filter(Boolean).join('\n') || null,
        price_guide: form.price_guide.trim() || null,
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
        full_name: form.full_name.trim() || null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || session.user.email || null,
        default_location: form.location.trim() || null,
        pro_application_status: 'pending',
        updated_at: new Date().toISOString()
      });

      if (profileError) throw profileError;

      setSuccess(true);
    } catch {
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
          </p>
        ) : null}

        <form className="mt-6 space-y-6" onSubmit={onSubmit}>
          <section>
            <h2 className="text-base font-semibold text-slate-900">1. Account and contact</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <input required value={form.full_name} onChange={(event) => setForm((current) => ({ ...current, full_name: event.target.value }))} className="focus-ring input-field" placeholder="Full name*" />
              <input required value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} className="focus-ring input-field" placeholder="Phone number*" />
              <input required type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} className="focus-ring input-field" placeholder="Email*" />
              <input required value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} className="focus-ring input-field" placeholder="Location*" />
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
              <input required value={form.other_services} onChange={(event) => setForm((current) => ({ ...current, other_services: event.target.value }))} className="focus-ring input-field" placeholder="Other services offered*" />
              <input required value={form.service_areas} onChange={(event) => setForm((current) => ({ ...current, service_areas: event.target.value }))} className="focus-ring input-field" placeholder="Service areas*" />
              <input required type="number" min={0} value={form.years_experience} onChange={(event) => setForm((current) => ({ ...current, years_experience: event.target.value }))} className="focus-ring input-field" placeholder="Years of experience*" />
              <input required value={form.availability} onChange={(event) => setForm((current) => ({ ...current, availability: event.target.value }))} className="focus-ring input-field" placeholder="Availability*" />
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900">3. Professional profile</h2>
            <div className="mt-3 grid gap-4">
              <textarea required rows={3} value={form.bio} onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))} className="focus-ring input-field" placeholder="Short bio*" />
              <input value={form.price_guide} onChange={(event) => setForm((current) => ({ ...current, price_guide: event.target.value }))} className="focus-ring input-field" placeholder="Price guide" />
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

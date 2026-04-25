'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';

export default function BecomeAProApplyPage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);
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
        router.replace('/signup?next=/become-a-pro/apply');
        return;
      }

      const [profileRes, categoriesRes] = await Promise.all([
        supabase.from('profiles').select('full_name, phone, email, default_location').eq('id', session.user.id).maybeSingle(),
        supabase.from('service_categories').select('id, name').eq('is_active', true).order('name')
      ]);

      setCategories(categoriesRes.data ?? []);

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

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const supabase = getSupabaseClient();
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace('/signup?next=/become-a-pro/apply');
        return;
      }

      const { error: applicationError } = await supabase.from('pro_applications').insert({
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
        profile_photo_url: form.profile_photo_url.trim(),
        proof_document_url: form.proof_document_url.trim() || null,
        portfolio_notes: [form.portfolio_notes, form.certification_notes, form.references].filter(Boolean).join('\n') || null,
        price_guide: form.price_guide.trim() || null,
        status: 'pending',
        updated_at: new Date().toISOString()
      });

      if (applicationError) throw applicationError;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ pro_application_status: 'pending', updated_at: new Date().toISOString() })
        .eq('id', session.user.id);

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

  if (success) {
    return (
      <div className="section-shell max-w-3xl py-10">
        <section className="card-premium p-6 sm:p-8">
          <h1 className="page-title">Application submitted</h1>
          <p className="mt-4 text-slate-700">Your application has been received.</p>
          <p className="mt-2 text-slate-700">An I-Kali admin will review your account within 24 hours.</p>
          <p className="mt-2 text-slate-700">Once approved, your profile can appear in service results.</p>
          <p className="mt-4 text-slate-700">Thank you for helping make local service delivery more trusted.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="section-shell max-w-4xl py-10">
      <section className="card-premium p-6 sm:p-8">
        <h1 className="page-title">Pro application</h1>
        <p className="mt-2 text-sm text-slate-600">Complete all required details so the admin team can verify and activate your profile.</p>

        <form className="mt-6 space-y-6" onSubmit={onSubmit}>
          <section>
            <h2 className="text-base font-semibold text-slate-900">1. Account details</h2>
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
                <option value="">Main service*</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <input required value={form.other_services} onChange={(event) => setForm((current) => ({ ...current, other_services: event.target.value }))} className="focus-ring input-field" placeholder="Other services offered*" />
              <input required value={form.service_areas} onChange={(event) => setForm((current) => ({ ...current, service_areas: event.target.value }))} className="focus-ring input-field" placeholder="Service areas*" />
              <input required type="number" min={0} value={form.years_experience} onChange={(event) => setForm((current) => ({ ...current, years_experience: event.target.value }))} className="focus-ring input-field" placeholder="Years of experience*" />
              <textarea required rows={3} value={form.bio} onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))} className="focus-ring input-field" placeholder="Short bio*" />
              <input required value={form.availability} onChange={(event) => setForm((current) => ({ ...current, availability: event.target.value }))} className="focus-ring input-field" placeholder="Availability*" />
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900">3. Experience and trust</h2>
            <div className="mt-3 grid gap-4">
              <input required value={form.profile_photo_url} onChange={(event) => setForm((current) => ({ ...current, profile_photo_url: event.target.value }))} className="focus-ring input-field" placeholder="Profile photo URL*" />
              <textarea value={form.portfolio_notes} onChange={(event) => setForm((current) => ({ ...current, portfolio_notes: event.target.value }))} className="focus-ring input-field" placeholder="Portfolio images / links (optional placeholder)" rows={2} />
              <input value={form.proof_document_url} onChange={(event) => setForm((current) => ({ ...current, proof_document_url: event.target.value }))} className="focus-ring input-field" placeholder="ID / proof upload placeholder URL" />
              <textarea value={form.certification_notes} onChange={(event) => setForm((current) => ({ ...current, certification_notes: event.target.value }))} className="focus-ring input-field" placeholder="Certification or proof notes" rows={2} />
              <textarea value={form.references} onChange={(event) => setForm((current) => ({ ...current, references: event.target.value }))} className="focus-ring input-field" placeholder="References" rows={2} />
              <input value={form.price_guide} onChange={(event) => setForm((current) => ({ ...current, price_guide: event.target.value }))} className="focus-ring input-field" placeholder="Price guide" />
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900">4. Review and submit</h2>
            <p className="mt-2 text-sm text-slate-600">Double-check your details before submitting for admin review.</p>
          </section>

          {/* TODO: Replace URL placeholders with Supabase Storage uploaders once storage policy is finalized. */}
          {errorMessage ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100">{errorMessage}</p> : null}

          <button disabled={isSubmitting} type="submit" className="focus-ring btn btn-primary min-h-11 w-full sm:w-auto">
            {isSubmitting ? 'Submitting…' : 'Submit application'}
          </button>
        </form>
      </section>
    </div>
  );
}

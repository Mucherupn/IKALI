'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { providers as mockProviders, serviceCategories as mockServiceCategories } from '@/data/mock-data';
import { isValidUserRole } from '@/lib/auth';
import { Database } from '@/lib/database.types';
import { getSupabaseClient } from '@/lib/supabase';

type RequestFormData = {
  customerName: string;
  phoneNumber: string;
  serviceSlug: string;
  location: string;
  preferredDate: string;
  preferredTime: string;
  jobDescription: string;
  urgency: 'not-urgent' | 'within-24-hours' | 'urgent-same-day';
  providerReference: string;
};

const BOOKING_STATUS = 'requested';

type ServiceOption = Pick<Database['public']['Tables']['service_categories']['Row'], 'id' | 'name' | 'slug'>;
type ProviderOption = Pick<Database['public']['Tables']['providers']['Row'], 'id' | 'full_name' | 'slug'>;

const initialFormState: RequestFormData = {
  customerName: '',
  phoneNumber: '',
  serviceSlug: mockServiceCategories[0]?.slug ?? '',
  location: '',
  preferredDate: '',
  preferredTime: '',
  jobDescription: '',
  urgency: 'not-urgent',
  providerReference: ''
};

export function RequestForm({ initialService, initialProvider }: { initialService?: string; initialProvider?: string }) {
  const [services, setServices] = useState<ServiceOption[]>(
    mockServiceCategories.map((service) => ({ id: service.slug, name: service.name, slug: service.slug }))
  );
  const [providers, setProviders] = useState<ProviderOption[]>(
    mockProviders.map((provider) => ({ id: provider.id, full_name: provider.name, slug: provider.slug }))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [dataWarning, setDataWarning] = useState('');
  const [authReady, setAuthReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [canBookAsCustomer, setCanBookAsCustomer] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [profileLatitude, setProfileLatitude] = useState<number | null>(null);
  const [profileLongitude, setProfileLongitude] = useState<number | null>(null);

  const [formData, setFormData] = useState<RequestFormData>({
    ...initialFormState,
    serviceSlug: initialService ?? initialFormState.serviceSlug,
    providerReference: initialProvider ?? ''
  });

  useEffect(() => {
    let isMounted = true;

    async function loadSupabaseOptions() {
      try {
        const supabase = getSupabaseClient();
        const {
          data: { session }
        } = await supabase.auth.getSession();

        if (session?.user) {
          setIsAuthenticated(true);
          setCustomerId(session.user.id);
          const { data: profile } = await supabase.from('profiles').select('role, full_name, phone, latitude, longitude').eq('id', session.user.id).maybeSingle();
          const role = isValidUserRole(profile?.role) ? profile.role : null;
          setCanBookAsCustomer(role === 'customer' || role === 'provider' || role === 'admin');
          setProfileLatitude(profile?.latitude ?? null);
          setProfileLongitude(profile?.longitude ?? null);
          setFormData((current) => ({
            ...current,
            customerName: current.customerName || profile?.full_name || session.user.user_metadata?.full_name || '',
            phoneNumber: current.phoneNumber || profile?.phone || ''
          }));
        } else {
          setIsAuthenticated(false);
          setCanBookAsCustomer(false);
          setCustomerId(null);
          setProfileLatitude(null);
          setProfileLongitude(null);
        }

        setAuthReady(true);

        const [{ data: serviceRows, error: servicesError }, { data: providerRows, error: providersError }] = await Promise.all([
          supabase.from('service_categories').select('id, name, slug').eq('is_active', true).order('name'),
          supabase.from('providers').select('id, full_name, slug').eq('approval_status', 'approved').eq('is_public', true).order('full_name')
        ]);

        if (!isMounted) return;

        if (!servicesError && serviceRows && serviceRows.length > 0) {
          setServices(serviceRows);
          setFormData((current) => {
            const isCurrentValid = serviceRows.some((service) => service.slug === current.serviceSlug);
            const nextSlug = isCurrentValid ? current.serviceSlug : serviceRows[0].slug;
            return { ...current, serviceSlug: nextSlug };
          });
        }

        if (!providersError && providerRows && providerRows.length > 0) {
          setProviders(providerRows);
        }
      } catch {
        setDataWarning('Live data is currently unavailable. You can still submit your request.');
        setAuthReady(true);
      }
    }

    loadSupabaseOptions();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedServiceName = useMemo(
    () => services.find((service) => service.slug === formData.serviceSlug)?.name ?? 'Selected service',
    [formData.serviceSlug, services]
  );

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isAuthenticated) {
      setSubmitError('Please log in before submitting a booking request.');
      return;
    }

    if (!canBookAsCustomer) {
      setSubmitError('Only customer accounts can submit bookings. Update your role in Account settings.');
      return;
    }

    if (!customerId) {
      setSubmitError('Your account is not ready for booking yet. Please log in again.');
      return;
    }

    if (!formData.customerName.trim() || !formData.phoneNumber.trim() || !formData.serviceSlug || !formData.location.trim()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const supabase = getSupabaseClient();

      const selectedService = services.find((service) => service.slug === formData.serviceSlug);
      if (!selectedService) {
        throw new Error('Service not found');
      }

      const providerId = providers.find(
        (provider) =>
          provider.slug === formData.providerReference ||
          provider.full_name.toLowerCase() === formData.providerReference.toLowerCase().trim()
      )?.id;

      const payload: Database['public']['Tables']['job_requests']['Insert'] = {
        customer_id: customerId,
        customer_name: formData.customerName.trim(),
        customer_phone: formData.phoneNumber.trim(),
        service_category_id: selectedService.id,
        provider_id: providerId ?? null,
        location: formData.location.trim(),
        latitude: profileLatitude,
        longitude: profileLongitude,
        preferred_date: formData.preferredDate || null,
        preferred_time: formData.preferredTime || null,
        description: formData.jobDescription.trim() || null,
        urgency: formData.urgency,
        status: BOOKING_STATUS,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase.from('job_requests').insert(payload);

      if (error) {
        throw error;
      }

      setIsSubmitted(true);
    } catch {
      setSubmitError('We could not submit your request right now. Please try again in a moment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <section className="card-premium mt-8 p-6 sm:p-8">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-4xl" aria-hidden>
            ✅
          </p>
          <h2 className="mt-4 text-2xl font-bold text-slate-900">Request sent successfully</h2>
          <p className="mt-3 text-slate-600">
            Your booking request has been received. The provider will review and accept the request before the job becomes active.
          </p>
          <p className="mt-2 text-sm text-slate-600">We will review your request and connect you with the right professional.</p>
          <p className="mt-2 text-sm text-slate-600">
            Payment is not required yet. Once the provider accepts, you can proceed with the confirmed booking flow.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="/" className="focus-ring btn btn-primary">
              Back to Home
            </Link>
            <Link href="/services" className="focus-ring btn btn-secondary">
              Browse Services
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card-premium mt-8 space-y-5 p-5 sm:p-6">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="customerName" className="mb-2 block text-sm font-semibold text-slate-700">
            Customer name*
          </label>
          <input
            id="customerName"
            required
            value={formData.customerName}
            onChange={(event) => setFormData((current) => ({ ...current, customerName: event.target.value }))}
            className="focus-ring input-field"
            placeholder="Your full name"
          />
        </div>

        <div>
          <label htmlFor="phoneNumber" className="mb-2 block text-sm font-semibold text-slate-700">
            Phone number*
          </label>
          <input
            id="phoneNumber"
            type="tel"
            required
            value={formData.phoneNumber}
            onChange={(event) => setFormData((current) => ({ ...current, phoneNumber: event.target.value }))}
            className="focus-ring input-field"
            placeholder="e.g. +254..."
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="service" className="mb-2 block text-sm font-semibold text-slate-700">
            Service needed*
          </label>
          <select
            id="service"
            required
            value={formData.serviceSlug}
            onChange={(event) => setFormData((current) => ({ ...current, serviceSlug: event.target.value }))}
            className="focus-ring input-field"
          >
            {services.map((service) => (
              <option key={service.id} value={service.slug}>
                {service.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="location" className="mb-2 block text-sm font-semibold text-slate-700">
            Location*
          </label>
          <input
            id="location"
            required
            value={formData.location}
            onChange={(event) => setFormData((current) => ({ ...current, location: event.target.value }))}
            className="focus-ring input-field"
            placeholder="Area, estate, or landmark"
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="preferredDate" className="mb-2 block text-sm font-semibold text-slate-700">
            Preferred date
          </label>
          <input
            id="preferredDate"
            type="date"
            value={formData.preferredDate}
            onChange={(event) => setFormData((current) => ({ ...current, preferredDate: event.target.value }))}
            className="focus-ring input-field"
          />
        </div>

        <div>
          <label htmlFor="preferredTime" className="mb-2 block text-sm font-semibold text-slate-700">
            Preferred time
          </label>
          <input
            id="preferredTime"
            type="time"
            value={formData.preferredTime}
            onChange={(event) => setFormData((current) => ({ ...current, preferredTime: event.target.value }))}
            className="focus-ring input-field"
          />
        </div>
      </div>

      <div>
        <label htmlFor="jobDescription" className="mb-2 block text-sm font-semibold text-slate-700">
          Job description
        </label>
        <textarea
          id="jobDescription"
          rows={4}
          value={formData.jobDescription}
          onChange={(event) => setFormData((current) => ({ ...current, jobDescription: event.target.value }))}
          className="focus-ring input-field min-h-28 py-3"
          placeholder="Briefly describe what you need done."
        />
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-slate-700">Urgency (optional)</legend>
        <div className="grid gap-2 md:grid-cols-3">
          {[
            { value: 'not-urgent', label: 'Not urgent' },
            { value: 'within-24-hours', label: 'Within 24 hours' },
            { value: 'urgent-same-day', label: 'Urgent (same day)' }
          ].map((option) => (
            <label
              key={option.value}
              className="focus-ring flex min-h-12 cursor-pointer items-center rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700"
            >
              <input
                type="radio"
                name="urgency"
                value={option.value}
                checked={formData.urgency === option.value}
                onChange={() =>
                  setFormData((current) => ({
                    ...current,
                    urgency: option.value as RequestFormData['urgency']
                  }))
                }
                className="mr-2"
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="providerReference" className="mb-2 block text-sm font-semibold text-slate-700">
          Requested professional (optional)
        </label>
        <select
          id="providerReference"
          value={formData.providerReference}
          onChange={(event) => setFormData((current) => ({ ...current, providerReference: event.target.value }))}
          className="focus-ring input-field"
        >
          <option value="">No specific professional</option>
          {providers.map((provider) => (
            <option key={provider.id} value={provider.slug}>
              {provider.full_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-slate-700">Add photos (optional)</p>
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
          Image upload coming soon. You can still submit your request now.
        </div>
      </div>

      {formData.providerReference ? (
        <p className="rounded-xl bg-[#fff1f2] px-3 py-2 text-sm text-[#A80F1A] ring-1 ring-[#fecdd3]">
          Request linked to provider: <span className="font-semibold">{formData.providerReference}</span>
        </p>
      ) : null}


      <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200">
        I Kali uses your contact details only to connect you with a suitable professional.
      </p>


      {!authReady ? <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200">Checking account access...</p> : null}
      {authReady && !isAuthenticated ? (
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800 ring-1 ring-amber-200">
          You can browse publicly, but you must <Link href={`/login?next=${encodeURIComponent('/request')}`} className="font-semibold underline">log in</Link> to submit a booking.
        </p>
      ) : null}
      {authReady && isAuthenticated && !canBookAsCustomer ? (
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800 ring-1 ring-amber-200">Only customer accounts can submit booking requests.</p>
      ) : null}

      {dataWarning ? <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800 ring-1 ring-amber-200">{dataWarning}</p> : null}
      {submitError ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100">{submitError}</p> : null}

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting || !authReady || !isAuthenticated || !canBookAsCustomer}
          className="focus-ring btn btn-primary inline-flex min-h-12 w-full items-center justify-center disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Submitting booking request...' : `Request a booking for ${selectedServiceName}`}
        </button>
      </div>
    </form>
  );
}

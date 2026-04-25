'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Database } from '@/lib/database.types';
import { getSupabaseClient } from '@/lib/supabase';

type AccessState = 'loading' | 'unauthenticated' | 'forbidden' | 'allowed';
type JobRequestRow = Database['public']['Tables']['job_requests']['Row'];
type ProviderRow = Database['public']['Tables']['providers']['Row'];
type ServiceCategoryRow = Database['public']['Tables']['service_categories']['Row'];
type ReviewRow = Database['public']['Tables']['reviews']['Row'];

type CompletionForm = {
  rating: string;
  review: string;
  explanation: string;
  amountPaid: string;
};

const INITIAL_COMPLETION_FORM: CompletionForm = {
  rating: '',
  review: '',
  explanation: '',
  amountPaid: ''
};

function toBookingStatus(status: string) {
  if (status === 'new' || status === 'pending') return 'requested';
  if (status === 'contacted') return 'accepted';
  if (status === 'assigned') return 'in_progress';
  return status;
}

function canExposeProviderPhone(job: JobRequestRow, provider: ProviderRow | null) {
  const status = toBookingStatus(job.status);
  const isAcceptedJourney = status === 'accepted' || status === 'in_progress' || status === 'completed';
  return Boolean(isAcceptedJourney && provider?.is_verified);
}

export default function AccountPage() {
  const [accessState, setAccessState] = useState<AccessState>('loading');
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const [customerName, setCustomerName] = useState('Customer');
  const [jobs, setJobs] = useState<JobRequestRow[]>([]);
  const [providersById, setProvidersById] = useState<Record<string, ProviderRow>>({});
  const [serviceNameById, setServiceNameById] = useState<Record<string, string>>({});
  const [reviewsByProvider, setReviewsByProvider] = useState<Record<string, ReviewRow>>({});

  const [dropReasonByJob, setDropReasonByJob] = useState<Record<string, string>>({});
  const [completionFormByJob, setCompletionFormByJob] = useState<Record<string, CompletionForm>>({});

  async function loadDashboard() {
    setLoading(true);
    setErrorMessage('');

    try {
      const supabase = getSupabaseClient();
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setAccessState('unauthenticated');
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name, email')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profile?.role !== 'customer') {
        setAccessState('forbidden');
        setLoading(false);
        return;
      }

      setAccessState('allowed');
      setCustomerName(profile?.full_name || profile?.email || session.user.email || 'Customer');

      const [jobsRes, categoriesRes] = await Promise.all([
        supabase.from('job_requests').select('*').eq('customer_id', session.user.id).order('created_at', { ascending: false }),
        supabase.from('service_categories').select('*')
      ]);

      if (jobsRes.error || categoriesRes.error) {
        throw jobsRes.error ?? categoriesRes.error;
      }

      const allJobs = jobsRes.data ?? [];
      const providerIds = [...new Set(allJobs.map((job) => job.provider_id).filter(Boolean))] as string[];

      const [providersRes, reviewsRes] = await Promise.all([
        providerIds.length > 0 ? supabase.from('providers').select('*').in('id', providerIds) : Promise.resolve({ data: [], error: null }),
        providerIds.length > 0 ? supabase.from('reviews').select('*').in('provider_id', providerIds).order('created_at', { ascending: false }) : Promise.resolve({ data: [], error: null })
      ]);

      if (providersRes.error || reviewsRes.error) {
        throw providersRes.error ?? reviewsRes.error;
      }

      const providerLookup: Record<string, ProviderRow> = {};
      (providersRes.data ?? []).forEach((provider) => {
        providerLookup[provider.id] = provider;
      });

      const categoryLookup: Record<string, string> = {};
      (categoriesRes.data ?? []).forEach((category: ServiceCategoryRow) => {
        categoryLookup[category.id] = category.name;
      });

      const latestReviewByProvider: Record<string, ReviewRow> = {};
      for (const review of reviewsRes.data ?? []) {
        if (review.customer_name !== (profile?.full_name || profile?.email || session.user.email || 'Customer')) {
          continue;
        }
        if (!latestReviewByProvider[review.provider_id]) {
          latestReviewByProvider[review.provider_id] = review;
        }
      }

      setJobs(allJobs);
      setProvidersById(providerLookup);
      setServiceNameById(categoryLookup);
      setReviewsByProvider(latestReviewByProvider);

      const completionDefaults: Record<string, CompletionForm> = {};
      allJobs.forEach((job) => {
        const existingReview = job.provider_id ? latestReviewByProvider[job.provider_id] : undefined;
        completionDefaults[job.id] = {
          rating: existingReview?.rating ? String(existingReview.rating) : '',
          review: existingReview?.comment ?? '',
          explanation: '',
          amountPaid: job.payment_amount != null ? String(job.payment_amount) : ''
        };
      });
      setCompletionFormByJob(completionDefaults);
    } catch {
      setErrorMessage('Unable to load your customer account right now. Please try again shortly.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const activeRequests = useMemo(() => jobs.filter((job) => toBookingStatus(job.status) === 'requested'), [jobs]);
  const acceptedJobs = useMemo(
    () => jobs.filter((job) => {
      const status = toBookingStatus(job.status);
      return status === 'accepted' || status === 'in_progress';
    }),
    [jobs]
  );
  const completedJobs = useMemo(() => jobs.filter((job) => toBookingStatus(job.status) === 'completed'), [jobs]);

  async function updateJob(jobId: string, patch: Database['public']['Tables']['job_requests']['Update'], doneMessage: string) {
    try {
      setBusyAction(jobId);
      setErrorMessage('');
      setStatusMessage('');

      const supabase = getSupabaseClient();
      const { error } = await supabase.from('job_requests').update(patch).eq('id', jobId);
      if (error) throw error;

      setStatusMessage(doneMessage);
      await loadDashboard();
    } catch {
      setErrorMessage('Could not update this job. Please try again.');
    } finally {
      setBusyAction('');
    }
  }

  async function onCancelRequest(job: JobRequestRow) {
    await updateJob(
      job.id,
      {
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancel_reason: 'Cancelled by customer before provider acceptance.'
      },
      'Request cancelled.'
    );
  }

  async function onDropProvider(job: JobRequestRow) {
    const reason = (dropReasonByJob[job.id] ?? '').trim();
    if (!reason) {
      setErrorMessage('Please provide a reason before dropping the provider.');
      return;
    }

    await updateJob(
      job.id,
      {
        status: 'pending',
        provider_id: null,
        accepted_at: null,
        started_at: null,
        cancel_reason: `Customer dropped provider: ${reason}`,
        cancelled_at: null
      },
      'Provider dropped. Your request is now active again.'
    );
  }

  async function onMarkComplete(job: JobRequestRow) {
    await updateJob(
      job.id,
      {
        status: 'completed',
        completed_at: new Date().toISOString()
      },
      'Job marked as completed. You can now rate your provider.'
    );
  }

  async function onSaveFeedback(job: JobRequestRow) {
    const form = completionFormByJob[job.id] ?? INITIAL_COMPLETION_FORM;
    const rating = Number(form.rating);
    const amountPaid = Number(form.amountPaid);
    const isLowRating = rating > 0 && rating <= 2;

    if (!job.provider_id) {
      setErrorMessage('Cannot save feedback because no provider is attached to this job.');
      return;
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setErrorMessage('Please choose a rating between 1 and 5 stars.');
      return;
    }

    if (!Number.isFinite(amountPaid) || amountPaid < 0) {
      setErrorMessage('Please enter a valid amount paid (0 or greater).');
      return;
    }

    if (isLowRating && !form.explanation.trim()) {
      setErrorMessage('An explanation is required for ratings of 2 stars or lower.');
      return;
    }

    try {
      setBusyAction(job.id);
      setErrorMessage('');
      setStatusMessage('');

      const supabase = getSupabaseClient();

      const comment = [form.review.trim(), isLowRating ? `Low-rating explanation: ${form.explanation.trim()}` : '']
        .filter(Boolean)
        .join(' ')
        .trim();

      const reviewPayload: Database['public']['Tables']['reviews']['Insert'] = {
        provider_id: job.provider_id,
        customer_name: customerName,
        rating,
        comment: comment || null
      };

      const [reviewRes, jobRes] = await Promise.all([
        supabase.from('reviews').insert(reviewPayload),
        supabase
          .from('job_requests')
          .update({
            payment_amount: amountPaid,
            payment_status: amountPaid > 0 ? 'paid' : 'unpaid',
            paid_at: amountPaid > 0 ? new Date().toISOString() : null
          })
          .eq('id', job.id)
      ]);

      if (reviewRes.error || jobRes.error) {
        throw reviewRes.error ?? jobRes.error;
      }

      setStatusMessage('Thanks! Your rating and payment details were saved.');
      await loadDashboard();
    } catch {
      setErrorMessage('Could not save your feedback right now. Please try again.');
    } finally {
      setBusyAction('');
    }
  }

  if (loading || accessState === 'loading') {
    return (
      <div className="section-shell max-w-6xl py-10">
        <section className="card-premium p-6">Loading your customer account...</section>
      </div>
    );
  }

  if (accessState === 'unauthenticated') {
    return (
      <div className="section-shell max-w-2xl py-10">
        <section className="card-premium p-6 sm:p-8">
          <p className="eyebrow">Customer account</p>
          <h1 className="page-title mt-2">Please sign in</h1>
          <p className="mt-3 text-sm text-slate-600">Only logged-in customers can access this page.</p>
          <Link href="/login" className="focus-ring btn btn-primary mt-6">
            Go to login
          </Link>
        </section>
      </div>
    );
  }

  if (accessState === 'forbidden') {
    return (
      <div className="section-shell max-w-2xl py-10">
        <section className="card-premium p-6 sm:p-8">
          <p className="eyebrow">Customer account</p>
          <h1 className="page-title mt-2">Customer access only</h1>
          <p className="mt-3 text-sm text-slate-600">Your profile is not set as a customer account, so this page is hidden.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/account" className="focus-ring btn btn-secondary">
              Profile settings
            </Link>
            <Link href="/pro" className="focus-ring btn btn-primary">
              Provider hub
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="section-shell max-w-6xl py-10 space-y-6">
      <section className="card-premium p-6 sm:p-8">
        <p className="eyebrow">Customer account</p>
        <h1 className="page-title mt-2">My jobs and requests</h1>
        <p className="mt-2 text-sm text-slate-600">Track active requests, accepted jobs, completed work, and your provider feedback.</p>

        {errorMessage ? <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100">{errorMessage}</p> : null}
        {statusMessage ? <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700 ring-1 ring-emerald-100">{statusMessage}</p> : null}
      </section>

      <section className="card p-5 sm:p-6">
        <h2 className="text-xl font-semibold text-slate-900">1. Active requests</h2>
        <p className="mt-1 text-sm text-slate-600">Pending requests waiting for provider acceptance.</p>
        <div className="mt-4 space-y-4">
          {activeRequests.length === 0 ? (
            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600 ring-1 ring-slate-200">No active requests.</p>
          ) : (
            activeRequests.map((job) => {
              const provider = job.provider_id ? providersById[job.provider_id] : null;
              return (
                <article key={job.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                    <p><span className="font-semibold text-slate-900">Requested provider:</span> {provider?.full_name ?? 'Any available provider'}</p>
                    <p><span className="font-semibold text-slate-900">Status:</span> {toBookingStatus(job.status)}</p>
                    <p><span className="font-semibold text-slate-900">Location:</span> {job.location}</p>
                    <p><span className="font-semibold text-slate-900">Urgency:</span> {job.urgency ?? 'normal'}</p>
                    <p className="sm:col-span-2"><span className="font-semibold text-slate-900">Description:</span> {job.description ?? 'No extra description provided.'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onCancelRequest(job)}
                    disabled={busyAction === job.id}
                    className="focus-ring btn btn-secondary mt-4 disabled:opacity-60"
                  >
                    {busyAction === job.id ? 'Cancelling...' : 'Cancel request'}
                  </button>
                </article>
              );
            })
          )}
        </div>
      </section>

      <section className="card p-5 sm:p-6">
        <h2 className="text-xl font-semibold text-slate-900">2. Accepted jobs</h2>
        <p className="mt-1 text-sm text-slate-600">Manage ongoing jobs with accepted providers.</p>
        <div className="mt-4 space-y-4">
          {acceptedJobs.length === 0 ? (
            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600 ring-1 ring-slate-200">No accepted jobs right now.</p>
          ) : (
            acceptedJobs.map((job) => {
              const provider = job.provider_id ? providersById[job.provider_id] : null;
              const showProviderPhone = canExposeProviderPhone(job, provider);
              return (
                <article key={job.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                    <p><span className="font-semibold text-slate-900">Provider name:</span> {provider?.full_name ?? 'Unknown provider'}</p>
                    <p><span className="font-semibold text-slate-900">Status:</span> {toBookingStatus(job.status)}</p>
                    <p><span className="font-semibold text-slate-900">Service:</span> {serviceNameById[job.service_category_id] ?? 'Service request'}</p>
                    <p>
                      <span className="font-semibold text-slate-900">Provider phone:</span>{' '}
                      {showProviderPhone ? provider?.phone ?? 'Not available' : 'Hidden until accepted booking rules are satisfied'}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => onMarkComplete(job)}
                      disabled={busyAction === job.id}
                      className="focus-ring btn btn-primary disabled:opacity-60"
                    >
                      {busyAction === job.id ? 'Updating...' : 'Complete job'}
                    </button>
                  </div>

                  <div className="mt-4">
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Drop provider reason</label>
                    <input
                      value={dropReasonByJob[job.id] ?? ''}
                      onChange={(event) =>
                        setDropReasonByJob((current) => ({
                          ...current,
                          [job.id]: event.target.value
                        }))
                      }
                      className="focus-ring input-field"
                      placeholder="Explain why you are dropping this provider"
                    />
                    <button
                      type="button"
                      onClick={() => onDropProvider(job)}
                      disabled={busyAction === job.id}
                      className="focus-ring btn btn-secondary mt-2 disabled:opacity-60"
                    >
                      {busyAction === job.id ? 'Updating...' : 'Drop provider'}
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>

      <section className="card p-5 sm:p-6">
        <h2 className="text-xl font-semibold text-slate-900">3. Completed jobs</h2>
        <p className="mt-1 text-sm text-slate-600">Provide a rating, optional review, and payment amount for completed jobs.</p>
        <div className="mt-4 space-y-4">
          {completedJobs.length === 0 ? (
            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600 ring-1 ring-slate-200">No completed jobs yet.</p>
          ) : (
            completedJobs.map((job) => {
              const provider = job.provider_id ? providersById[job.provider_id] : null;
              const existingReview = job.provider_id ? reviewsByProvider[job.provider_id] : null;
              const form = completionFormByJob[job.id] ?? INITIAL_COMPLETION_FORM;
              const rating = Number(form.rating);
              const mustExplain = rating > 0 && rating <= 2;

              return (
                <article key={job.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                    <p><span className="font-semibold text-slate-900">Provider:</span> {provider?.full_name ?? 'Unknown provider'}</p>
                    <p><span className="font-semibold text-slate-900">Amount paid:</span> {job.payment_amount != null ? `KES ${job.payment_amount}` : 'Not recorded'}</p>
                    <p><span className="font-semibold text-slate-900">Rating given:</span> {existingReview?.rating ? `${existingReview.rating} / 5` : 'Not yet rated'}</p>
                    <p><span className="font-semibold text-slate-900">Review:</span> {existingReview?.comment ?? 'No review yet'}</p>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Rate provider</span>
                      <select
                        value={form.rating}
                        onChange={(event) =>
                          setCompletionFormByJob((current) => ({
                            ...current,
                            [job.id]: { ...form, rating: event.target.value }
                          }))
                        }
                        className="focus-ring input-field"
                      >
                        <option value="">Select rating</option>
                        {[5, 4, 3, 2, 1].map((value) => (
                          <option key={value} value={value}>
                            {value} star{value > 1 ? 's' : ''}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Amount paid (KES)</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.amountPaid}
                        onChange={(event) =>
                          setCompletionFormByJob((current) => ({
                            ...current,
                            [job.id]: { ...form, amountPaid: event.target.value }
                          }))
                        }
                        className="focus-ring input-field"
                        placeholder="Enter amount paid"
                      />
                    </label>

                    <label className="block sm:col-span-2">
                      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Optional review</span>
                      <textarea
                        value={form.review}
                        onChange={(event) =>
                          setCompletionFormByJob((current) => ({
                            ...current,
                            [job.id]: { ...form, review: event.target.value }
                          }))
                        }
                        className="focus-ring input-field min-h-20"
                        placeholder="Share your experience (optional)"
                      />
                    </label>

                    {mustExplain ? (
                      <label className="block sm:col-span-2">
                        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-red-700">Explanation required for low rating (2 stars or lower)</span>
                        <textarea
                          value={form.explanation}
                          onChange={(event) =>
                            setCompletionFormByJob((current) => ({
                              ...current,
                              [job.id]: { ...form, explanation: event.target.value }
                            }))
                          }
                          className="focus-ring input-field min-h-20"
                          placeholder="Please explain what went wrong"
                        />
                      </label>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={() => onSaveFeedback(job)}
                    disabled={busyAction === job.id}
                    className="focus-ring btn btn-primary mt-4 disabled:opacity-60"
                  >
                    {busyAction === job.id ? 'Saving...' : 'Save rating, review & payment'}
                  </button>
                </article>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

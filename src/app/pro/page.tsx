'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Database } from '@/lib/database.types';
import { getSupabaseClient } from '@/lib/supabase';

type AccessState = 'loading' | 'unauthenticated' | 'forbidden' | 'allowed';
type ProviderStatus = 'available' | 'engaged' | 'restricted';
type JobRequestRow = Database['public']['Tables']['job_requests']['Row'];
type JobCompletionRow = Database['public']['Tables']['job_completions']['Row'];
type ProviderRow = Database['public']['Tables']['providers']['Row'];
type ServiceCategoryRow = Database['public']['Tables']['service_categories']['Row'];
type ProviderAccountRow = Database['public']['Tables']['provider_accounts']['Row'];
type ProviderLedgerRow = Database['public']['Tables']['provider_ledger']['Row'];

type ProfileForm = {
  bio: string;
  profile_image_url: string;
  service_area: string;
  availability_text: string;
  price_guide: string;
  portfolio_images: string;
};

const SIGNIFICANT_DIFFERENCE_THRESHOLD = 500;

type ProviderCompletionForm = {
  amountCharged: string;
  customerRating: string;
  lowRatingReason: string;
};

const INITIAL_PROVIDER_COMPLETION_FORM: ProviderCompletionForm = {
  amountCharged: '',
  customerRating: '',
  lowRatingReason: ''
};

function toBookingStatus(status: string) {
  if (status === 'new' || status === 'pending') return 'requested';
  if (status === 'contacted') return 'accepted';
  if (status === 'assigned') return 'in_progress';
  return status;
}

function formatCurrency(value: number) {
  return `KES ${Math.max(0, value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function parseAreas(serviceArea: string | null, location: string | null) {
  const joined = [serviceArea ?? '', location ?? ''].join(',').toLowerCase();
  return joined
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function areaMatch(location: string, areas: string[]) {
  const normalizedLocation = location.toLowerCase();
  if (areas.length === 0) return true;
  return areas.some((area) => normalizedLocation.includes(area));
}

export default function ProPage() {
  const [accessState, setAccessState] = useState<AccessState>('loading');
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const [provider, setProvider] = useState<ProviderRow | null>(null);
  const [allJobs, setAllJobs] = useState<JobRequestRow[]>([]);
  const [jobCompletionsByJobId, setJobCompletionsByJobId] = useState<Record<string, JobCompletionRow>>({});
  const [categories, setCategories] = useState<ServiceCategoryRow[]>([]);
  const [serviceCategoryIds, setServiceCategoryIds] = useState<string[]>([]);

  const [declineReasonByJob, setDeclineReasonByJob] = useState<Record<string, string>>({});
  const [dropReason, setDropReason] = useState('');
  const [manualPaymentMessage, setManualPaymentMessage] = useState('');
  const [providerCompletionFormByJob, setProviderCompletionFormByJob] = useState<Record<string, ProviderCompletionForm>>({});
  const [providerAccount, setProviderAccount] = useState<ProviderAccountRow | null>(null);
  const [providerLedger, setProviderLedger] = useState<ProviderLedgerRow[]>([]);

  const [profileForm, setProfileForm] = useState<ProfileForm>({
    bio: '',
    profile_image_url: '',
    service_area: '',
    availability_text: '',
    price_guide: '',
    portfolio_images: ''
  });

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
        setProvider(null);
        setAllJobs([]);
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).maybeSingle();
      if (profile?.role !== 'provider') {
        setAccessState('forbidden');
        setLoading(false);
        return;
      }

      setAccessState('allowed');

      const [providerRes, categoriesRes] = await Promise.all([
        supabase.from('providers').select('*').eq('id', session.user.id).maybeSingle(),
        supabase.from('service_categories').select('*').order('name')
      ]);

      if (providerRes.error) {
        throw providerRes.error;
      }

      const providerRow = providerRes.data;
      setProvider(providerRow);
      setCategories(categoriesRes.data ?? []);

      if (!providerRow) {
        setErrorMessage('No provider profile found. Please complete provider onboarding first.');
        setAllJobs([]);
        setServiceCategoryIds([]);
        setLoading(false);
        return;
      }

      const [providerServicesRes, jobsRes, completionsRes, providerAccountRes, providerLedgerRes] = await Promise.all([
        supabase.from('provider_services').select('service_category_id').eq('provider_id', providerRow.id),
        supabase.from('job_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('job_completions').select('*'),
        supabase.from('provider_accounts').select('*').eq('provider_id', providerRow.id).maybeSingle(),
        supabase.from('provider_ledger').select('*').eq('provider_id', providerRow.id).order('created_at', { ascending: false })
      ]);

      if (providerServicesRes.error || jobsRes.error || completionsRes.error || providerAccountRes.error || providerLedgerRes.error) {
        throw providerServicesRes.error ?? jobsRes.error ?? completionsRes.error ?? providerAccountRes.error ?? providerLedgerRes.error;
      }

      const selectedIds = (providerServicesRes.data ?? []).map((item) => item.service_category_id);
      setServiceCategoryIds(selectedIds);
      setAllJobs(jobsRes.data ?? []);
      const completionLookup: Record<string, JobCompletionRow> = {};
      for (const completion of completionsRes.data ?? []) {
        completionLookup[completion.job_request_id] = completion;
      }
      setJobCompletionsByJobId(completionLookup);
      setProviderAccount(providerAccountRes.data ?? null);
      setProviderLedger(providerLedgerRes.data ?? []);

      setProfileForm((current) => ({
        ...current,
        bio: providerRow.bio ?? '',
        profile_image_url: providerRow.profile_image_url ?? '',
        service_area: providerRow.service_area ?? '',
        availability_text: providerRow.availability_text ?? '',
        price_guide: providerRow.price_guide ?? ''
      }));

      if (typeof window !== 'undefined') {
        const key = `ikali_provider_portfolio_${providerRow.id}`;
        const stored = window.localStorage.getItem(key);
        setProfileForm((current) => ({ ...current, portfolio_images: stored ?? current.portfolio_images }));
      }
    } catch {
      setErrorMessage('Unable to load provider dashboard right now. Please try again shortly.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const selectedRequests = useMemo(() => {
    if (!provider) return [];
    return allJobs.filter((job) => {
      const status = toBookingStatus(job.status);
      return job.provider_id === provider.id && status === 'requested';
    });
  }, [allJobs, provider]);

  const activeJob = useMemo(() => {
    if (!provider) return null;
    return (
      allJobs.find((job) => {
        const status = toBookingStatus(job.status);
        return job.provider_id === provider.id && (status === 'accepted' || status === 'in_progress');
      }) ?? null
    );
  }, [allJobs, provider]);

  const completedJobs = useMemo(() => {
    if (!provider) return [];
    return allJobs.filter((job) => job.provider_id === provider.id && toBookingStatus(job.status) === 'completed');
  }, [allJobs, provider]);

  const openJobsNearby = useMemo(() => {
    if (!provider) return [];

    const areas = parseAreas(provider.service_area, provider.location);

    return allJobs.filter((job) => {
      const status = toBookingStatus(job.status);
      if (job.provider_id) return false;
      if (status !== 'requested') return false;
      if (!serviceCategoryIds.includes(job.service_category_id)) return false;
      return areaMatch(job.location, areas);
    });
  }, [allJobs, provider, serviceCategoryIds]);

  const providerStatus: ProviderStatus = useMemo(() => {
    if (!provider || !provider.is_verified) return 'restricted';
    if (providerAccount?.status === 'restricted' && !provider.commission_override) return 'restricted';
    if (activeJob) return 'engaged';
    return 'available';
  }, [provider, activeJob, providerAccount]);

  const paymentSummary = useMemo(() => {
    const completedRevenue = completedJobs.reduce((total, job) => {
      const completion = jobCompletionsByJobId[job.id];
      return total + Number(completion?.final_amount_used ?? completion?.provider_reported_amount ?? job.payment_amount ?? 0);
    }, 0);

    const commissionsPaid = providerLedger
      .filter((entry) => entry.type === 'payment_received')
      .reduce((total, entry) => total + Number(entry.amount ?? 0), 0);
    const commissionsOwed = Math.max(Number(providerAccount?.commission_balance ?? 0) - Number(providerAccount?.credit_balance ?? 0), 0);
    const accountBalance = Number(providerAccount?.credit_balance ?? 0);

    return {
      completedRevenue,
      commissionsOwed,
      commissionsPaid,
      accountBalance
    };
  }, [completedJobs, jobCompletionsByJobId, providerAccount, providerLedger]);

  const serviceNameById = useMemo(() => new Map(categories.map((category) => [category.id, category.name])), [categories]);

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
      setErrorMessage('Could not update the job. Please try again.');
    } finally {
      setBusyAction('');
    }
  }

  async function onAcceptSelected(jobId: string) {
    await updateJob(
      jobId,
      {
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        cancelled_at: null,
        cancel_reason: null
      },
      'Job request accepted.'
    );
  }

  async function onDeclineSelected(jobId: string) {
    const reason = (declineReasonByJob[jobId] ?? '').trim();
    if (!reason) {
      setErrorMessage('Please provide a reason before declining.');
      return;
    }

    await updateJob(
      jobId,
      {
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancel_reason: reason
      },
      'Job request declined.'
    );
  }

  async function onRequestOpenJob(jobId: string) {
    if (!provider) return;

    await updateJob(
      jobId,
      {
        provider_id: provider.id,
        status: 'requested',
        accepted_at: null,
        cancelled_at: null,
        cancel_reason: null
      },
      'Request sent. This job is now in your Job Requests queue.'
    );
  }

  async function onAcceptOpenJob(jobId: string) {
    if (!provider) return;

    await updateJob(
      jobId,
      {
        provider_id: provider.id,
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        cancelled_at: null,
        cancel_reason: null
      },
      'Open job accepted.'
    );
  }

  async function onMarkStarted(jobId: string) {
    await updateJob(
      jobId,
      {
        status: 'in_progress',
        started_at: new Date().toISOString()
      },
      'Active job marked as started.'
    );
  }

  async function onMarkCompleted(job: JobRequestRow) {
    if (!provider || !job.customer_id) return;
    const form = providerCompletionFormByJob[job.id] ?? INITIAL_PROVIDER_COMPLETION_FORM;
    const amountCharged = Number(form.amountCharged);
    const rating = Number(form.customerRating);
    const lowRating = rating > 0 && rating <= 2;

    if (!Number.isFinite(amountCharged) || amountCharged < 0) {
      setErrorMessage('Please provide a valid amount charged before completing the job.');
      return;
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setErrorMessage('Please provide a customer rating between 1 and 5.');
      return;
    }
    if (lowRating && !form.lowRatingReason.trim()) {
      setErrorMessage('Please add a reason for ratings of 2 stars or lower.');
      return;
    }

    try {
      setBusyAction(job.id);
      setErrorMessage('');
      setStatusMessage('');
      const supabase = getSupabaseClient();
      const existingCompletion = jobCompletionsByJobId[job.id];
      const customerAmount = Number(existingCompletion?.customer_reported_amount ?? NaN);
      const difference = Number.isFinite(customerAmount) ? Math.abs(amountCharged - customerAmount) : null;
      const isFlagged = difference != null && difference > Math.max(SIGNIFICANT_DIFFERENCE_THRESHOLD, amountCharged * 0.2);

      const reviewComment = [lowRating ? `Low-rating reason: ${form.lowRatingReason.trim()}` : ''].filter(Boolean).join(' ').trim();

      const [jobRes, completionRes, reviewRes] = await Promise.all([
        supabase
          .from('job_requests')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            payment_amount: amountCharged
          })
          .eq('id', job.id),
        supabase.from('job_completions').upsert({
          job_request_id: job.id,
          provider_reported_amount: amountCharged,
          customer_reported_amount: Number.isFinite(customerAmount) ? customerAmount : null,
          final_amount_used: amountCharged,
          amount_difference: difference,
          is_flagged: isFlagged
        }),
        supabase.from('reviews').insert({
          job_request_id: job.id,
          reviewer_id: provider.id,
          reviewee_id: job.customer_id,
          reviewer_role: 'provider',
          rating,
          comment: reviewComment || null
        })
      ]);

      if (jobRes.error || completionRes.error || reviewRes.error) throw jobRes.error ?? completionRes.error ?? reviewRes.error;

      setStatusMessage(isFlagged ? 'Job completed and flagged for admin amount review.' : 'Active job marked as completed.');
      await loadDashboard();
    } catch {
      setErrorMessage('Could not complete this job. Please try again.');
    } finally {
      setBusyAction('');
    }
  }

  async function onDropJob(jobId: string) {
    const reason = dropReason.trim();
    if (!reason) {
      setErrorMessage('Please provide a reason before dropping this job.');
      return;
    }

    await updateJob(
      jobId,
      {
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancel_reason: reason
      },
      'Job dropped and customer notified in records.'
    );
    setDropReason('');
  }

  async function onSaveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!provider) return;

    try {
      setBusyAction('save-profile');
      setErrorMessage('');
      setStatusMessage('');

      const supabase = getSupabaseClient();
      const { error: providerError } = await supabase
        .from('providers')
        .update({
          bio: profileForm.bio.trim() || null,
          profile_image_url: profileForm.profile_image_url.trim() || null,
          service_area: profileForm.service_area.trim() || null,
          availability_text: profileForm.availability_text.trim() || null,
          price_guide: profileForm.price_guide.trim() || null
        })
        .eq('id', provider.id);

      if (providerError) throw providerError;

      await supabase.from('provider_services').delete().eq('provider_id', provider.id);
      if (serviceCategoryIds.length > 0) {
        const { error: serviceError } = await supabase.from('provider_services').insert(
          serviceCategoryIds.map((serviceId) => ({
            provider_id: provider.id,
            service_category_id: serviceId
          }))
        );

        if (serviceError) throw serviceError;
      }

      if (typeof window !== 'undefined') {
        const key = `ikali_provider_portfolio_${provider.id}`;
        window.localStorage.setItem(key, profileForm.portfolio_images.trim());
      }

      setStatusMessage('Provider profile updated successfully.');
      await loadDashboard();
    } catch {
      setErrorMessage('Unable to save provider profile right now.');
    } finally {
      setBusyAction('');
    }
  }

  function onPayNow() {
    if (paymentSummary.commissionsOwed <= 0) {
      setManualPaymentMessage('No outstanding commission to pay right now.');
      return;
    }

    setManualPaymentMessage(
      `Manual settlement started for ${formatCurrency(paymentSummary.commissionsOwed)}. An admin will confirm and reconcile this payment.`
    );
  }

  if (accessState === 'loading' || loading) {
    return (
      <div className="section-shell py-10">
        <section className="card-premium p-6">Loading provider dashboard...</section>
      </div>
    );
  }

  if (accessState === 'unauthenticated') {
    return (
      <div className="section-shell max-w-2xl py-10">
        <section className="card-premium p-6 sm:p-8">
          <h1 className="page-title">Provider Hub</h1>
          <p className="mt-3 text-slate-600">Please log in with a provider account to access /pro.</p>
          <Link href="/login?next=%2Fpro" className="focus-ring btn btn-primary mt-5 inline-flex">
            Log in
          </Link>
        </section>
      </div>
    );
  }

  if (accessState === 'forbidden') {
    return (
      <div className="section-shell max-w-2xl py-10">
        <section className="card-premium p-6 sm:p-8">
          <h1 className="page-title">Provider access required</h1>
          <p className="mt-3 text-slate-600">Only provider users can access /pro. Please switch your role from Account settings first.</p>
          <Link href="/account" className="focus-ring btn btn-secondary mt-5 inline-flex">
            Go to account
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="section-shell py-10">
      <section className="card-premium p-6 sm:p-8">
        <p className="eyebrow">Provider dashboard</p>
        <h1 className="section-heading mt-3">/pro</h1>
        <p className="mt-3 max-w-3xl text-slate-600">Manual-first provider operations: stable job management, profile updates, and commission tracking.</p>

        {errorMessage ? <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100">{errorMessage}</p> : null}
        {statusMessage ? (
          <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700 ring-1 ring-emerald-100">{statusMessage}</p>
        ) : null}

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <article className="card p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Active job</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{activeJob ? '1' : '0'}</p>
          </article>
          <article className="card p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Pending requests</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{selectedRequests.length}</p>
          </article>
          <article className="card p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Completed jobs</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{completedJobs.length}</p>
          </article>
          <article className="card p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Amount owed to I-Kali</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(paymentSummary.commissionsOwed)}</p>
          </article>
          <article className="card p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Account balance</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(paymentSummary.accountBalance)}</p>
          </article>
          <article className="card p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Provider status</p>
            <p className="mt-2 text-2xl font-semibold capitalize text-slate-900">{providerStatus}</p>
          </article>
        </div>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-slate-900">Job Requests</h2>
          <p className="mt-1 text-sm text-slate-600">Jobs where you were selected by customer/admin.</p>
          <div className="mt-4 space-y-3">
            {selectedRequests.length === 0 ? (
              <p className="card p-4 text-sm text-slate-600">No pending selected requests.</p>
            ) : (
              selectedRequests.map((job) => (
                <article key={job.id} className="card p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{serviceNameById.get(job.service_category_id) ?? 'Service job'}</p>
                      <p className="text-sm text-slate-600">{job.location}</p>
                      <p className="mt-1 text-sm text-slate-600">{job.description ?? 'No description provided.'}</p>
                    </div>
                    <div className="text-sm text-slate-600">Urgency: {job.urgency ?? 'normal'}</div>
                  </div>

                  <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto_auto]">
                    <input
                      placeholder="Decline reason"
                      className="focus-ring input-field"
                      value={declineReasonByJob[job.id] ?? ''}
                      onChange={(event) =>
                        setDeclineReasonByJob((current) => ({
                          ...current,
                          [job.id]: event.target.value
                        }))
                      }
                    />
                    <button
                      className="focus-ring btn btn-secondary"
                      disabled={busyAction === job.id}
                      onClick={() => onDeclineSelected(job.id)}
                      type="button"
                    >
                      Decline
                    </button>
                    <button className="focus-ring btn btn-primary" disabled={busyAction === job.id} onClick={() => onAcceptSelected(job.id)} type="button">
                      Accept
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-slate-900">Open Jobs Nearby</h2>
          <p className="mt-1 text-sm text-slate-600">Unassigned jobs in your services and service area coverage.</p>
          <div className="mt-4 space-y-3">
            {openJobsNearby.length === 0 ? (
              <p className="card p-4 text-sm text-slate-600">No matching open jobs nearby right now.</p>
            ) : (
              openJobsNearby.map((job) => (
                <article key={job.id} className="card p-4">
                  <p className="font-semibold text-slate-900">{serviceNameById.get(job.service_category_id) ?? 'Service job'}</p>
                  <p className="text-sm text-slate-600">{job.location}</p>
                  <p className="mt-1 text-sm text-slate-600">{job.description ?? 'No description provided.'}</p>

                  <div className="mt-3 flex flex-wrap gap-3">
                    <button
                      className="focus-ring btn btn-secondary"
                      disabled={busyAction === job.id || providerStatus !== 'available'}
                      onClick={() => onRequestOpenJob(job.id)}
                      type="button"
                    >
                      Request assignment
                    </button>
                    <button
                      className="focus-ring btn btn-primary"
                      disabled={busyAction === job.id || providerStatus !== 'available'}
                      onClick={() => onAcceptOpenJob(job.id)}
                      type="button"
                    >
                      Accept now
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-slate-900">Active Job</h2>
          {!activeJob ? (
            <p className="card mt-4 p-4 text-sm text-slate-600">No active job yet. Accept a request to start work.</p>
          ) : (
            <article className="card mt-4 p-4">
              <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                <p>
                  <strong>Customer:</strong> {activeJob.customer_name}
                </p>
                <p>
                  <strong>Urgency:</strong> {activeJob.urgency ?? 'normal'}
                </p>
                <p>
                  <strong>Location:</strong> {activeJob.location}
                </p>
                <p>
                  <strong>Status:</strong> {toBookingStatus(activeJob.status)}
                </p>
              </div>
              <p className="mt-3 text-sm text-slate-600">
                <strong>Job description:</strong> {activeJob.description ?? 'No description provided.'}
              </p>

              <div className="mt-3 flex flex-wrap gap-3">
                <button className="focus-ring btn btn-secondary" disabled={busyAction === activeJob.id} onClick={() => onMarkStarted(activeJob.id)} type="button">
                  Mark started
                </button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Amount charged (KES)</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={(providerCompletionFormByJob[activeJob.id] ?? INITIAL_PROVIDER_COMPLETION_FORM).amountCharged}
                    onChange={(event) =>
                      setProviderCompletionFormByJob((current) => ({
                        ...current,
                        [activeJob.id]: {
                          ...(current[activeJob.id] ?? INITIAL_PROVIDER_COMPLETION_FORM),
                          amountCharged: event.target.value
                        }
                      }))
                    }
                    className="focus-ring input-field"
                    placeholder="Enter amount charged"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Customer rating</span>
                  <select
                    value={(providerCompletionFormByJob[activeJob.id] ?? INITIAL_PROVIDER_COMPLETION_FORM).customerRating}
                    onChange={(event) =>
                      setProviderCompletionFormByJob((current) => ({
                        ...current,
                        [activeJob.id]: {
                          ...(current[activeJob.id] ?? INITIAL_PROVIDER_COMPLETION_FORM),
                          customerRating: event.target.value
                        }
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

                {(() => {
                  const rating = Number((providerCompletionFormByJob[activeJob.id] ?? INITIAL_PROVIDER_COMPLETION_FORM).customerRating);
                  const mustExplain = rating > 0 && rating <= 2;
                  if (!mustExplain) return null;
                  return (
                    <label className="block sm:col-span-2">
                      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-red-700">Reason for low customer rating</span>
                      <textarea
                        value={(providerCompletionFormByJob[activeJob.id] ?? INITIAL_PROVIDER_COMPLETION_FORM).lowRatingReason}
                        onChange={(event) =>
                          setProviderCompletionFormByJob((current) => ({
                            ...current,
                            [activeJob.id]: {
                              ...(current[activeJob.id] ?? INITIAL_PROVIDER_COMPLETION_FORM),
                              lowRatingReason: event.target.value
                            }
                          }))
                        }
                        className="focus-ring input-field min-h-20"
                        placeholder="Explain the low rating"
                      />
                    </label>
                  );
                })()}
              </div>
              <button className="focus-ring btn btn-primary mt-3" disabled={busyAction === activeJob.id} onClick={() => onMarkCompleted(activeJob)} type="button">
                Mark completed
              </button>

              <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
                <input
                  placeholder="Reason for dropping this job"
                  className="focus-ring input-field"
                  value={dropReason}
                  onChange={(event) => setDropReason(event.target.value)}
                />
                <button className="focus-ring btn btn-secondary" disabled={busyAction === activeJob.id} onClick={() => onDropJob(activeJob.id)} type="button">
                  Drop job
                </button>
              </div>
            </article>
          )}
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-slate-900">Completed Jobs</h2>
          <div className="mt-4 space-y-3">
            {completedJobs.length === 0 ? (
              <p className="card p-4 text-sm text-slate-600">No completed jobs yet.</p>
            ) : (
              completedJobs.map((job) => (
                <article key={job.id} className="card p-4">
                  <p className="font-semibold text-slate-900">{job.customer_name}</p>
                  <p className="text-sm text-slate-600">{job.location}</p>
                  <p className="mt-1 text-sm text-slate-600">{job.description ?? 'No description provided.'}</p>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-slate-900">Payments</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <article className="card p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Total commissions owed</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">{formatCurrency(paymentSummary.commissionsOwed)}</p>
            </article>
            <article className="card p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Payments made</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">{formatCurrency(paymentSummary.commissionsPaid)}</p>
            </article>
            <article className="card p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Current balance</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">{formatCurrency(paymentSummary.accountBalance)}</p>
            </article>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button className="focus-ring btn btn-primary" type="button" onClick={onPayNow}>
              Pay now
            </button>
            <p className="text-sm text-slate-600">Manual settlement mode. No live M-Pesa charge is triggered here.</p>
          </div>
          {manualPaymentMessage ? <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200">{manualPaymentMessage}</p> : null}
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-slate-900">Profile</h2>
          <form className="mt-4 space-y-4" onSubmit={onSaveProfile}>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Bio</span>
              <textarea
                className="focus-ring input-field min-h-24"
                value={profileForm.bio}
                onChange={(event) => setProfileForm((current) => ({ ...current, bio: event.target.value }))}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Profile image URL</span>
              <input
                className="focus-ring input-field"
                value={profileForm.profile_image_url}
                onChange={(event) => setProfileForm((current) => ({ ...current, profile_image_url: event.target.value }))}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Services offered</span>
              <div className="grid gap-2 sm:grid-cols-2">
                {categories.map((category) => {
                  const checked = serviceCategoryIds.includes(category.id);
                  return (
                    <label key={category.id} className="card flex items-center gap-2 p-3 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setServiceCategoryIds((current) =>
                            checked ? current.filter((id) => id !== category.id) : [...current, category.id]
                          )
                        }
                      />
                      <span>{category.name}</span>
                    </label>
                  );
                })}
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Service areas</span>
              <input
                className="focus-ring input-field"
                placeholder="e.g. Westlands, Kilimani, Lavington"
                value={profileForm.service_area}
                onChange={(event) => setProfileForm((current) => ({ ...current, service_area: event.target.value }))}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Availability</span>
              <input
                className="focus-ring input-field"
                value={profileForm.availability_text}
                onChange={(event) => setProfileForm((current) => ({ ...current, availability_text: event.target.value }))}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Portfolio images (comma-separated URLs)</span>
              <textarea
                className="focus-ring input-field min-h-24"
                value={profileForm.portfolio_images}
                onChange={(event) => setProfileForm((current) => ({ ...current, portfolio_images: event.target.value }))}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Price guide</span>
              <input
                className="focus-ring input-field"
                value={profileForm.price_guide}
                onChange={(event) => setProfileForm((current) => ({ ...current, price_guide: event.target.value }))}
              />
            </label>

            <button type="submit" disabled={busyAction === 'save-profile'} className="focus-ring btn btn-primary">
              {busyAction === 'save-profile' ? 'Saving profile...' : 'Save profile'}
            </button>
          </form>
        </section>
      </section>
    </div>
  );
}

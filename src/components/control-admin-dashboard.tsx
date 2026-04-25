'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Database } from '@/lib/database.types';
import { getSupabaseClient } from '@/lib/supabase';

type ProviderRow = Database['public']['Tables']['providers']['Row'];
type ProviderInsert = Database['public']['Tables']['providers']['Insert'];
type ServiceCategoryRow = Database['public']['Tables']['service_categories']['Row'];
type ServiceCategoryInsert = Database['public']['Tables']['service_categories']['Insert'];
type JobRequestRow = Database['public']['Tables']['job_requests']['Row'];
type ProviderServiceRow = Database['public']['Tables']['provider_services']['Row'];
type ProApplicationRow = Database['public']['Tables']['pro_applications']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

type AdminTab = 'providers' | 'categories' | 'applications' | 'requests';
type BookingDisplayStatus = 'requested' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
type StoredRequestStatus = BookingDisplayStatus | 'new' | 'contacted' | 'assigned' | 'pending';

type ProviderFormState = {
  id?: string;
  full_name: string;
  slug: string;
  phone: string;
  whatsapp: string;
  email: string;
  location: string;
  service_area: string;
  bio: string;
  profile_image_url: string;
  is_verified: boolean;
  is_featured: boolean;
  rating: string;
  completed_jobs: string;
  years_experience: string;
  price_guide: string;
  availability_text: string;
  selectedServiceIds: string[];
};

type CategoryFormState = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  is_active: boolean;
};

const TAB_OPTIONS: { id: AdminTab; label: string }[] = [
  { id: 'providers', label: 'Providers' },
  { id: 'categories', label: 'Service Categories' },
  { id: 'applications', label: 'Pro Applications' },
  { id: 'requests', label: 'Booking Requests' }
];

const BOOKING_STATUS_OPTIONS: { value: BookingDisplayStatus; label: string }[] = [
  { value: 'requested', label: 'Requested' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
];

const providerInitialState: ProviderFormState = {
  full_name: '',
  slug: '',
  phone: '',
  whatsapp: '',
  email: '',
  location: '',
  service_area: '',
  bio: '',
  profile_image_url: '',
  is_verified: false,
  is_featured: false,
  rating: '0',
  completed_jobs: '0',
  years_experience: '0',
  price_guide: '',
  availability_text: '',
  selectedServiceIds: []
};

const categoryInitialState: CategoryFormState = {
  name: '',
  slug: '',
  description: '',
  icon: '',
  is_active: true
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function toDisplayStatus(value: string): BookingDisplayStatus {
  if (value === 'pending' || value === 'new' || value === 'requested') return 'requested';
  if (value === 'contacted' || value === 'accepted') return 'accepted';
  if (value === 'assigned' || value === 'in_progress') return 'in_progress';
  if (value === 'cancelled') return 'cancelled';
  return 'completed';
}

function toStoredStatus(value: BookingDisplayStatus, currentStatus: string): StoredRequestStatus {
  const current = currentStatus as StoredRequestStatus;
  const prefersLegacy = current === 'new' || current === 'contacted' || current === 'assigned' || current === 'pending';
  if (!prefersLegacy) return value;

  if (value === 'requested') return 'new';
  if (value === 'accepted') return 'contacted';
  if (value === 'in_progress') return 'assigned';
  return value;
}

function getPaymentDisplay(request: JobRequestRow) {
  const status = request.payment_status?.trim() || 'Not paid';
  const amount = typeof request.payment_amount === 'number' ? `KES ${request.payment_amount.toLocaleString()}` : 'Not paid';
  const type = request.payment_type?.trim() || 'Not paid';
  const reference = request.payment_reference?.trim() || 'Not paid';

  return { status, amount, type, reference };
}

export function ControlAdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('providers');
  const [loading, setLoading] = useState(true);
  const [supabaseReady, setSupabaseReady] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [providers, setProviders] = useState<ProviderRow[]>([]);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategoryRow[]>([]);
  const [providerServices, setProviderServices] = useState<ProviderServiceRow[]>([]);
  const [jobRequests, setJobRequests] = useState<JobRequestRow[]>([]);
  const [proApplications, setProApplications] = useState<ProApplicationRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);

  const [providerForm, setProviderForm] = useState<ProviderFormState>(providerInitialState);
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(categoryInitialState);

  const [isSavingProvider, setIsSavingProvider] = useState(false);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [busyRequestId, setBusyRequestId] = useState('');
  const [busyApplicationId, setBusyApplicationId] = useState('');

  const providerNameById = useMemo(() => new Map(providers.map((provider) => [provider.id, provider.full_name])), [providers]);
  const categoryNameById = useMemo(() => new Map(serviceCategories.map((category) => [category.id, category.name])), [serviceCategories]);

  async function loadAll() {
    setLoading(true);
    setError('');

    try {
      const supabase = getSupabaseClient();
      setSupabaseReady(true);

      const [providersRes, categoriesRes, providerServicesRes, requestsRes, applicationsRes, profilesRes] = await Promise.all([
        supabase.from('providers').select('*').order('created_at', { ascending: false }),
        supabase.from('service_categories').select('*').order('name'),
        supabase.from('provider_services').select('*'),
        supabase.from('job_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('pro_applications').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*')
      ]);

      if (providersRes.error || categoriesRes.error || providerServicesRes.error || requestsRes.error || applicationsRes.error || profilesRes.error) {
        throw new Error('Failed to load one or more admin datasets.');
      }

      setProviders(providersRes.data ?? []);
      setServiceCategories(categoriesRes.data ?? []);
      setProviderServices(providerServicesRes.data ?? []);
      setJobRequests(requestsRes.data ?? []);
      setProApplications(applicationsRes.data ?? []);
      setProfiles(profilesRes.data ?? []);
    } catch {
      setSupabaseReady(false);
      setProviders([]);
      setServiceCategories([]);
      setProviderServices([]);
      setJobRequests([]);
      setProApplications([]);
      setProfiles([]);
      setError('Supabase is currently unavailable. Showing empty admin state.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const stats = useMemo(() => {
    const verifiedProviders = providers.filter((provider) => provider.is_verified).length;
    const activeServices = serviceCategories.filter((category) => category.is_active).length;
    const newRequests = jobRequests.filter((request) => {
      const status = toDisplayStatus(request.status);
      return status === 'requested';
    }).length;
    const completedRequests = jobRequests.filter((request) => request.status === 'completed').length;

    return [
      { label: 'Total providers', value: providers.length },
      { label: 'Verified providers', value: verifiedProviders },
      { label: 'Active services', value: activeServices },
      { label: 'Requested bookings', value: newRequests },
      { label: 'Completed bookings', value: completedRequests }
    ];
  }, [providers, serviceCategories, jobRequests]);

  function resetMessages() {
    setError('');
    setSuccessMessage('');
  }

  function startEditProvider(provider: ProviderRow) {
    const selectedServiceIds = providerServices
      .filter((providerService) => providerService.provider_id === provider.id)
      .map((providerService) => providerService.service_category_id);

    setProviderForm({
      id: provider.id,
      full_name: provider.full_name,
      slug: provider.slug,
      phone: provider.phone,
      whatsapp: provider.whatsapp,
      email: '',
      location: provider.location,
      service_area: provider.service_area ?? '',
      bio: provider.bio ?? '',
      profile_image_url: provider.profile_image_url ?? '',
      is_verified: provider.is_verified,
      is_featured: provider.is_featured,
      rating: String(provider.rating ?? 0),
      completed_jobs: String(provider.completed_jobs ?? 0),
      years_experience: String(provider.years_experience ?? 0),
      price_guide: provider.price_guide ?? '',
      availability_text: provider.availability_text ?? '',
      selectedServiceIds
    });
  }

  function startEditCategory(category: ServiceCategoryRow) {
    setCategoryForm({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description ?? '',
      icon: category.icon ?? '',
      is_active: category.is_active
    });
  }

  async function saveProvider(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetMessages();
    setIsSavingProvider(true);

    try {
      const supabase = getSupabaseClient();
      const payload: ProviderInsert = {
        full_name: providerForm.full_name.trim(),
        slug: providerForm.slug.trim() || slugify(providerForm.full_name),
        phone: providerForm.phone.trim(),
        whatsapp: providerForm.whatsapp.trim(),
        location: providerForm.location.trim(),
        service_area: providerForm.service_area.trim() || null,
        bio: providerForm.bio.trim() || null,
        profile_image_url: providerForm.profile_image_url.trim() || null,
        is_verified: providerForm.is_verified,
        is_featured: providerForm.is_featured,
        rating: Number(providerForm.rating) || 0,
        completed_jobs: Number(providerForm.completed_jobs) || 0,
        years_experience: Number(providerForm.years_experience) || 0,
        price_guide: providerForm.price_guide.trim() || null,
        availability_text: providerForm.availability_text.trim() || null
      };

      let providerId = providerForm.id;

      if (providerForm.id) {
        const { error: updateError } = await supabase.from('providers').update(payload).eq('id', providerForm.id);
        if (updateError) throw updateError;
      } else {
        const { data, error: insertError } = await supabase.from('providers').insert(payload).select('id').single();
        if (insertError) throw insertError;
        providerId = data.id;
      }

      if (providerId) {
        await supabase.from('provider_services').delete().eq('provider_id', providerId);
        if (providerForm.selectedServiceIds.length > 0) {
          const relationRows = providerForm.selectedServiceIds.map((serviceId) => ({
            provider_id: providerId,
            service_category_id: serviceId
          }));

          const { error: relationError } = await supabase.from('provider_services').insert(relationRows);
          if (relationError) throw relationError;
        }
      }

      setProviderForm(providerInitialState);
      setSuccessMessage(providerForm.id ? 'Provider updated successfully.' : 'Provider created successfully.');
      await loadAll();
    } catch {
      setError('Could not save provider. Please check the inputs and try again.');
    } finally {
      setIsSavingProvider(false);
    }
  }

  async function deleteProvider(providerId: string) {
    if (!window.confirm('Delete this provider? This action cannot be undone.')) return;

    resetMessages();
    try {
      const supabase = getSupabaseClient();
      const { error: deleteError } = await supabase.from('providers').delete().eq('id', providerId);
      if (deleteError) throw deleteError;

      setSuccessMessage('Provider deleted.');
      await loadAll();
    } catch {
      setError('Could not delete provider right now.');
    }
  }

  async function toggleProviderFlag(provider: ProviderRow, field: 'is_verified' | 'is_featured') {
    resetMessages();
    try {
      const supabase = getSupabaseClient();
      const updatePayload = field === 'is_verified' ? { is_verified: !provider.is_verified } : { is_featured: !provider.is_featured };
      const { error: updateError } = await supabase.from('providers').update(updatePayload).eq('id', provider.id);
      if (updateError) throw updateError;

      setSuccessMessage(field === 'is_verified' ? 'Provider verification updated.' : 'Provider featured status updated.');
      await loadAll();
    } catch {
      setError('Could not update provider status right now.');
    }
  }

  async function saveCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetMessages();
    setIsSavingCategory(true);

    try {
      const supabase = getSupabaseClient();
      const payload: ServiceCategoryInsert = {
        name: categoryForm.name.trim(),
        slug: categoryForm.slug.trim() || slugify(categoryForm.name),
        description: categoryForm.description.trim() || null,
        icon: categoryForm.icon.trim() || null,
        is_active: categoryForm.is_active
      };

      if (categoryForm.id) {
        const { error: updateError } = await supabase.from('service_categories').update(payload).eq('id', categoryForm.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from('service_categories').insert(payload);
        if (insertError) throw insertError;
      }

      setCategoryForm(categoryInitialState);
      setSuccessMessage(categoryForm.id ? 'Service category updated.' : 'Service category created.');
      await loadAll();
    } catch {
      setError('Could not save service category. Please try again.');
    } finally {
      setIsSavingCategory(false);
    }
  }

  async function deleteCategory(categoryId: string) {
    if (!window.confirm('Delete this service category? Only continue if no providers or jobs depend on it.')) return;

    resetMessages();
    try {
      const supabase = getSupabaseClient();
      const { error: deleteError } = await supabase.from('service_categories').delete().eq('id', categoryId);
      if (deleteError) throw deleteError;

      setSuccessMessage('Service category deleted.');
      await loadAll();
    } catch {
      setError('Could not delete category. It may still be in use.');
    }
  }

  async function toggleCategoryActive(category: ServiceCategoryRow) {
    resetMessages();
    try {
      const supabase = getSupabaseClient();
      const { error: updateError } = await supabase.from('service_categories').update({ is_active: !category.is_active }).eq('id', category.id);
      if (updateError) throw updateError;

      setSuccessMessage('Service category status updated.');
      await loadAll();
    } catch {
      setError('Could not update service category status.');
    }
  }

  async function updateRequestStatus(requestId: string, status: BookingDisplayStatus, currentStatus: string) {
    resetMessages();
    setBusyRequestId(requestId);
    try {
      const supabase = getSupabaseClient();
      const { error: updateError } = await supabase
        .from('job_requests')
        .update({ status: toStoredStatus(status, currentStatus) })
        .eq('id', requestId);
      if (updateError) throw updateError;

      setSuccessMessage('Job request status updated.');
      await loadAll();
    } catch {
      setError('Could not update request status.');
    } finally {
      setBusyRequestId('');
    }
  }

  async function updateApplicationStatus(application: ProApplicationRow, status: ProApplicationRow['status']) {
    resetMessages();
    setBusyApplicationId(application.id);

    try {
      const supabase = getSupabaseClient();
      const now = new Date().toISOString();

      const { error: applicationError } = await supabase
        .from('pro_applications')
        .update({ status, updated_at: now })
        .eq('id', application.id);
      if (applicationError) throw applicationError;

      const profileUpdate: Database['public']['Tables']['profiles']['Update'] = {
        pro_application_status: status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'pending',
        updated_at: now
      };
      const { error: profileError } = await supabase.from('profiles').update(profileUpdate).eq('id', application.user_id);
      if (profileError) throw profileError;

      if (status === 'approved') {
        const providerPayload: Database['public']['Tables']['providers']['Insert'] = {
          id: application.user_id,
          user_id: application.user_id,
          full_name: application.full_name,
          slug: slugify(application.full_name),
          phone: application.phone,
          whatsapp: application.phone,
          location: application.location,
          service_area: application.service_areas,
          bio: application.bio,
          profile_image_url: application.profile_photo_url,
          years_experience: application.years_experience,
          price_guide: application.price_guide,
          availability_text: application.availability,
          approval_status: 'approved',
          provider_status: 'available',
          is_public: true
        };
        const { error: providerError } = await supabase.from('providers').upsert(providerPayload);
        if (providerError) throw providerError;

        await supabase.from('profiles').update({ role: 'provider', updated_at: now }).eq('id', application.user_id);
      }

      if (status === 'rejected') {
        await supabase.from('providers').update({ approval_status: 'rejected', is_public: false }).eq('id', application.user_id);
      }

      setSuccessMessage(`Application marked as ${status}.`);
      await loadAll();
    } catch {
      setError('Could not update pro application status.');
    } finally {
      setBusyApplicationId('');
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Marketplace Control</h1>
          <p className="mt-1 text-sm text-slate-600">Operational dashboard for providers, service categories, and job requests.</p>
        </div>
        <button onClick={loadAll} className="focus-ring min-h-11 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50">
          Refresh Data
        </button>
      </div>

      <section className="card border-amber-300 bg-amber-50 p-4">
        <h2 className="text-sm font-semibold text-amber-900">Security warning</h2>
        <p className="mt-1 text-sm text-amber-800">
          Admin actions affect live provider visibility and roles. Only approved admins should access this dashboard.
        </p>
      </section>

      {!supabaseReady && <p className="card border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">Supabase not reachable. Admin sections are in empty-state mode.</p>}
      {error && <p className="card border-rose-300 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      {successMessage && <p className="card border-red-300 bg-red-50 p-3 text-sm text-red-700">{successMessage}</p>}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((item) => (
          <div key={item.label} className="card p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="card border border-slate-200 bg-slate-50 p-4">
        <h2 className="text-base font-semibold text-slate-900">Reviews (coming soon)</h2>
        <p className="mt-1 text-sm text-slate-600">
          Later admins will be able to approve, hide, or flag reviews to maintain marketplace trust and safety.
        </p>
      </section>

      <section className="card p-2 sm:p-3">
        <div className="flex flex-wrap gap-2">
          {TAB_OPTIONS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`focus-ring min-h-11 rounded-lg px-4 py-2 text-sm font-semibold ${
                activeTab === tab.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {loading ? (
        <div className="card p-8 text-center text-sm text-slate-500">Loading admin data...</div>
      ) : (
        <>
          {activeTab === 'providers' && (
            <section className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
              <form onSubmit={saveProvider} className="card space-y-3 p-4">
                <h2 className="text-lg font-semibold text-slate-900">{providerForm.id ? 'Edit provider' : 'Add provider'}</h2>
                <p className="text-xs text-slate-500">Email is included in the UI for future schema updates and is not currently persisted.</p>
                {[
                  ['Full name', 'full_name'],
                  ['Slug', 'slug'],
                  ['Phone', 'phone'],
                  ['WhatsApp', 'whatsapp'],
                  ['Email (not stored yet)', 'email'],
                  ['Location', 'location'],
                  ['Service area', 'service_area'],
                  ['Profile image URL', 'profile_image_url'],
                  ['Price guide', 'price_guide'],
                  ['Availability text', 'availability_text']
                ].map(([label, key]) => (
                  <label key={key} className="block text-sm font-medium text-slate-700">
                    {label}
                    <input
                      value={providerForm[key as keyof ProviderFormState] as string}
                      onChange={(event) => setProviderForm((current) => ({ ...current, [key]: event.target.value }))}
                      className="focus-ring mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3"
                    />
                  </label>
                ))}

                <label className="block text-sm font-medium text-slate-700">
                  Bio
                  <textarea
                    value={providerForm.bio}
                    onChange={(event) => setProviderForm((current) => ({ ...current, bio: event.target.value }))}
                    className="focus-ring mt-1 min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </label>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <label className="text-sm font-medium text-slate-700">
                    Rating
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={providerForm.rating}
                      onChange={(event) => setProviderForm((current) => ({ ...current, rating: event.target.value }))}
                      className="focus-ring mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3"
                    />
                  </label>
                  <label className="text-sm font-medium text-slate-700">
                    Completed jobs
                    <input
                      type="number"
                      min="0"
                      value={providerForm.completed_jobs}
                      onChange={(event) => setProviderForm((current) => ({ ...current, completed_jobs: event.target.value }))}
                      className="focus-ring mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3"
                    />
                  </label>
                  <label className="text-sm font-medium text-slate-700">
                    Years experience
                    <input
                      type="number"
                      min="0"
                      value={providerForm.years_experience}
                      onChange={(event) => setProviderForm((current) => ({ ...current, years_experience: event.target.value }))}
                      className="focus-ring mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3"
                    />
                  </label>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">Services offered</p>
                  {serviceCategories.length === 0 ? (
                    <p className="text-xs text-slate-500">No service categories available yet.</p>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {serviceCategories.map((category) => (
                        <label key={category.id} className="flex items-center gap-2 rounded-lg border border-slate-200 px-2 py-2 text-sm">
                          <input
                            type="checkbox"
                            checked={providerForm.selectedServiceIds.includes(category.id)}
                            onChange={(event) => {
                              setProviderForm((current) => ({
                                ...current,
                                selectedServiceIds: event.target.checked
                                  ? [...current.selectedServiceIds, category.id]
                                  : current.selectedServiceIds.filter((id) => id !== category.id)
                              }));
                            }}
                          />
                          {category.name}
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={providerForm.is_verified}
                      onChange={(event) => setProviderForm((current) => ({ ...current, is_verified: event.target.checked }))}
                    />
                    Verified
                  </label>
                  <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={providerForm.is_featured}
                      onChange={(event) => setProviderForm((current) => ({ ...current, is_featured: event.target.checked }))}
                    />
                    Featured
                  </label>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="submit"
                    disabled={isSavingProvider}
                    className="focus-ring min-h-11 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                  >
                    {isSavingProvider ? 'Saving...' : providerForm.id ? 'Update provider' : 'Add provider'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setProviderForm(providerInitialState)}
                    className="focus-ring min-h-11 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Clear
                  </button>
                </div>
              </form>

              <div className="card overflow-hidden">
                <div className="hidden overflow-x-auto md:block">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                      <tr>
                        <th className="px-3 py-3">Provider</th>
                        <th className="px-3 py-3">Location</th>
                        <th className="px-3 py-3">Flags</th>
                        <th className="px-3 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {providers.map((provider) => (
                        <tr key={provider.id} className="border-t border-slate-200">
                          <td className="px-3 py-3">
                            <p className="font-semibold text-slate-900">{provider.full_name}</p>
                            <p className="text-xs text-slate-500">{provider.slug}</p>
                          </td>
                          <td className="px-3 py-3">{provider.location}</td>
                          <td className="px-3 py-3 text-xs text-slate-600">
                            {provider.is_verified ? 'Verified' : 'Unverified'} · {provider.is_featured ? 'Featured' : 'Standard'}
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex flex-wrap gap-2">
                              <button onClick={() => startEditProvider(provider)} className="rounded-md bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-800">
                                Edit
                              </button>
                              <button
                                onClick={() => toggleProviderFlag(provider, 'is_verified')}
                                className="rounded-md bg-red-100 px-2 py-1 text-xs font-semibold text-red-800"
                              >
                                {provider.is_verified ? 'Unverify' : 'Verify'}
                              </button>
                              <button
                                onClick={() => toggleProviderFlag(provider, 'is_featured')}
                                className="rounded-md bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-800"
                              >
                                {provider.is_featured ? 'Unfeature' : 'Feature'}
                              </button>
                              <button onClick={() => deleteProvider(provider.id)} className="rounded-md bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700">
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-3 p-3 md:hidden">
                  {providers.map((provider) => (
                    <article key={provider.id} className="rounded-lg border border-slate-200 p-3">
                      <p className="font-semibold text-slate-900">{provider.full_name}</p>
                      <p className="text-xs text-slate-500">{provider.location}</p>
                      <p className="mt-2 text-xs text-slate-600">{provider.is_verified ? 'Verified' : 'Unverified'} · {provider.is_featured ? 'Featured' : 'Standard'}</p>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <button onClick={() => startEditProvider(provider)} className="min-h-10 rounded-md bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-800">
                          Edit
                        </button>
                        <button onClick={() => toggleProviderFlag(provider, 'is_verified')} className="min-h-10 rounded-md bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">
                          {provider.is_verified ? 'Unverify' : 'Verify'}
                        </button>
                        <button onClick={() => deleteProvider(provider.id)} className="col-span-2 min-h-10 rounded-md bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700">
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          )}

          {activeTab === 'categories' && (
            <section className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
              <form onSubmit={saveCategory} className="card space-y-3 p-4">
                <h2 className="text-lg font-semibold text-slate-900">{categoryForm.id ? 'Edit category' : 'Add category'}</h2>
                <label className="block text-sm font-medium text-slate-700">
                  Name
                  <input
                    required
                    value={categoryForm.name}
                    onChange={(event) => {
                      const nextName = event.target.value;
                      setCategoryForm((current) => ({ ...current, name: nextName, slug: current.id ? current.slug : slugify(nextName) }));
                    }}
                    className="focus-ring mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Slug
                  <input
                    required
                    value={categoryForm.slug}
                    onChange={(event) => setCategoryForm((current) => ({ ...current, slug: slugify(event.target.value) }))}
                    className="focus-ring mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Icon
                  <input
                    value={categoryForm.icon}
                    onChange={(event) => setCategoryForm((current) => ({ ...current, icon: event.target.value }))}
                    className="focus-ring mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3"
                    placeholder="e.g. 🧰"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Description
                  <textarea
                    value={categoryForm.description}
                    onChange={(event) => setCategoryForm((current) => ({ ...current, description: event.target.value }))}
                    className="focus-ring mt-1 min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </label>
                <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={categoryForm.is_active}
                    onChange={(event) => setCategoryForm((current) => ({ ...current, is_active: event.target.checked }))}
                  />
                  Active status
                </label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="submit"
                    disabled={isSavingCategory}
                    className="focus-ring min-h-11 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                  >
                    {isSavingCategory ? 'Saving...' : categoryForm.id ? 'Update category' : 'Add category'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryForm(categoryInitialState)}
                    className="focus-ring min-h-11 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Clear
                  </button>
                </div>
              </form>

              <div className="card overflow-hidden">
                <div className="hidden overflow-x-auto md:block">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                      <tr>
                        <th className="px-3 py-3">Category</th>
                        <th className="px-3 py-3">Slug</th>
                        <th className="px-3 py-3">Status</th>
                        <th className="px-3 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {serviceCategories.map((category) => (
                        <tr key={category.id} className="border-t border-slate-200">
                          <td className="px-3 py-3">{category.name}</td>
                          <td className="px-3 py-3 text-xs text-slate-500">{category.slug}</td>
                          <td className="px-3 py-3">{category.is_active ? 'Active' : 'Inactive'}</td>
                          <td className="px-3 py-3">
                            <div className="flex gap-2">
                              <button onClick={() => startEditCategory(category)} className="rounded-md bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-800">
                                Edit
                              </button>
                              <button
                                onClick={() => toggleCategoryActive(category)}
                                className="rounded-md bg-red-100 px-2 py-1 text-xs font-semibold text-red-800"
                              >
                                Toggle active
                              </button>
                              <button onClick={() => deleteCategory(category.id)} className="rounded-md bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700">
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-3 p-3 md:hidden">
                  {serviceCategories.map((category) => (
                    <article key={category.id} className="rounded-lg border border-slate-200 p-3">
                      <p className="font-semibold text-slate-900">{category.name}</p>
                      <p className="text-xs text-slate-500">/{category.slug}</p>
                      <p className="mt-1 text-xs text-slate-600">{category.is_active ? 'Active' : 'Inactive'}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button onClick={() => startEditCategory(category)} className="rounded-md bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-800">
                          Edit
                        </button>
                        <button onClick={() => toggleCategoryActive(category)} className="rounded-md bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">
                          Toggle
                        </button>
                        <button onClick={() => deleteCategory(category.id)} className="rounded-md bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700">
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          )}

          {activeTab === 'applications' && (
            <section className="card overflow-hidden">
              <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                    <tr>
                      <th className="px-3 py-3">Applicant</th>
                      <th className="px-3 py-3">Service</th>
                      <th className="px-3 py-3">Experience</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proApplications.map((application) => (
                      <tr key={application.id} className="border-t border-slate-200 align-top">
                        <td className="px-3 py-3">
                          <p className="font-semibold text-slate-900">{application.full_name}</p>
                          <p className="text-xs text-slate-600">{application.email}</p>
                          <p className="text-xs text-slate-600">{application.phone}</p>
                          <p className="mt-1 text-xs text-slate-500">{new Date(application.created_at).toLocaleDateString()}</p>
                        </td>
                        <td className="px-3 py-3 text-xs text-slate-600">
                          <p>Main: {categoryNameById.get(application.main_service_category_id ?? '') ?? 'Not selected'}</p>
                          <p>Areas: {application.service_areas}</p>
                          <p>Location: {application.location}</p>
                        </td>
                        <td className="px-3 py-3 text-xs text-slate-600">
                          <p>{application.years_experience} years</p>
                          <p className="mt-1 line-clamp-3">{application.bio}</p>
                        </td>
                        <td className="px-3 py-3 text-xs text-slate-700">
                          <p className="font-semibold">{application.status}</p>
                          <p>Profile: {profiles.find((profile) => profile.id === application.user_id)?.pro_application_status ?? 'unknown'}</p>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => updateApplicationStatus(application, 'approved')}
                              disabled={busyApplicationId === application.id}
                              className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateApplicationStatus(application, 'rejected')}
                              disabled={busyApplicationId === application.id}
                              className="rounded-md bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-800"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => updateApplicationStatus(application, 'needs_more_info')}
                              disabled={busyApplicationId === application.id}
                              className="rounded-md bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800"
                            >
                              Needs info
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === 'requests' && (
            <section className="card overflow-hidden">
              <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                    <tr>
                      <th className="px-3 py-3">Customer</th>
                      <th className="px-3 py-3">Booking details</th>
                      <th className="px-3 py-3">Requested for</th>
                      <th className="px-3 py-3">Location</th>
                      <th className="px-3 py-3">Urgency</th>
                      <th className="px-3 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobRequests.map((request) => (
                      <tr key={request.id} className="border-t border-slate-200 align-top">
                        <td className="px-3 py-3">
                          <p className="font-semibold text-slate-900">{request.customer_name}</p>
                          <p className="text-xs text-slate-600">{request.customer_phone}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            Created {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="px-3 py-3 text-xs text-slate-600">
                          <p className="font-medium text-slate-800">{categoryNameById.get(request.service_category_id) ?? 'Unknown service'}</p>
                          <p>{request.description?.trim() || 'No description provided'}</p>
                        </td>
                        <td className="px-3 py-3 text-xs text-slate-600">
                          <p>{request.preferred_date ?? 'No date selected'}</p>
                          <p>{request.preferred_time ?? 'No time selected'}</p>
                          <p className="mt-1">{request.provider_id ? providerNameById.get(request.provider_id) ?? 'Unknown provider' : 'No preferred provider'}</p>
                        </td>
                        <td className="px-3 py-3">{request.location}</td>
                        <td className="px-3 py-3">{request.urgency ?? 'standard'}</td>
                        <td className="px-3 py-3">
                          {(() => {
                            const payment = getPaymentDisplay(request);
                            return (
                              <div className="mb-2 text-xs text-slate-600">
                                <p>Payment status: {payment.status}</p>
                                <p>Amount: {payment.amount}</p>
                                <p>Type: {payment.type}</p>
                                <p>Reference: {payment.reference}</p>
                              </div>
                            );
                          })()}
                          <select
                            value={toDisplayStatus(request.status)}
                            onChange={(event) => updateRequestStatus(request.id, event.target.value as BookingDisplayStatus, request.status)}
                            disabled={busyRequestId === request.id}
                            className="focus-ring min-h-10 rounded-lg border border-slate-300 px-2"
                          >
                            {BOOKING_STATUS_OPTIONS.map((status) => (
                              <option key={status.value} value={status.value}>
                                {status.label}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 p-3 md:hidden">
                {jobRequests.map((request) => (
                  <article key={request.id} className="rounded-lg border border-slate-200 p-3 text-sm">
                    <p className="font-semibold text-slate-900">{request.customer_name}</p>
                    <p className="text-xs text-slate-600">{request.customer_phone}</p>
                    <p className="mt-1 text-xs text-slate-500">Created {new Date(request.created_at).toLocaleDateString()}</p>
                    <p className="mt-2 text-xs text-slate-600">Service: {categoryNameById.get(request.service_category_id) ?? 'Unknown service'}</p>
                    <p className="mt-1 text-xs text-slate-600">Provider: {request.provider_id ? providerNameById.get(request.provider_id) ?? 'Unknown provider' : 'No preferred provider'}</p>
                    <p className="mt-1 text-xs text-slate-600">Date/time: {request.preferred_date ?? 'No date'} · {request.preferred_time ?? 'No time'}</p>
                    <p className="mt-1 text-xs text-slate-600">Location: {request.location}</p>
                    <p className="mt-1 text-xs text-slate-600">Urgency: {request.urgency ?? 'standard'}</p>
                    {(() => {
                      const payment = getPaymentDisplay(request);
                      return (
                        <>
                          <p className="mt-1 text-xs text-slate-600">Payment status: {payment.status}</p>
                          <p className="mt-1 text-xs text-slate-600">Payment amount: {payment.amount}</p>
                          <p className="mt-1 text-xs text-slate-600">Payment type: {payment.type}</p>
                          <p className="mt-1 text-xs text-slate-600">Payment reference: {payment.reference}</p>
                        </>
                      );
                    })()}
                    <p className="mt-2 text-xs text-slate-500">{request.description?.trim() || 'No description provided'}</p>
                    <div className="mt-3">
                      <select
                        value={toDisplayStatus(request.status)}
                        onChange={(event) => updateRequestStatus(request.id, event.target.value as BookingDisplayStatus, request.status)}
                        disabled={busyRequestId === request.id}
                        className="focus-ring min-h-10 w-full rounded-lg border border-slate-300 px-2"
                      >
                        {BOOKING_STATUS_OPTIONS.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

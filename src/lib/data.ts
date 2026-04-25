import { providers as mockProviders, serviceCategories as mockServiceCategories } from '@/data/mock-data';
import { Provider, ServiceCategory } from '@/lib/types';
import { getSupabaseClient } from '@/lib/supabase';

const DEFAULT_PROVIDER_IMAGE =
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80';

function normalizeServiceCategory(service: {
  id?: string;
  slug: string;
  name: string;
  icon?: string | null;
  description?: string | null;
}): ServiceCategory {
  return {
    id: service.id,
    slug: service.slug,
    name: service.name,
    icon: service.icon ?? '🛠️',
    shortDescription: service.description ?? 'Trusted local professional services near you.'
  };
}

function normalizeProvider(provider: {
  id: string;
  slug: string;
  full_name: string;
  profile_image_url?: string | null;
  location: string;
  bio?: string | null;
  years_experience: number;
  is_verified: boolean;
  rating: number;
  completed_jobs: number;
  price_guide?: string | null;
  phone: string;
  whatsapp: string;
  availability_text?: string | null;
  serviceSlug: string;
  reviews: number;
  latitude?: number | null;
  longitude?: number | null;
  is_available?: boolean | null;
}): Provider {
  return {
    id: provider.id,
    slug: provider.slug,
    name: provider.full_name,
    photo: provider.profile_image_url ?? DEFAULT_PROVIDER_IMAGE,
    serviceCategory: provider.serviceSlug,
    location: provider.location,
    bio: provider.bio ?? 'Trusted local professional with verified experience.',
    skills: [],
    experienceYears: provider.years_experience,
    verified: provider.is_verified,
    rating: Number(provider.rating ?? 0),
    completedJobs: provider.completed_jobs ?? 0,
    priceGuide: provider.price_guide ?? undefined,
    phone: provider.phone,
    whatsapp: provider.whatsapp,
    availability: provider.availability_text ?? 'Contact for availability',
    reviews: provider.reviews,
    reviewCount: provider.reviews,
    latitude: provider.latitude ?? undefined,
    longitude: provider.longitude ?? undefined,
    isAvailable: provider.is_available ?? undefined,
    phoneVerified: provider.is_verified,
    experienceChecked: provider.years_experience > 0,
    workHistoryReviewed: provider.completed_jobs > 0,
    responseTime: provider.is_verified ? 'Typically within 1 hour' : 'Response time being verified'
  };
}

export async function getServiceCategories(): Promise<ServiceCategory[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('service_categories')
      .select('id, slug, name, icon, description')
      .eq('is_active', true)
      .order('name');

    if (error || !data || data.length === 0) {
      return mockServiceCategories;
    }

    return data.map(normalizeServiceCategory);
  } catch {
    return mockServiceCategories;
  }
}

export async function getProviders(): Promise<Provider[]> {
  try {
    const supabase = getSupabaseClient();

    const [{ data: providerRows, error: providersError }, { data: providerServiceRows, error: providerServicesError }, { data: categoriesRows }] = await Promise.all([
      supabase
        .from('providers')
        .select('*')
        .order('rating', { ascending: false }),
      supabase
        .from('provider_services')
        .select('provider_id, service_category_id'),
      supabase.from('service_categories').select('id, slug')
    ]);

    if (providersError || providerServicesError || !providerRows || !providerServiceRows || providerRows.length === 0) {
      return mockProviders;
    }

    const serviceSlugById = new Map((categoriesRows ?? []).map((category) => [category.id, category.slug]));
    const providerToServiceSlug = new Map<string, string>();

    for (const relation of providerServiceRows) {
      const categorySlug = serviceSlugById.get(relation.service_category_id);
      if (categorySlug && !providerToServiceSlug.has(relation.provider_id)) {
        providerToServiceSlug.set(relation.provider_id, categorySlug);
      }
    }

    const reviewsCountByProvider = new Map<string, number>();
    const { data: reviewRows } = await supabase.from('reviews').select('provider_id');
    for (const review of reviewRows ?? []) {
      reviewsCountByProvider.set(review.provider_id, (reviewsCountByProvider.get(review.provider_id) ?? 0) + 1);
    }

    const mapped = providerRows
      .map((provider) => {
        const serviceSlug = providerToServiceSlug.get(provider.id);
        if (!serviceSlug) return null;

        return normalizeProvider({
          ...provider,
          serviceSlug,
          reviews: reviewsCountByProvider.get(provider.id) ?? 0
        });
      })
      .filter((provider): provider is Provider => provider !== null);

    return mapped.length > 0 ? mapped : mockProviders;
  } catch {
    return mockProviders;
  }
}

export async function getProviderBySlug(slug: string): Promise<Provider | undefined> {
  const providers = await getProviders();
  return providers.find((provider) => provider.slug === slug);
}

export async function getProvidersByServiceSlug(slug: string): Promise<Provider[]> {
  const providers = await getProviders();
  return providers.filter((provider) => provider.serviceCategory === slug);
}

export async function getServiceBySlug(slug: string): Promise<ServiceCategory | undefined> {
  const services = await getServiceCategories();
  return services.find((service) => service.slug === slug);
}

export async function getServiceNameBySlug(slug: string): Promise<string> {
  const service = await getServiceBySlug(slug);
  return service?.name ?? 'Service Provider';
}

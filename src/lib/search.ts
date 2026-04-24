import { Provider, ServiceCategory } from '@/lib/types';

export const POPULAR_LOCATIONS = [
  'Karen',
  'Kilimani',
  'Westlands',
  'Kileleshwa',
  'Lavington',
  'Langata',
  'Rongai',
  'Runda',
  'South B',
  'Embakasi'
] as const;

export const SUGGESTED_SEARCHES = [
  'Plumber in Karen',
  'Electrician in Kilimani',
  'Cleaner in Westlands',
  'Mechanic in Langata',
  'Barber in Nairobi',
  'Fundi in Rongai'
] as const;

const SEARCH_ALIASES: Record<string, string[]> = {
  plumber: ['plumbing', 'plumbers'],
  plumbing: ['plumber', 'plumbers'],
  electrician: ['electrical', 'electricians'],
  electrical: ['electrician', 'electricians'],
  cleaner: ['cleaning', 'cleaners'],
  cleaning: ['cleaner', 'cleaners'],
  mechanic: ['mechanics'],
  mechanics: ['mechanic'],
  barber: ['barber services', 'barbers'],
  fundi: ['handyman', 'fundis'],
  fundis: ['handyman', 'fundi'],
  handyman: ['fundi', 'fundis']
};

const SERVICE_SLUG_ALIASES: Record<string, string[]> = {
  plumbers: ['plumber', 'plumbers', 'plumbing'],
  electricians: ['electrician', 'electricians', 'electrical'],
  cleaners: ['cleaner', 'cleaners', 'cleaning'],
  mechanics: ['mechanic', 'mechanics'],
  barbers: ['barber', 'barbers', 'barber services']
};

function normalize(text: string) {
  return text.trim().toLowerCase();
}

export function extractSearchIntent(query: string) {
  const normalized = query.trim().replace(/\s+/g, ' ');
  if (!normalized) return { serviceQuery: '', locationQuery: '' };

  const nearSplit = normalized.split(/\s+near\s+/i);
  if (nearSplit.length > 1) {
    return { serviceQuery: nearSplit[0] ?? '', locationQuery: nearSplit.slice(1).join(' near ').trim() };
  }

  const inSplit = normalized.split(/\s+in\s+/i);
  if (inSplit.length > 1) {
    return { serviceQuery: inSplit[0] ?? '', locationQuery: inSplit.slice(1).join(' in ').trim() };
  }

  return { serviceQuery: normalized, locationQuery: '' };
}

export function expandSearchTerms(input: string): string[] {
  const normalized = normalize(input);
  if (!normalized) return [];

  const words = normalized.split(/\s+/).filter(Boolean);
  const expanded = new Set<string>([normalized, ...words]);

  for (const word of words) {
    const aliases = SEARCH_ALIASES[word];
    if (!aliases) continue;
    for (const alias of aliases) {
      expanded.add(alias);
      expanded.add(normalize(alias));
    }
  }

  return Array.from(expanded);
}

export function resolveServiceSlug(query: string, services: ServiceCategory[]) {
  const normalized = normalize(query);
  if (!normalized) return null;

  for (const service of services) {
    const serviceName = normalize(service.name);
    if (normalized === normalize(service.slug) || normalized === serviceName) {
      return service.slug;
    }

    if (normalized.includes(serviceName) || normalized.includes(normalize(service.slug))) {
      return service.slug;
    }

    const aliases = SERVICE_SLUG_ALIASES[service.slug] ?? [];
    if (aliases.some((alias) => normalized.includes(normalize(alias)))) {
      return service.slug;
    }
  }

  return null;
}

export function matchesProviderSearch(provider: Provider, serviceName: string, query: string) {
  if (!query.trim()) return true;

  const haystack = [provider.name, serviceName, provider.serviceCategory, provider.location, provider.bio, provider.skills.join(' ')].join(' ').toLowerCase();
  const terms = expandSearchTerms(query);

  return terms.some((term) => haystack.includes(term));
}

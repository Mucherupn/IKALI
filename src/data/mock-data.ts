import { Provider, ProviderReview, ServiceCategory } from '@/lib/types';

export const serviceCategories: ServiceCategory[] = [
  { slug: 'plumbers', name: 'Plumbers', icon: '🛠️', shortDescription: 'Pipe repairs, leaks, and installations.' },
  { slug: 'electricians', name: 'Electricians', icon: '⚡', shortDescription: 'Safe wiring, fittings, and diagnostics.' },
  { slug: 'cleaners', name: 'Cleaners', icon: '🧼', shortDescription: 'Residential and office deep cleaning.' },
  { slug: 'painters', name: 'Painters', icon: '🎨', shortDescription: 'Interior and exterior premium finishes.' },
  { slug: 'mechanics', name: 'Mechanics', icon: '🚗', shortDescription: 'On-site vehicle diagnostics and repairs.' },
  { slug: 'barbers', name: 'Barbers', icon: '✂️', shortDescription: 'Modern grooming at home or studio.' },
  { slug: 'carpenters', name: 'Carpenters', icon: '🪚', shortDescription: 'Custom furniture and wood repairs.' },
  { slug: 'gardeners', name: 'Gardeners', icon: '🌿', shortDescription: 'Landscaping and lawn maintenance.' }
];

export const providers: Provider[] = [
  {
    id: '1',
    slug: 'samuel-otieno-plumber',
    name: 'Samuel Otieno',
    photo: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
    serviceCategory: 'plumbers',
    location: 'Kilimani, Nairobi',
    bio: 'Reliable plumbing specialist for homes and apartments with a focus on quick turnarounds.',
    skills: ['Leak fixing', 'Water heater setup', 'Bathroom fixtures'],
    experienceYears: 8,
    verified: true,
    phoneVerified: true,
    experienceChecked: true,
    workHistoryReviewed: true,
    rating: 4.9,
    completedJobs: 214,
    responseTime: 'Typically within 20 mins',
    priceGuide: 'From KES 2,500',
    availability: 'Available today',
    reviews: 132,
    reviewCount: 132,
    latitude: -1.2921,
    longitude: 36.7846
  },
  {
    id: '2',
    slug: 'grace-wanjiku-electrician',
    name: 'Grace Wanjiku',
    photo: 'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?auto=format&fit=crop&w=600&q=80',
    serviceCategory: 'electricians',
    location: 'Westlands, Nairobi',
    bio: 'Certified electrician handling residential and commercial jobs with strict safety standards.',
    skills: ['Fault diagnosis', 'DB board upgrades', 'Security lighting'],
    experienceYears: 6,
    verified: true,
    phoneVerified: true,
    experienceChecked: true,
    workHistoryReviewed: true,
    rating: 4.8,
    completedJobs: 176,
    responseTime: 'Typically within 35 mins',
    priceGuide: 'From KES 3,000',
    availability: 'Next slot: tomorrow',
    reviews: 97,
    reviewCount: 97,
    latitude: -1.2673,
    longitude: 36.8108
  },
  {
    id: '3',
    slug: 'lilian-njeri-cleaner',
    name: 'Lilian Njeri',
    photo: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=80',
    serviceCategory: 'cleaners',
    location: 'South B, Nairobi',
    bio: 'Detail-oriented cleaner for homes, offices, and move-in/move-out deep cleans.',
    skills: ['Deep cleaning', 'Post-construction cleanup', 'Laundry services'],
    experienceYears: 5,
    verified: true,
    phoneVerified: false,
    experienceChecked: true,
    workHistoryReviewed: true,
    rating: 4.7,
    completedJobs: 321,
    responseTime: 'Typically within 1 hour',
    priceGuide: 'From KES 2,000',
    availability: 'Available this weekend',
    reviews: 205,
    reviewCount: 205,
    latitude: -1.3127,
    longitude: 36.8432
  },
  {
    id: '4',
    slug: 'kevin-mutiso-plumber',
    name: 'Kevin Mutiso',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    serviceCategory: 'plumbers',
    location: 'Lavington, Nairobi',
    bio: 'Trusted for emergency plumbing and preventive maintenance for residential estates.',
    skills: ['Blocked drains', 'Pipe replacement', 'Pump installation'],
    experienceYears: 7,
    verified: false,
    phoneVerified: false,
    experienceChecked: true,
    workHistoryReviewed: false,
    rating: 4.5,
    completedJobs: 142,
    responseTime: 'Response time being verified',
    priceGuide: 'From KES 2,200',
    availability: 'Available tomorrow morning',
    reviews: 88,
    reviewCount: 88,
    latitude: -1.2833,
    longitude: 36.7667
  },
  {
    id: '5',
    slug: 'ann-muthoni-painter',
    name: 'Ann Muthoni',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
    serviceCategory: 'painters',
    location: 'Karen, Nairobi',
    bio: 'Interior and exterior painter delivering neat finishes for homes and offices.',
    skills: ['Interior paint', 'Exterior coatings', 'Color consultation'],
    experienceYears: 9,
    verified: true,
    phoneVerified: true,
    experienceChecked: true,
    workHistoryReviewed: true,
    rating: 4.9,
    completedJobs: 260,
    responseTime: 'Typically within 25 mins',
    priceGuide: 'From KES 5,000',
    availability: 'Available next week',
    reviews: 166,
    reviewCount: 166,
    latitude: -1.3195,
    longitude: 36.7073
  },
  {
    id: '6',
    slug: 'brian-kariuki-mechanic',
    name: 'Brian Kariuki',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    serviceCategory: 'mechanics',
    location: 'Embakasi, Nairobi',
    bio: 'Mobile mechanic for diagnostics, battery issues, and routine service calls.',
    skills: ['Engine diagnostics', 'Battery replacement', 'Oil service'],
    experienceYears: 10,
    verified: true,
    phoneVerified: true,
    experienceChecked: true,
    workHistoryReviewed: true,
    rating: 4.6,
    completedJobs: 303,
    responseTime: 'Typically within 40 mins',
    priceGuide: 'From KES 3,500',
    availability: 'Available today',
    reviews: 149,
    reviewCount: 149,
    latitude: -1.3097,
    longitude: 36.9020
  }
];

export const providerReviews: ProviderReview[] = [
  {
    id: 'r1',
    providerSlug: 'samuel-otieno-plumber',
    customerName: 'Mary A.',
    rating: 5,
    date: '2026-03-18',
    comment: 'Fast response, clear communication, and very neat work.'
  },
  {
    id: 'r2',
    providerSlug: 'samuel-otieno-plumber',
    customerName: 'James K.',
    rating: 5,
    date: '2026-02-04',
    comment: 'Showed up on time and solved the issue in one visit.'
  },
  {
    id: 'r3',
    providerSlug: 'samuel-otieno-plumber',
    customerName: 'Aisha N.',
    rating: 4,
    date: '2026-01-22',
    comment: 'Professional and respectful. Would hire again.'
  },
  {
    id: 'r4',
    providerSlug: 'grace-wanjiku-electrician',
    customerName: 'David M.',
    rating: 5,
    date: '2026-03-11',
    comment: 'Handled the rewiring safely and explained every step.'
  },
  {
    id: 'r5',
    providerSlug: 'grace-wanjiku-electrician',
    customerName: 'Wanjiru P.',
    rating: 4,
    date: '2026-02-02',
    comment: 'Good quality work. Arrived a little later than planned.'
  }
];

export const nairobiAreas = ['Westlands', 'Kilimani', 'Lavington', 'Karen', 'South B', 'Embakasi'];

export function getServiceBySlug(slug: string) {
  return serviceCategories.find((service) => service.slug === slug);
}

export function getServiceNameBySlug(slug: string) {
  return getServiceBySlug(slug)?.name ?? 'Service Provider';
}

export function getProviderCountByService(slug: string) {
  return providers.filter((provider) => provider.serviceCategory === slug).length;
}

export function getMockReviewsForProvider(providerSlug: string): ProviderReview[] {
  return providerReviews.filter((review) => review.providerSlug === providerSlug);
}

import { Provider, ServiceCategory } from '@/lib/types';

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
    rating: 4.9,
    completedJobs: 214,
    priceGuide: 'From KES 2,500',
    phone: '+254712345678',
    whatsapp: '254712345678',
    availability: 'Available today',
    reviews: 132
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
    rating: 4.8,
    completedJobs: 176,
    priceGuide: 'From KES 3,000',
    phone: '+254798765432',
    whatsapp: '254798765432',
    availability: 'Next slot: tomorrow',
    reviews: 97
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
    rating: 4.7,
    completedJobs: 321,
    priceGuide: 'From KES 2,000',
    phone: '+254701234567',
    whatsapp: '254701234567',
    availability: 'Available this weekend',
    reviews: 205
  }
];

export const nairobiAreas = ['Westlands', 'Kilimani', 'Lavington', 'Karen', 'South B', 'Embakasi'];

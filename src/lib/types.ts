export type ServiceCategory = {
  id?: string;
  slug: string;
  name: string;
  icon: string;
  shortDescription: string;
};

export type Provider = {
  id: string;
  slug: string;
  name: string;
  photo: string;
  serviceCategory: string;
  location: string;
  bio: string;
  skills: string[];
  experienceYears: number;
  verified: boolean;
  phoneVerified?: boolean;
  experienceChecked?: boolean;
  workHistoryReviewed?: boolean;
  rating: number;
  completedJobs: number;
  responseTime?: string;
  priceGuide?: string;
  phone: string;
  whatsapp: string;
  availability: string;
  reviews: number;
  reviewCount?: number;
};

export type ProviderReview = {
  id: string;
  providerSlug: string;
  customerName: string;
  rating: number;
  date: string;
  comment: string;
};

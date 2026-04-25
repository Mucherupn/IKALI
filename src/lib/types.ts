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
  typicalChargeRange?: string;
  availability: string;
  reviews: number;
  reviewCount?: number;
  latitude?: number;
  longitude?: number;
  isAvailable?: boolean;
  unpaidBalance?: number;
  paymentSpeedScore?: number;
  providerStanding?: 'good_standing' | 'owing' | 'restricted' | 'override';
  jobsAllowedBeforePayment?: number;
  adminOverride?: boolean;
};

export type ProviderReview = {
  id: string;
  providerSlug: string;
  customerName: string;
  rating: number;
  date: string;
  comment: string;
};

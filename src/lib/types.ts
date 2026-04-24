export type ServiceCategory = {
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
  rating: number;
  completedJobs: number;
  priceGuide?: string;
  phone: string;
  whatsapp: string;
  availability: string;
  reviews: number;
};

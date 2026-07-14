import type { BusinessRegisterFormValues } from './schema';
import type { ContentStatus } from '../../types/database';

export type DayHours = {
  closed: boolean;
  open: string;
  close: string;
};

export type BusinessHours = Record<
  'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday',
  DayHours
>;

export type BusinessPhotos = {
  logo?: string;
  facade?: string;
  interior?: string;
  team?: string;
  products?: string;
  services?: string;
};

export type BusinessSocial = {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  linkedin?: string;
  googleBusiness?: string;
};

/** Extended business row after migration 012 */
export interface DbBusinessRegistration {
  id: string;
  owner_id: string | null;
  name: string;
  category: string;
  description: string;
  products_services: string | null;
  unique_selling_point: string | null;
  year_founded: number | null;
  employee_count: string | null;
  owner_name: string;
  owner_title: string | null;
  phone: string;
  owner_email: string | null;
  whatsapp: string;
  website: string | null;
  preferred_contact: string | null;
  address: string | null;
  city: string;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  service_areas: string[];
  hours: BusinessHours;
  social: BusinessSocial;
  photos: BusinessPhotos;
  ideal_clients: string | null;
  top_services: string[];
  price_range: string | null;
  commercial_options: string[];
  languages: string[];
  payment_methods: string[];
  wheelchair_accessible: boolean;
  family_owned: boolean;
  woman_owned: boolean;
  veteran_owned: boolean;
  minority_owned: boolean;
  licensed: boolean;
  insured: boolean;
  emergency_service: boolean;
  seasonal_services: boolean;
  keywords: string | null;
  ai_tags: string | null;
  ideal_for: string[];
  promo_channels: string[];
  want_ad_offers: boolean;
  photo_usage_allowed: boolean;
  partnership_comments: string | null;
  registration_step: number;
  draft_token: string | null;
  emoji: string;
  color: string;
  verified: boolean;
  featured: boolean;
  rating: number;
  status: ContentStatus | 'draft';
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface LocalDraftEnvelope {
  id?: string;
  draftToken: string;
  step: number;
  values: BusinessRegisterFormValues;
  updatedAt: string;
}

export type SaveMode = 'draft' | 'pending';

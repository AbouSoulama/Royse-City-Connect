import { z } from 'zod';
import {
  BUSINESS_CATEGORIES,
  COMMERCIAL_OPTIONS,
  CONTACT_METHODS,
  EMPLOYEE_COUNTS,
  IDEAL_FOR_OPTIONS,
  PRICE_RANGES,
  PROMO_CHANNELS,
  SERVICE_AREAS,
  WEEKDAYS,
} from './constants';

const optionalUrl = z
  .string()
  .trim()
  .transform((v) => (v && !/^https?:\/\//i.test(v) ? `https://${v}` : v))
  .pipe(z.union([z.literal(''), z.string().url('Enter a valid URL')]))
  .optional()
  .or(z.literal(''));

const dayHoursSchema = z.object({
  closed: z.boolean(),
  open: z.string(),
  close: z.string(),
});

export const hoursSchema = z.object({
  monday: dayHoursSchema,
  tuesday: dayHoursSchema,
  wednesday: dayHoursSchema,
  thursday: dayHoursSchema,
  friday: dayHoursSchema,
  saturday: dayHoursSchema,
  sunday: dayHoursSchema,
});

export const photosSchema = z.object({
  logo: z.string().optional().or(z.literal('')),
  facade: z.string().optional().or(z.literal('')),
  interior: z.string().optional().or(z.literal('')),
  team: z.string().optional().or(z.literal('')),
  products: z.string().optional().or(z.literal('')),
  services: z.string().optional().or(z.literal('')),
});

export const socialSchema = z.object({
  facebook: z.string().optional().or(z.literal('')),
  instagram: z.string().optional().or(z.literal('')),
  tiktok: z.string().optional().or(z.literal('')),
  youtube: z.string().optional().or(z.literal('')),
  linkedin: z.string().optional().or(z.literal('')),
  googleBusiness: z.string().optional().or(z.literal('')),
});

/** Step-level schemas for progressive validation */
export const step1Schema = z.object({
  name: z.string().trim().min(2, 'Business name is required'),
  category: z.enum(BUSINESS_CATEGORIES, { message: 'Select a category' }),
  description: z.string().trim().min(20, 'Add at least 20 characters'),
  productsServices: z.string().trim().optional().or(z.literal('')),
  uniqueSellingPoint: z.string().trim().optional().or(z.literal('')),
  yearFounded: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (v) => !v || (/^\d{4}$/.test(v) && Number(v) >= 1800 && Number(v) <= new Date().getFullYear()),
      'Enter a valid year'
    ),
  employeeCount: z.union([z.enum(EMPLOYEE_COUNTS), z.literal('')]).optional(),
});

export const step2Schema = z.object({
  ownerName: z.string().trim().min(2, 'Owner name is required'),
  ownerTitle: z.string().trim().optional().or(z.literal('')),
  phone: z.string().trim().min(7, 'Phone is required'),
  ownerEmail: z.string().trim().email('Valid email required'),
  whatsapp: z.string().trim().optional().or(z.literal('')),
  website: optionalUrl,
  preferredContact: z.enum(CONTACT_METHODS, { message: 'Select a contact method' }),
});

export const step3Schema = z.object({
  address: z.string().trim().min(3, 'Address is required'),
  city: z.string().trim().min(2, 'City is required'),
  postalCode: z.string().trim().min(3, 'ZIP code is required'),
  latitude: z.string().optional().or(z.literal('')),
  longitude: z.string().optional().or(z.literal('')),
  serviceAreas: z.array(z.enum(SERVICE_AREAS)),
});

export const step4Schema = z.object({
  hours: hoursSchema,
});

export const step5Schema = z.object({
  social: socialSchema,
});

export const step6Schema = z.object({
  photos: photosSchema,
});

export const step7Schema = z.object({
  idealClients: z.string().trim().optional().or(z.literal('')),
  topServices: z.string().trim().optional().or(z.literal('')),
  priceRange: z.union([z.enum(PRICE_RANGES), z.literal('')]).optional(),
  commercialOptions: z.array(z.enum(COMMERCIAL_OPTIONS)),
});

export const step8Schema = z.object({
  languages: z.string().trim().optional().or(z.literal('')),
  paymentMethods: z.string().trim().optional().or(z.literal('')),
  wheelchairAccessible: z.boolean(),
  familyOwned: z.boolean(),
  womanOwned: z.boolean(),
  veteranOwned: z.boolean(),
  minorityOwned: z.boolean(),
  licensed: z.boolean(),
  insured: z.boolean(),
  emergencyService: z.boolean(),
  seasonalServices: z.boolean(),
  keywords: z.string().trim().optional().or(z.literal('')),
  aiTags: z.string().trim().optional().or(z.literal('')),
  idealFor: z.array(z.enum(IDEAL_FOR_OPTIONS)),
});

export const step9Schema = z.object({
  promoChannels: z.array(z.enum(PROMO_CHANNELS)),
  wantAdOffers: z.boolean(),
  photoUsageAllowed: z.boolean(),
  partnershipComments: z.string().trim().optional().or(z.literal('')),
});

export const businessRegisterSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema)
  .merge(step5Schema)
  .merge(step6Schema)
  .merge(step7Schema)
  .merge(step8Schema)
  .merge(step9Schema);

export type BusinessRegisterFormValues = z.infer<typeof businessRegisterSchema>;

export const STEP_SCHEMAS = [
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
  step6Schema,
  step7Schema,
  step8Schema,
  step9Schema,
] as const;

export const STEP_FIELDS: (keyof BusinessRegisterFormValues)[][] = [
  ['name', 'category', 'description', 'productsServices', 'uniqueSellingPoint', 'yearFounded', 'employeeCount'],
  ['ownerName', 'ownerTitle', 'phone', 'ownerEmail', 'whatsapp', 'website', 'preferredContact'],
  ['address', 'city', 'postalCode', 'latitude', 'longitude', 'serviceAreas'],
  ['hours'],
  ['social'],
  ['photos'],
  ['idealClients', 'topServices', 'priceRange', 'commercialOptions'],
  [
    'languages', 'paymentMethods', 'wheelchairAccessible', 'familyOwned', 'womanOwned',
    'veteranOwned', 'minorityOwned', 'licensed', 'insured', 'emergencyService',
    'seasonalServices', 'keywords', 'aiTags', 'idealFor',
  ],
  ['promoChannels', 'wantAdOffers', 'photoUsageAllowed', 'partnershipComments'],
];

function defaultDay(closed = false) {
  return { closed, open: '09:00', close: '17:00' };
}

export function createDefaultValues(): BusinessRegisterFormValues {
  return {
    name: '',
    category: 'Other',
    description: '',
    productsServices: '',
    uniqueSellingPoint: '',
    yearFounded: '',
    employeeCount: '',
    ownerName: '',
    ownerTitle: '',
    phone: '',
    ownerEmail: '',
    whatsapp: '',
    website: '',
    preferredContact: 'Phone',
    address: '',
    city: 'Royse City',
    postalCode: '',
    latitude: '',
    longitude: '',
    serviceAreas: [],
    hours: {
      monday: defaultDay(),
      tuesday: defaultDay(),
      wednesday: defaultDay(),
      thursday: defaultDay(),
      friday: defaultDay(),
      saturday: defaultDay(true),
      sunday: defaultDay(true),
    },
    social: {
      facebook: '',
      instagram: '',
      tiktok: '',
      youtube: '',
      linkedin: '',
      googleBusiness: '',
    },
    photos: {
      logo: '',
      facade: '',
      interior: '',
      team: '',
      products: '',
      services: '',
    },
    idealClients: '',
    topServices: '',
    priceRange: '',
    commercialOptions: [],
    languages: '',
    paymentMethods: '',
    wheelchairAccessible: false,
    familyOwned: false,
    womanOwned: false,
    veteranOwned: false,
    minorityOwned: false,
    licensed: false,
    insured: false,
    emergencyService: false,
    seasonalServices: false,
    keywords: '',
    aiTags: '',
    idealFor: [],
    promoChannels: [],
    wantAdOffers: false,
    photoUsageAllowed: false,
    partnershipComments: '',
  };
}

export type DayKey = (typeof WEEKDAYS)[number];

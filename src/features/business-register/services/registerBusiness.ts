import { getSupabase, isSupabaseConfigured } from '../../../lib/supabase';
import { CATEGORY_META, DRAFT_STORAGE_KEY } from '../constants';
import type { BusinessRegisterFormValues } from '../schema';
import type { DbBusinessRegistration, LocalDraftEnvelope, SaveMode } from '../types';

function splitList(value?: string): string[] {
  if (!value?.trim()) return [];
  return value
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function buildPayload(
  values: BusinessRegisterFormValues,
  opts: {
    mode: SaveMode;
    step: number;
    draftToken: string;
    id?: string;
    ownerId?: string | null;
  }
) {
  const meta = CATEGORY_META[values.category] ?? CATEGORY_META.Other;
  return {
    id: opts.id ?? null,
    draft_token: opts.draftToken,
    owner_id: opts.ownerId ?? null,
    status: opts.mode,
    registration_step: opts.step,
    name: values.name || 'Untitled business',
    category: values.category || 'Other',
    description: values.description || '',
    products_services: values.productsServices || null,
    unique_selling_point: values.uniqueSellingPoint || null,
    year_founded: values.yearFounded || null,
    employee_count: values.employeeCount || null,
    owner_name: values.ownerName || 'Owner',
    owner_title: values.ownerTitle || null,
    phone: values.phone || '',
    owner_email: values.ownerEmail || null,
    whatsapp: values.whatsapp || values.phone || '',
    website: values.website || null,
    preferred_contact: values.preferredContact || null,
    address: values.address || null,
    city: values.city || 'Royse City',
    postal_code: values.postalCode || null,
    latitude: values.latitude || null,
    longitude: values.longitude || null,
    service_areas: values.serviceAreas ?? [],
    hours: values.hours,
    social: values.social,
    photos: values.photos,
    ideal_clients: values.idealClients || null,
    top_services: splitList(values.topServices).slice(0, 5),
    price_range: values.priceRange || null,
    commercial_options: values.commercialOptions ?? [],
    languages: splitList(values.languages),
    payment_methods: splitList(values.paymentMethods),
    wheelchair_accessible: values.wheelchairAccessible,
    family_owned: values.familyOwned,
    woman_owned: values.womanOwned,
    veteran_owned: values.veteranOwned,
    minority_owned: values.minorityOwned,
    licensed: values.licensed,
    insured: values.insured,
    emergency_service: values.emergencyService,
    seasonal_services: values.seasonalServices,
    keywords: values.keywords || null,
    ai_tags: values.aiTags || null,
    ideal_for: values.idealFor ?? [],
    promo_channels: values.promoChannels ?? [],
    want_ad_offers: values.wantAdOffers,
    photo_usage_allowed: values.photoUsageAllowed,
    partnership_comments: values.partnershipComments || null,
    emoji: meta.emoji,
    color: meta.color,
  };
}

export function readLocalDraft(): LocalDraftEnvelope | null {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LocalDraftEnvelope;
  } catch {
    return null;
  }
}

export function writeLocalDraft(envelope: LocalDraftEnvelope) {
  localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(envelope));
}

export function clearLocalDraft() {
  localStorage.removeItem(DRAFT_STORAGE_KEY);
}

export function newDraftToken(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `draft_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export async function uploadBusinessPhoto(
  file: File,
  draftToken: string,
  slot: string
): Promise<{ url?: string; error?: string }> {
  if (!isSupabaseConfigured) {
    return { error: 'Supabase not configured' };
  }

  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowed.includes(file.type)) {
    return { error: 'Only JPEG, PNG, WebP or GIF images are allowed.' };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { error: 'Image must be under 5 MB.' };
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `registrations/${draftToken}/${slot}-${Date.now()}.${ext}`;
  const supabase = getSupabase();

  const { error } = await supabase.storage
    .from('business-media')
    .upload(path, file, { cacheControl: '3600', upsert: true });

  if (error) {
    // Fallback to shared media bucket (legacy)
    const { data: { user } } = await supabase.auth.getUser();
    const fallbackPath = user
      ? `${user.id}/businesses/${slot}-${Date.now()}.${ext}`
      : `registrations/${draftToken}/${slot}-${Date.now()}.${ext}`;
    const retry = await supabase.storage.from('media').upload(fallbackPath, file, {
      cacheControl: '3600',
      upsert: true,
    });
    if (retry.error) return { error: error.message };
    const { data } = supabase.storage.from('media').getPublicUrl(fallbackPath);
    return { url: data.publicUrl };
  }

  const { data } = supabase.storage.from('business-media').getPublicUrl(path);
  return { url: data.publicUrl };
}

export async function saveBusinessRegistration(opts: {
  values: BusinessRegisterFormValues;
  mode: SaveMode;
  step: number;
  draftToken: string;
  id?: string;
  ownerId?: string | null;
}): Promise<{ row?: DbBusinessRegistration; error?: string }> {
  // Always persist locally for resume
  writeLocalDraft({
    id: opts.id,
    draftToken: opts.draftToken,
    step: opts.step,
    values: opts.values,
    updatedAt: new Date().toISOString(),
  });

  if (!isSupabaseConfigured) {
    return {
      row: {
        id: opts.id ?? `local_${opts.draftToken}`,
        draft_token: opts.draftToken,
        status: opts.mode,
      } as DbBusinessRegistration,
    };
  }

  const payload = buildPayload(opts.values, opts);
  const { data, error } = await getSupabase().rpc('upsert_business_registration', {
    payload,
  });

  if (error) {
    // Fallback direct insert/update if RPC not migrated yet
    const fallback = await saveViaTable(payload, opts);
    return fallback;
  }

  const row = data as DbBusinessRegistration;
  writeLocalDraft({
    id: row.id,
    draftToken: row.draft_token || opts.draftToken,
    step: opts.step,
    values: opts.values,
    updatedAt: new Date().toISOString(),
  });

  return { row };
}

async function saveViaTable(
  payload: Record<string, unknown>,
  opts: { mode: SaveMode; draftToken: string; id?: string }
): Promise<{ row?: DbBusinessRegistration; error?: string }> {
  const supabase = getSupabase();
  const rowData = {
    ...payload,
    status: opts.mode,
    draft_token: opts.draftToken,
    id: undefined,
  };
  delete (rowData as { id?: unknown }).id;

  if (opts.id) {
    const { data, error } = await supabase
      .from('businesses')
      .update(rowData)
      .eq('id', opts.id)
      .select()
      .single();
    if (error) return { error: error.message };
    return { row: data as DbBusinessRegistration };
  }

  const { data, error } = await supabase
    .from('businesses')
    .insert(rowData)
    .select()
    .single();
  if (error) return { error: error.message };
  return { row: data as DbBusinessRegistration };
}

export async function loadDraftFromServer(token: string): Promise<DbBusinessRegistration | null> {
  if (!isSupabaseConfigured || !token) return null;
  const { data, error } = await getSupabase().rpc('get_business_draft', { p_token: token });
  if (error || !data) return null;
  const row = Array.isArray(data) ? data[0] : data;
  return (row as DbBusinessRegistration) ?? null;
}

export function rowToFormValues(row: DbBusinessRegistration): Partial<BusinessRegisterFormValues> {
  return {
    name: row.name,
    category: row.category as BusinessRegisterFormValues['category'],
    description: row.description,
    productsServices: row.products_services ?? '',
    uniqueSellingPoint: row.unique_selling_point ?? '',
    yearFounded: row.year_founded ? String(row.year_founded) : '',
    employeeCount: (row.employee_count as BusinessRegisterFormValues['employeeCount']) ?? '',
    ownerName: row.owner_name,
    ownerTitle: row.owner_title ?? '',
    phone: row.phone,
    ownerEmail: row.owner_email ?? '',
    whatsapp: row.whatsapp ?? '',
    website: row.website ?? '',
    preferredContact: (row.preferred_contact as BusinessRegisterFormValues['preferredContact']) || 'Phone',
    address: row.address ?? '',
    city: row.city,
    postalCode: row.postal_code ?? '',
    latitude: row.latitude != null ? String(row.latitude) : '',
    longitude: row.longitude != null ? String(row.longitude) : '',
    serviceAreas: (row.service_areas ?? []) as BusinessRegisterFormValues['serviceAreas'],
    hours: row.hours as BusinessRegisterFormValues['hours'],
    social: {
      facebook: row.social?.facebook ?? '',
      instagram: row.social?.instagram ?? '',
      tiktok: row.social?.tiktok ?? '',
      youtube: row.social?.youtube ?? '',
      linkedin: row.social?.linkedin ?? '',
      googleBusiness: row.social?.googleBusiness ?? '',
    },
    photos: {
      logo: row.photos?.logo ?? '',
      facade: row.photos?.facade ?? '',
      interior: row.photos?.interior ?? '',
      team: row.photos?.team ?? '',
      products: row.photos?.products ?? '',
      services: row.photos?.services ?? '',
    },
    idealClients: row.ideal_clients ?? '',
    topServices: (row.top_services ?? []).join(', '),
    priceRange: (row.price_range as BusinessRegisterFormValues['priceRange']) ?? '',
    commercialOptions: (row.commercial_options ?? []) as BusinessRegisterFormValues['commercialOptions'],
    languages: (row.languages ?? []).join(', '),
    paymentMethods: (row.payment_methods ?? []).join(', '),
    wheelchairAccessible: row.wheelchair_accessible,
    familyOwned: row.family_owned,
    womanOwned: row.woman_owned,
    veteranOwned: row.veteran_owned,
    minorityOwned: row.minority_owned,
    licensed: row.licensed,
    insured: row.insured,
    emergencyService: row.emergency_service,
    seasonalServices: row.seasonal_services,
    keywords: row.keywords ?? '',
    aiTags: row.ai_tags ?? '',
    idealFor: (row.ideal_for ?? []) as BusinessRegisterFormValues['idealFor'],
    promoChannels: (row.promo_channels ?? []) as BusinessRegisterFormValues['promoChannels'],
    wantAdOffers: row.want_ad_offers,
    photoUsageAllowed: row.photo_usage_allowed,
    partnershipComments: row.partnership_comments ?? '',
  };
}

const KEY = 'rcc_profile_settings';

export interface ProfileSettings {
  pushNotifications: boolean;
  showPhone: boolean;
  showEmail: boolean;
}

const defaults: ProfileSettings = {
  pushNotifications: true,
  showPhone: true,
  showEmail: false,
};

export function getProfileSettings(): ProfileSettings {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
  } catch {
    return defaults;
  }
}

export function saveProfileSettings(settings: ProfileSettings) {
  localStorage.setItem(KEY, JSON.stringify(settings));
}

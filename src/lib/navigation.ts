import type { Page } from '../components/Layout';

export type Stage = 'welcome' | 'onboarding' | 'auth' | 'app';

export type Overlay = 'none' | 'profile' | 'admin' | 'notif' | 'feedback';

export type DetailView =
  | { type: 'post'; id: string }
  | { type: 'event'; id: string }
  | { type: 'business'; id: string }
  | { type: 'job'; id: string }
  | null;

export interface AppHistoryState {
  stage: Stage;
  page: Page;
  overlay: Overlay;
  detail: DetailView;
  authMode?: 'signin' | 'signup';
}

export const DEFAULT_HISTORY: AppHistoryState = {
  stage: 'welcome',
  page: 'home',
  overlay: 'none',
  detail: null,
  authMode: 'signin',
};

function hashFor(state: AppHistoryState): string {
  if (state.stage !== 'app') return `#${state.stage}`;
  if (state.overlay === 'profile') return '#profile';
  if (state.overlay === 'admin') return '#admin';
  if (state.detail) return `#${state.detail.type}/${state.detail.id}`;
  return `#${state.page}`;
}

export function pushAppState(state: AppHistoryState, replace = false) {
  const url = `${window.location.pathname}${hashFor(state)}`;
  if (replace) {
    window.history.replaceState(state, '', url);
  } else {
    window.history.pushState(state, '', url);
  }
}

export function parseAppHash(): Partial<AppHistoryState> {
  const params = new URLSearchParams(window.location.search);
  if (params.has('code') || params.has('access_token')) {
    return { stage: 'app', page: 'home' };
  }

  const hash = window.location.hash.replace(/^#/, '') || 'welcome';
  const recovery = window.location.pathname === '/recovery';

  if (recovery) return { stage: 'auth', authMode: 'signin' };

  if (hash === 'welcome' || hash === '') return { stage: 'welcome' };
  if (hash === 'onboarding') return { stage: 'onboarding' };
  if (hash === 'auth' || hash === 'auth/signup') {
    return { stage: 'auth', authMode: hash.endsWith('signup') ? 'signup' : 'signin' };
  }
  if (hash === 'profile') return { stage: 'app', overlay: 'profile' };
  if (hash === 'admin') return { stage: 'app', overlay: 'admin' };

  const detailMatch = hash.match(/^(post|event|business|job)\/(.+)$/);
  if (detailMatch) {
    const type = detailMatch[1] as 'post' | 'event' | 'business' | 'job';
    return {
      stage: 'app' as const,
      page: pageForDetailType(type),
      detail: { type, id: detailMatch[2] },
    };
  }

  const pages: Page[] = ['home', 'news', 'businesses', 'events', 'opportunities'];
  if (pages.includes(hash as Page)) {
    return { stage: 'app', page: hash as Page };
  }

  return {};
}

export function pageForDetailType(type: NonNullable<DetailView>['type']): Page {
  if (type === 'post') return 'news';
  if (type === 'job') return 'opportunities';
  if (type === 'event') return 'events';
  return 'businesses';
}

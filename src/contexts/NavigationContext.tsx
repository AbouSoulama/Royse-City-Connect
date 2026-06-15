import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Page } from '../components/Layout';
import {
  AppHistoryState,
  DEFAULT_HISTORY,
  DetailView,
  Overlay,
  Stage,
  pageForDetailType,
  parseAppHash,
  pushAppState,
} from '../lib/navigation';

interface NavigationContextValue {
  stage: Stage;
  page: Page;
  overlay: Overlay;
  detail: DetailView;
  authMode: 'signin' | 'signup';
  setStage: (stage: Stage, replace?: boolean) => void;
  setPage: (page: Page) => void;
  setOverlay: (overlay: Overlay) => void;
  setAuthMode: (mode: 'signin' | 'signup') => void;
  openDetail: (detail: NonNullable<DetailView>) => void;
  closeDetail: () => void;
  applyState: (patch: Partial<AppHistoryState>, replace?: boolean) => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

function mergeState(prev: AppHistoryState, patch: Partial<AppHistoryState>): AppHistoryState {
  return { ...prev, ...patch };
}

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppHistoryState>(() => {
    const fromHash = parseAppHash();
    return mergeState(DEFAULT_HISTORY, fromHash);
  });
  const stateRef = useRef(state);
  stateRef.current = state;
  const skipPush = useRef(false);

  const applyState = useCallback((patch: Partial<AppHistoryState>, replace = false) => {
    setState((prev) => {
      const next = mergeState(prev, patch);
      if (!skipPush.current) {
        pushAppState(next, replace);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    pushAppState(state, true);

    const onPop = (event: PopStateEvent) => {
      const next = (event.state as AppHistoryState | null) ?? mergeState(DEFAULT_HISTORY, parseAppHash());
      skipPush.current = true;
      setState(next);
      skipPush.current = false;
    };

    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const setStage = useCallback((stage: Stage, replace = false) => {
    applyState({ stage, overlay: 'none', detail: null }, replace);
  }, [applyState]);

  const setPage = useCallback((page: Page) => {
    applyState({ stage: 'app', page, overlay: 'none', detail: null });
  }, [applyState]);

  const setOverlay = useCallback((overlay: Overlay) => {
    applyState({ stage: 'app', overlay, detail: null });
  }, [applyState]);

  const setAuthMode = useCallback((authMode: 'signin' | 'signup') => {
    applyState({ authMode, stage: 'auth' });
  }, [applyState]);

  const openDetail = useCallback((detail: NonNullable<DetailView>) => {
    applyState({ stage: 'app', page: pageForDetailType(detail.type), overlay: 'none', detail });
  }, [applyState]);

  const closeDetail = useCallback(() => {
    applyState({ detail: null });
  }, [applyState]);

  const value: NavigationContextValue = {
    stage: state.stage,
    page: state.page,
    overlay: state.overlay,
    detail: state.detail,
    authMode: state.authMode ?? 'signin',
    setStage,
    setPage,
    setOverlay,
    setAuthMode,
    openDetail,
    closeDetail,
    applyState,
  };

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error('useNavigation must be used within NavigationProvider');
  return ctx;
}

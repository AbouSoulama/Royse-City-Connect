import { useCallback, useEffect, useState } from 'react';
import { translations, type TKey } from '../i18n';
import { XIcon } from './Icons';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'rc_install_dismissed';
const DISMISS_DAYS = 7;

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isMobileBrowser(): boolean {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isIOS(): boolean {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function wasRecentlyDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const ts = parseInt(raw, 10);
    return Date.now() - ts < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export function InstallPrompt() {
  const lang = (() => {
    try {
      const stored = localStorage.getItem('rc_lang');
      return stored === 'fr' ? 'fr' : 'en';
    } catch {
      return 'en' as const;
    }
  })();
  const t = (k: TKey) => translations[lang][k];
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android'>('android');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isStandalone() || !isMobileBrowser() || wasRecentlyDismissed()) return;

    if (isIOS()) {
      setPlatform('ios');
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }

    setPlatform('android');

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);

    const fallback = setTimeout(() => {
      setVisible((v) => v || true);
    }, 2000);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      clearTimeout(fallback);
    };
  }, []);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(DISMISS_KEY, Date.now().toString());
    } catch {
      // ignore
    }
    setVisible(false);
  }, []);

  const install = useCallback(async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') dismiss();
      setDeferredPrompt(null);
      return;
    }
    dismiss();
  }, [deferredPrompt, dismiss]);

  if (!visible) return null;

  return (
    <div className="install-banner animate-slide-up" role="dialog" aria-labelledby="install-title">
      <div className="install-banner-inner">
        <div className="install-banner-icon">
          <img src="/icons/icon-192.png" alt="" width={48} height={48} className="rounded-xl img-crisp" />
        </div>
        <div className="install-banner-content">
          <p id="install-title" className="install-banner-title">{t('installTitle')}</p>
          <p className="install-banner-desc">
            {platform === 'ios' ? t('installDescIOS') : t('installDescAndroid')}
          </p>
        </div>
        <button type="button" onClick={dismiss} className="install-banner-close" aria-label={t('installLater')}>
          <XIcon size={18} />
        </button>
      </div>
      <div className="install-banner-actions">
        {platform === 'android' && deferredPrompt ? (
          <button type="button" onClick={install} className="install-btn-primary">
            {t('installNow')}
          </button>
        ) : platform === 'ios' ? (
          <div className="install-ios-steps">
            <span className="install-ios-step">
              <span className="install-ios-num">1</span>
              {t('installStep1IOS')}
            </span>
            <span className="install-ios-step">
              <span className="install-ios-num">2</span>
              {t('installStep2IOS')}
            </span>
          </div>
        ) : (
          <button type="button" onClick={install} className="install-btn-primary">
            {t('installNow')}
          </button>
        )}
        <button type="button" onClick={dismiss} className="install-btn-secondary">
          {t('installLater')}
        </button>
      </div>
    </div>
  );
}

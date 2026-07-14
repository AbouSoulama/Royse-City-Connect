import { AuthProvider } from '../../contexts/AuthContext';
import { Lang, LangContext, translations, TKey } from '../../i18n';
import { useMemo, useState } from 'react';
import { BusinessRegisterWizard } from './components/BusinessRegisterWizard';

const LANG_KEY = 'rc_lang';

function readLang(): Lang {
  try {
    const stored = localStorage.getItem(LANG_KEY);
    if (stored === 'en' || stored === 'fr') return stored;
  } catch {
    // ignore
  }
  return 'en';
}

export function BusinessRegisterPage() {
  const [lang, setLangState] = useState<Lang>(readLang);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem(LANG_KEY, l);
    document.documentElement.lang = l;
  };

  const ctx = useMemo(
    () => ({ lang, setLang, t: (k: TKey) => translations[lang][k] }),
    [lang]
  );

  const goHome = () => {
    window.location.href = '/#home';
  };

  return (
    <AuthProvider>
      <LangContext.Provider value={ctx}>
        <BusinessRegisterWizard onHome={goHome} />
      </LangContext.Provider>
    </AuthProvider>
  );
}

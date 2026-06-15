import { useEffect, useState, type ReactNode } from 'react';
import { useT } from '../i18n';
import { LogoFull } from '../components/Logo';
import { GlobeIcon, NewsIcon, StoreIcon, ShieldIcon, BriefIcon } from '../components/Icons';

const welcomeBg = 'linear-gradient(180deg, #0f1f38 0%, #15294A 50%, #1a2f4f 100%)';

export function Welcome({
  onGetStarted,
  onSignIn,
}: {
  onGetStarted: () => void;
  onSignIn: () => void;
}) {
  const { t, lang, setLang } = useT();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const features: { icon: ReactNode; text: string }[] = [
    { icon: <NewsIcon size={20} />, text: t('welcomeFeature1') },
    { icon: <StoreIcon size={20} />, text: t('welcomeFeature2') },
    { icon: <BriefIcon size={20} />, text: t('welcomeFeature3') },
    { icon: <ShieldIcon size={20} />, text: t('welcomeFeature4') },
  ];

  return (
    <div className="flex-1 min-h-0 flex flex-col text-white overflow-y-auto phone-scroll" style={{ background: welcomeBg }}>
      <div className="flex justify-end p-4 pt-3 shrink-0">
        <button
          type="button"
          onClick={() => setLang(lang === 'en' ? 'fr' : 'en')}
          className="flex items-center gap-1.5 text-xs font-bold bg-white/10 px-3 py-1.5 rounded-full border border-white/15 text-white"
        >
          <span>{lang === 'en' ? '🇺🇸' : '🇫🇷'}</span> {lang.toUpperCase()}
        </button>
      </div>

      <div className={`flex-1 flex flex-col items-center justify-center px-5 py-4 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="bg-white rounded-3xl p-4 shadow-2xl mb-4">
          <LogoFull height={80} />
        </div>
        <h1 className="text-xl font-extrabold tracking-tight text-center text-white">{t('appName')}</h1>
        <p className="text-white/75 text-sm mt-1 text-center max-w-xs">{t('welcomeSubtitle')}</p>

        <div className="w-full max-w-sm mt-6 space-y-2">
          {features.map((f, i) => (
            <div
              key={f.text}
              className="flex items-center gap-3 bg-white/10 border border-white/15 rounded-xl px-3 py-2.5"
              style={{ animationDelay: `${0.1 + i * 0.08}s` }}
            >
              <span className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0 text-crimson-light">
                {f.icon}
              </span>
              <span className="text-sm font-medium text-white leading-snug">{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={`px-5 pb-4 pt-2 space-y-2.5 shrink-0 transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
        <button
          type="button"
          onClick={onGetStarted}
          className="w-full bg-gradient-to-r from-crimson to-crimson-dark text-white font-bold py-3.5 rounded-2xl shadow-lg active:scale-[0.98] transition"
        >
          ✨ {t('getStarted')}
        </button>
        <button
          type="button"
          onClick={onSignIn}
          className="w-full bg-white/10 border border-white/25 text-white font-bold py-3.5 rounded-2xl active:scale-[0.98] transition"
        >
          {t('signIn')}
        </button>
        <p className="text-center text-[10px] text-white/50 pt-1">🔒 {t('dataProtected')}</p>
      </div>
    </div>
  );
}

export function Onboarding({ onDone }: { onDone: () => void }) {
  const { t, lang, setLang } = useT();
  const [step, setStep] = useState(0);

  const slides = [
    { icon: <NewsIcon size={44} className="text-white" />, title: t('onboard1Title'), desc: t('onboard1Desc'), color: 'from-navy to-navy-light' },
    { icon: <StoreIcon size={44} className="text-white" />, title: t('onboard2Title'), desc: t('onboard2Desc'), color: 'from-crimson to-crimson-dark' },
    { icon: <BriefIcon size={44} className="text-white" />, title: t('onboard3Title'), desc: t('onboard3Desc'), color: 'from-navy via-navy-light to-crimson-dark' },
  ];

  const s = slides[step];

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-white overflow-y-auto phone-scroll">
      <div className="flex items-center justify-between p-4 pt-3 shrink-0">
        <button
          type="button"
          onClick={() => setLang(lang === 'en' ? 'fr' : 'en')}
          className="flex items-center gap-1 text-xs font-bold text-navy bg-slate-100 px-3 py-1.5 rounded-full"
        >
          <GlobeIcon size={14} /> {lang.toUpperCase()}
        </button>
        <button type="button" onClick={onDone} className="text-slate-500 text-sm font-medium">{t('skip')}</button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className={`w-36 h-36 rounded-[1.75rem] bg-gradient-to-br ${s.color} flex items-center justify-center shadow-xl mb-6`}>
          {s.icon}
        </div>
        <h2 className="text-xl font-extrabold text-navy mb-2">{s.title}</h2>
        <p className="text-slate-600 text-sm leading-relaxed max-w-xs">{s.desc}</p>
      </div>

      <div className="flex justify-center gap-2 mb-4 shrink-0">
        {slides.map((_, i) => (
          <span
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-7 bg-crimson' : 'w-2 bg-slate-300'}`}
          />
        ))}
      </div>

      <div className="p-5 pt-0 pb-4 shrink-0">
        <button
          type="button"
          onClick={() => (step < slides.length - 1 ? setStep(step + 1) : onDone())}
          className="w-full bg-navy text-white font-bold py-3.5 rounded-2xl shadow-lg active:scale-[0.98] transition"
        >
          {step < slides.length - 1 ? t('next') : t('getStarted')}
        </button>
      </div>
    </div>
  );
}

/** @deprecated use Welcome instead */
export function Splash({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1400);
    return () => clearTimeout(t);
  }, [onDone]);
  return <Welcome onGetStarted={onDone} onSignIn={onDone} />;
}

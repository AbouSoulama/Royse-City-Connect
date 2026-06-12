import { useEffect, useState } from 'react';
import { useT } from '../i18n';
import { LogoFull } from '../components/Logo';
import { GlobeIcon } from '../components/Icons';

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

  const features = [
    { emoji: '📢', text: t('welcomeFeature1') },
    { emoji: '🏪', text: t('welcomeFeature2') },
    { emoji: '📅', text: t('welcomeFeature3') },
    { emoji: '🛡️', text: t('welcomeFeature4') },
  ];

  return (
    <div className="min-h-full bg-gradient-to-b from-[#0f1f38] via-navy-dark to-[#1a2f4f] text-white flex flex-col relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-crimson/10 blur-3xl animate-float-slow" />
      <div className="absolute bottom-32 -left-16 w-48 h-48 rounded-full bg-white/5 blur-2xl animate-float-slow" style={{ animationDelay: '1s' }} />

      <div className="flex justify-end p-5 pt-8 relative z-10">
        <button
          onClick={() => setLang(lang === 'en' ? 'fr' : 'en')}
          className="flex items-center gap-1.5 text-xs font-bold bg-white/10 backdrop-blur px-3 py-1.5 rounded-full border border-white/10"
        >
          <span>{lang === 'en' ? '🇺🇸' : '🇫🇷'}</span> {lang.toUpperCase()}
        </button>
      </div>

      <div className={`flex-1 flex flex-col items-center justify-center px-6 relative z-10 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <div className="bg-white rounded-3xl p-5 shadow-2xl mb-5 animate-welcome-logo">
          <LogoFull height={88} />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-center">{t('appName')}</h1>
        <p className="text-white/60 text-sm mt-1 text-center">{t('welcomeSubtitle')}</p>

        <div className="w-full max-w-sm mt-8 space-y-2.5">
          {features.map((f, i) => (
            <div
              key={f.text}
              className="flex items-center gap-3 bg-white/8 backdrop-blur border border-white/10 rounded-2xl px-4 py-3 animate-stagger-in"
              style={{ animationDelay: `${0.15 + i * 0.1}s` }}
            >
              <span className="text-xl">{f.emoji}</span>
              <span className="text-sm font-medium text-white/90">{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={`px-6 pb-8 space-y-3 relative z-10 transition-all duration-700 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <button
          onClick={onGetStarted}
          className="w-full bg-gradient-to-r from-crimson to-crimson-dark hover:from-crimson-dark hover:to-crimson text-white font-bold py-4 rounded-2xl shadow-lg shadow-crimson/30 active:scale-[0.98] transition"
        >
          ✨ {t('getStarted')}
        </button>
        <button
          onClick={onSignIn}
          className="w-full bg-white/10 backdrop-blur border border-white/20 text-white font-bold py-4 rounded-2xl active:scale-[0.98] transition hover:bg-white/15"
        >
          {t('signIn')}
        </button>
        <p className="text-center text-[10px] text-white/40 pt-1">🔒 {t('dataProtected')}</p>
      </div>
    </div>
  );
}

export function Onboarding({ onDone }: { onDone: () => void }) {
  const { t, lang, setLang } = useT();
  const [step, setStep] = useState(0);

  const slides = [
    { emoji: '📢', title: t('onboard1Title'), desc: t('onboard1Desc'), color: 'from-navy to-navy-light' },
    { emoji: '🏪', title: t('onboard2Title'), desc: t('onboard2Desc'), color: 'from-crimson to-crimson-dark' },
    { emoji: '💼', title: t('onboard3Title'), desc: t('onboard3Desc'), color: 'from-navy via-navy-light to-crimson-dark' },
  ];

  const s = slides[step];

  return (
    <div className="min-h-full flex flex-col bg-white">
      <div className="flex items-center justify-between p-5 pt-8">
        <button
          onClick={() => setLang(lang === 'en' ? 'fr' : 'en')}
          className="flex items-center gap-1 text-xs font-bold text-navy bg-slate-100 px-3 py-1.5 rounded-full"
        >
          <GlobeIcon size={14} /> {lang.toUpperCase()}
        </button>
        <button onClick={onDone} className="text-slate-500 text-sm font-medium">{t('skip')}</button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div
          key={step}
          className={`w-40 h-40 rounded-[2rem] bg-gradient-to-br ${s.color} flex items-center justify-center text-6xl shadow-xl mb-8 animate-slide-up`}
        >
          {s.emoji}
        </div>
        <h2 className="text-2xl font-extrabold text-navy mb-3 animate-fade-in">{s.title}</h2>
        <p className="text-slate-600 leading-relaxed max-w-xs animate-fade-in">{s.desc}</p>
      </div>

      <div className="flex justify-center gap-2 mb-6">
        {slides.map((_, i) => (
          <span
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-7 bg-crimson' : 'w-2 bg-slate-300'}`}
          />
        ))}
      </div>

      <div className="p-6 pt-2 pb-8">
        <button
          onClick={() => (step < slides.length - 1 ? setStep(step + 1) : onDone())}
          className="w-full bg-navy hover:bg-navy-dark text-white font-bold py-4 rounded-2xl shadow-lg active:scale-[0.98] transition"
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

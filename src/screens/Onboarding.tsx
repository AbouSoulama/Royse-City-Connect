import { useEffect, useState, type ReactNode } from 'react';
import { useT } from '../i18n';
import { LogoFull } from '../components/Logo';
import { heroBackgrounds } from '../data/heroImages';
import { GlobeIcon, NewsIcon, StoreIcon, ShieldIcon, BriefIcon } from '../components/Icons';

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
    { icon: <NewsIcon size={18} />, text: t('welcomeFeature1') },
    { icon: <StoreIcon size={18} />, text: t('welcomeFeature2') },
    { icon: <BriefIcon size={18} />, text: t('welcomeFeature3') },
    { icon: <ShieldIcon size={18} />, text: t('welcomeFeature4') },
  ];

  return (
    <div className="flex-1 min-h-0 flex flex-col text-white overflow-y-auto phone-scroll welcome-mesh relative">
      <div
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          backgroundImage: `url(${heroBackgrounds.welcome})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          maskImage: 'linear-gradient(180deg, black 0%, transparent 70%)',
          WebkitMaskImage: 'linear-gradient(180deg, black 0%, transparent 70%)',
        }}
      />
      <div className="absolute inset-0 animate-shimmer pointer-events-none opacity-30" />

      <div className="relative flex justify-end p-4 pt-3 shrink-0">
        <button
          type="button"
          onClick={() => setLang(lang === 'en' ? 'fr' : 'en')}
          className="flex items-center gap-1.5 text-xs font-bold bg-white/12 px-3 py-1.5 rounded-full border border-white/20 text-white backdrop-blur-md tap-scale"
        >
          <GlobeIcon size={13} /> {lang.toUpperCase()}
        </button>
      </div>

      <div className={`relative flex-1 flex flex-col items-center justify-center px-5 py-4 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <div className="bg-white rounded-[1.75rem] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] mb-5 animate-welcome-logo animate-float">
          <LogoFull height={78} />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-center text-white font-display">{t('appName')}</h1>
        <p className="text-white/70 text-sm mt-2 text-center max-w-xs leading-relaxed">{t('welcomeSubtitle')}</p>

        <div className="w-full max-w-sm mt-7 space-y-2">
          {features.map((f, i) => (
            <div
              key={f.text}
              className="flex items-center gap-3 bg-white/[0.08] border border-white/15 rounded-2xl px-3.5 py-2.5 backdrop-blur-md animate-rise"
              style={{ animationDelay: `${0.12 + i * 0.07}s` }}
            >
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-crimson/80 to-crimson-dark flex items-center justify-center shrink-0 text-white shadow-lg shadow-crimson/20">
                {f.icon}
              </span>
              <span className="text-sm font-semibold text-white/95 leading-snug">{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={`relative px-5 pb-5 pt-2 space-y-2.5 shrink-0 transition-all duration-700 delay-150 ${visible ? 'opacity-100' : 'opacity-0'}`}>
        <button
          type="button"
          onClick={onGetStarted}
          className="w-full btn-crimson text-white font-bold py-3.5 rounded-2xl active:scale-[0.98] transition font-display tracking-wide"
        >
          {t('getStarted')}
        </button>
        <button
          type="button"
          onClick={onSignIn}
          className="w-full bg-white/10 border border-white/25 text-white font-bold py-3.5 rounded-2xl active:scale-[0.98] transition backdrop-blur-md"
        >
          {t('signIn')}
        </button>
        <p className="text-center text-[10px] text-white/45 pt-1 tracking-wide">{t('dataProtected')}</p>
      </div>
    </div>
  );
}

export function Onboarding({ onDone }: { onDone: () => void }) {
  const { t, lang, setLang } = useT();
  const [step, setStep] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  const slides = [
    {
      icon: <NewsIcon size={44} className="text-white" />,
      title: t('onboard1Title'),
      desc: t('onboard1Desc'),
      color: 'from-navy via-navy-light to-navy-dark',
      image: heroBackgrounds.welcome,
    },
    {
      icon: <StoreIcon size={44} className="text-white" />,
      title: t('onboard2Title'),
      desc: t('onboard2Desc'),
      color: 'from-crimson via-crimson-light to-crimson-dark',
      image: heroBackgrounds.businesses,
    },
    {
      icon: <BriefIcon size={44} className="text-white" />,
      title: t('onboard3Title'),
      desc: t('onboard3Desc'),
      color: 'from-navy via-navy-light to-crimson-dark',
      image: heroBackgrounds.jobs,
    },
  ];

  const s = slides[step];

  const goNext = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
      setAnimKey((k) => k + 1);
    } else {
      onDone();
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-white overflow-y-auto phone-scroll">
      <div className="flex items-center justify-between p-4 pt-3 shrink-0">
        <button
          type="button"
          onClick={() => setLang(lang === 'en' ? 'fr' : 'en')}
          className="flex items-center gap-1 text-xs font-bold text-navy bg-navy/[0.06] px-3 py-1.5 rounded-full"
        >
          <GlobeIcon size={14} /> {lang.toUpperCase()}
        </button>
        <button type="button" onClick={onDone} className="text-slate-400 text-sm font-semibold hover:text-navy transition-colors">{t('skip')}</button>
      </div>

      <div key={animKey} className="flex-1 flex flex-col items-center justify-center px-6 text-center animate-rise">
        <div className={`relative w-40 h-40 rounded-[2rem] bg-gradient-to-br ${s.color} flex items-center justify-center shadow-[0_24px_48px_rgba(30,58,95,0.25)] mb-7 overflow-hidden`}>
          <img src={s.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <span className="relative z-10 drop-shadow-lg">{s.icon}</span>
        </div>
        <h2 className="text-2xl font-extrabold text-navy mb-2.5 font-display tracking-tight">{s.title}</h2>
        <p className="text-slate-500 text-sm leading-relaxed max-w-xs">{s.desc}</p>
      </div>

      <div className="flex justify-center gap-2 mb-5 shrink-0">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => { setStep(i); setAnimKey((k) => k + 1); }}
            aria-label={`Step ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-400 ${i === step ? 'w-8 bg-crimson' : 'w-2 bg-slate-200 hover:bg-slate-300'}`}
          />
        ))}
      </div>

      <div className="p-5 pt-0 pb-5 shrink-0">
        <button
          type="button"
          onClick={goNext}
          className="w-full btn-navy font-bold py-3.5 rounded-2xl active:scale-[0.98] transition font-display tracking-wide"
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

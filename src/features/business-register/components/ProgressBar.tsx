import { WIZARD_STEPS, TOTAL_STEPS } from '../constants';

export function ProgressBar({ step }: { step: number }) {
  const pct = Math.round((step / TOTAL_STEPS) * 100);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-bold text-navy/60 uppercase tracking-wider">
          Step {step} of {TOTAL_STEPS}
        </div>
        <div className="text-xs font-extrabold text-crimson">{pct}%</div>
      </div>
      <div className="h-2 rounded-full bg-navy/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-navy via-navy-light to-crimson transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="hidden md:flex gap-1 overflow-x-auto">
        {WIZARD_STEPS.map((s) => (
          <div
            key={s.id}
            className={`flex-1 min-w-0 text-center text-[10px] font-bold truncate py-1 rounded-lg ${
              s.id === step
                ? 'text-crimson bg-crimson/[0.08]'
                : s.id < step
                  ? 'text-navy/70'
                  : 'text-slate-400'
            }`}
          >
            {s.short}
          </div>
        ))}
      </div>
    </div>
  );
}

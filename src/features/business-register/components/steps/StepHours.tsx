import { WEEKDAYS, WEEKDAY_LABELS } from '../../constants';
import { Field, Input } from '../ui';
import type { StepProps } from './types';

export function StepHours({ watch, setValue, errors }: StepProps) {
  const hours = watch('hours');

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-extrabold text-navy font-display tracking-tight">Opening hours</h2>
        <p className="text-sm text-slate-500 mt-1">Set your weekly schedule. Toggle closed for days off.</p>
      </div>

      <div className="space-y-3">
        {WEEKDAYS.map((day) => {
          const d = hours[day];
          return (
            <div key={day} className="rounded-2xl border border-navy/10 bg-white p-3.5">
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="text-sm font-bold text-navy">{WEEKDAY_LABELS[day]}</span>
                <button
                  type="button"
                  onClick={() =>
                    setValue(`hours.${day}.closed`, !d.closed, { shouldDirty: true })
                  }
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    d.closed ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {d.closed ? 'Closed' : 'Open'}
                </button>
              </div>
              {!d.closed && (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Opens">
                    <Input
                      type="time"
                      value={d.open}
                      onChange={(e) => setValue(`hours.${day}.open`, e.target.value, { shouldDirty: true })}
                    />
                  </Field>
                  <Field label="Closes">
                    <Input
                      type="time"
                      value={d.close}
                      onChange={(e) => setValue(`hours.${day}.close`, e.target.value, { shouldDirty: true })}
                    />
                  </Field>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {errors.hours && (
        <p className="text-xs text-crimson" role="alert">Please review your hours.</p>
      )}
    </div>
  );
}

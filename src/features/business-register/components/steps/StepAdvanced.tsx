import { IDEAL_FOR_OPTIONS } from '../../constants';
import { CheckboxCard, ChipToggle, Field, Input, Textarea } from '../ui';
import type { BusinessRegisterFormValues } from '../../schema';
import type { StepProps } from './types';

type BoolKey =
  | 'wheelchairAccessible'
  | 'familyOwned'
  | 'womanOwned'
  | 'veteranOwned'
  | 'minorityOwned'
  | 'licensed'
  | 'insured'
  | 'emergencyService'
  | 'seasonalServices';

export function StepAdvanced({ register, watch, setValue }: StepProps) {
  const idealFor = watch('idealFor') ?? [];

  const flags: { key: BoolKey; label: string }[] = [
    { key: 'wheelchairAccessible', label: 'Wheelchair accessible' },
    { key: 'familyOwned', label: 'Family-owned business' },
    { key: 'womanOwned', label: 'Woman-owned business' },
    { key: 'veteranOwned', label: 'Veteran-owned business' },
    { key: 'minorityOwned', label: 'Minority-owned business' },
    { key: 'licensed', label: 'Licensed business' },
    { key: 'insured', label: 'Insured business' },
    { key: 'emergencyService', label: 'Emergency service available' },
    { key: 'seasonalServices', label: 'Seasonal services' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-extrabold text-navy font-display tracking-tight">Advanced details</h2>
        <p className="text-sm text-slate-500 mt-1">Improve discoverability in the Royse City guide.</p>
      </div>

      <Field label="Languages spoken" hint="Comma-separated">
        <Input placeholder="English, French, Spanish…" {...register('languages')} />
      </Field>

      <Field label="Payment methods" hint="Comma-separated">
        <Input placeholder="Cash, Credit, Zelle…" {...register('paymentMethods')} />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {flags.map((f) => (
          <CheckboxCard
            key={f.key}
            label={f.label}
            checked={!!watch(f.key)}
            onChange={(v) => setValue(f.key, v as BusinessRegisterFormValues[BoolKey], { shouldDirty: true })}
          />
        ))}
      </div>

      <Field label="Keywords">
        <Textarea placeholder="Search keywords for your listing" {...register('keywords')} />
      </Field>

      <Field label="AI tags">
        <Input placeholder="Optional tags for smart matching" {...register('aiTags')} />
      </Field>

      <Field label="Ideal for">
        <div className="flex flex-wrap gap-2 pt-1">
          {IDEAL_FOR_OPTIONS.map((opt) => {
            const selected = idealFor.includes(opt);
            return (
              <ChipToggle
                key={opt}
                label={opt}
                selected={selected}
                onToggle={() => {
                  const next = selected
                    ? idealFor.filter((o: BusinessRegisterFormValues['idealFor'][number]) => o !== opt)
                    : [...idealFor, opt];
                  setValue('idealFor', next, { shouldDirty: true });
                }}
              />
            );
          })}
        </div>
      </Field>
    </div>
  );
}

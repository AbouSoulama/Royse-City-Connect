import { COMMERCIAL_OPTIONS, PRICE_RANGES } from '../../constants';
import type { BusinessRegisterFormValues } from '../../schema';
import { ChipToggle, Field, Textarea } from '../ui';
import type { StepProps } from './types';

export function StepCommercial({ register, errors, watch, setValue }: StepProps) {
  const price = watch('priceRange');
  const options = watch('commercialOptions') ?? [];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-extrabold text-navy font-display tracking-tight">Commercial details</h2>
        <p className="text-sm text-slate-500 mt-1">Help customers know if you’re the right fit.</p>
      </div>

      <Field label="Ideal customers" error={errors.idealClients?.message}>
        <Textarea placeholder="Families, new residents, professionals…" {...register('idealClients')} />
      </Field>

      <Field label="Top 5 services" error={errors.topServices?.message} hint="Separate with commas">
        <Textarea placeholder="Service 1, Service 2, Service 3…" {...register('topServices')} />
      </Field>

      <Field label="Price range" error={errors.priceRange?.message}>
        <div className="flex flex-wrap gap-2 pt-1">
          {PRICE_RANGES.map((p) => (
            <ChipToggle
              key={p}
              label={p}
              selected={price === p}
              onToggle={() => setValue('priceRange', price === p ? '' : p, { shouldDirty: true })}
            />
          ))}
        </div>
      </Field>

      <Field label="Options">
        <div className="flex flex-wrap gap-2 pt-1">
          {COMMERCIAL_OPTIONS.map((opt) => {
            const selected = options.includes(opt);
            return (
              <ChipToggle
                key={opt}
                label={opt}
                selected={selected}
                onToggle={() => {
                  const next = selected
                    ? options.filter((o: BusinessRegisterFormValues['commercialOptions'][number]) => o !== opt)
                    : [...options, opt];
                  setValue('commercialOptions', next, { shouldDirty: true });
                }}
              />
            );
          })}
        </div>
      </Field>
    </div>
  );
}

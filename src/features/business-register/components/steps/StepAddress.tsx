import { SERVICE_AREAS } from '../../constants';
import { ChipToggle, Field, Input } from '../ui';
import type { StepProps } from './types';

type ServiceArea = (typeof SERVICE_AREAS)[number];

export function StepAddress({ register, errors, watch, setValue }: StepProps) {
  const areas = watch('serviceAreas') ?? [];

  const toggleArea = (area: ServiceArea) => {
    const next = areas.includes(area)
      ? areas.filter((a: ServiceArea) => a !== area)
      : [...areas, area];
    setValue('serviceAreas', next, { shouldValidate: true });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-extrabold text-navy font-display tracking-tight">Address & coverage</h2>
        <p className="text-sm text-slate-500 mt-1">Help locals find and visit you.</p>
      </div>

      <Field label="Street address" required error={errors.address?.message}>
        <Input placeholder="123 Main St" {...register('address')} />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="City" required error={errors.city?.message}>
          <Input placeholder="Royse City" {...register('city')} />
        </Field>
        <Field label="ZIP code" required error={errors.postalCode?.message}>
          <Input placeholder="75189" {...register('postalCode')} />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Latitude (GPS)" error={errors.latitude?.message} hint="Optional">
          <Input placeholder="32.9751" {...register('latitude')} />
        </Field>
        <Field label="Longitude (GPS)" error={errors.longitude?.message} hint="Optional">
          <Input placeholder="-96.3325" {...register('longitude')} />
        </Field>
      </div>

      <Field label="Service areas" error={errors.serviceAreas?.message as string | undefined}>
        <div className="flex flex-wrap gap-2 pt-1">
          {SERVICE_AREAS.map((area) => (
            <ChipToggle
              key={area}
              label={area}
              selected={areas.includes(area)}
              onToggle={() => toggleArea(area)}
            />
          ))}
        </div>
      </Field>
    </div>
  );
}

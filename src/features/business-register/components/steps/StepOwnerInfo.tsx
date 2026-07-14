import { CONTACT_METHODS } from '../../constants';
import { ChipToggle, Field, Input, Select } from '../ui';
import type { StepProps } from './types';

export function StepOwnerInfo({ register, errors, watch, setValue }: StepProps) {
  const preferred = watch('preferredContact');

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-extrabold text-navy font-display tracking-tight">Owner information</h2>
        <p className="text-sm text-slate-500 mt-1">How customers and our team can reach you.</p>
      </div>

      <Field label="Owner / contact name" required error={errors.ownerName?.message}>
        <Input placeholder="Full name" {...register('ownerName')} />
      </Field>

      <Field label="Role / title" error={errors.ownerTitle?.message}>
        <Input placeholder="Owner, Manager, Founder…" {...register('ownerTitle')} />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Phone" required error={errors.phone?.message}>
          <Input type="tel" placeholder="+1 469 555 0100" {...register('phone')} />
        </Field>
        <Field label="Email" required error={errors.ownerEmail?.message}>
          <Input type="email" placeholder="you@business.com" {...register('ownerEmail')} />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="WhatsApp" error={errors.whatsapp?.message}>
          <Input type="tel" placeholder="+1 469 555 0100" {...register('whatsapp')} />
        </Field>
        <Field label="Website" error={errors.website?.message}>
          <Input type="url" placeholder="https://…" {...register('website')} />
        </Field>
      </div>

      <Field label="Preferred contact method" required error={errors.preferredContact?.message}>
        <div className="flex flex-wrap gap-2 pt-1">
          {CONTACT_METHODS.map((m) => (
            <ChipToggle
              key={m}
              label={m}
              selected={preferred === m}
              onToggle={() => setValue('preferredContact', m, { shouldValidate: true })}
            />
          ))}
        </div>
        <Select className="sr-only" tabIndex={-1} {...register('preferredContact')}>
          {CONTACT_METHODS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </Select>
      </Field>
    </div>
  );
}

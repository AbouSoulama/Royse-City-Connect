import {
  BUSINESS_CATEGORIES,
  EMPLOYEE_COUNTS,
} from '../../constants';
import { Field, Input, Select, Textarea } from '../ui';
import type { StepProps } from './types';

export function StepBusinessInfo({ register, errors }: StepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-extrabold text-navy font-display tracking-tight">Business information</h2>
        <p className="text-sm text-slate-500 mt-1">Tell the community what you offer in Royse City.</p>
      </div>

      <Field label="Business name" required error={errors.name?.message}>
        <Input placeholder="e.g. Mama Awa Kitchen" {...register('name')} />
      </Field>

      <Field label="Category" required error={errors.category?.message}>
        <Select {...register('category')}>
          {BUSINESS_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Select>
      </Field>

      <Field label="Description" required error={errors.description?.message} hint="At least 20 characters">
        <Textarea placeholder="Describe your business, atmosphere, and what makes customers come back…" {...register('description')} />
      </Field>

      <Field label="Products / Services" error={errors.productsServices?.message}>
        <Textarea placeholder="List your main products or services" {...register('productsServices')} />
      </Field>

      <Field label="What makes your business unique?" error={errors.uniqueSellingPoint?.message}>
        <Textarea placeholder="Your story, values, specialty…" {...register('uniqueSellingPoint')} />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Year founded" error={errors.yearFounded?.message}>
          <Input inputMode="numeric" placeholder="2018" {...register('yearFounded')} />
        </Field>
        <Field label="Number of employees" error={errors.employeeCount?.message}>
          <Select {...register('employeeCount')}>
            <option value="">Select…</option>
            {EMPLOYEE_COUNTS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </Field>
      </div>
    </div>
  );
}

import { Field, Input } from '../ui';
import type { StepProps } from './types';

const SOCIAL_FIELDS = [
  { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/…' },
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/…' },
  { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@…' },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@…' },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/company/…' },
  { key: 'googleBusiness', label: 'Google Business Profile', placeholder: 'https://maps.google.com/…' },
] as const;

export function StepOnlinePresence({ register }: StepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-extrabold text-navy font-display tracking-tight">Online presence</h2>
        <p className="text-sm text-slate-500 mt-1">Optional — add the profiles customers already follow.</p>
      </div>

      {SOCIAL_FIELDS.map((f) => (
        <Field key={f.key} label={f.label}>
          <Input placeholder={f.placeholder} {...register(`social.${f.key}`)} />
        </Field>
      ))}
    </div>
  );
}

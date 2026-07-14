import { PROMO_CHANNELS } from '../../constants';
import type { BusinessRegisterFormValues } from '../../schema';
import { CheckboxCard, ChipToggle, Field, Textarea } from '../ui';
import type { StepProps } from './types';

export function StepPartnership({ register, watch, setValue }: StepProps) {
  const channels = watch('promoChannels') ?? [];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-extrabold text-navy font-display tracking-tight">Royse City Connect partnership</h2>
        <p className="text-sm text-slate-500 mt-1">Optional promotion preferences — we’ll never publish without approval.</p>
      </div>

      <Field label="Feature me on">
        <div className="flex flex-wrap gap-2 pt-1">
          {PROMO_CHANNELS.map((ch) => {
            const selected = channels.includes(ch);
            return (
              <ChipToggle
                key={ch}
                label={ch}
                selected={selected}
                onToggle={() => {
                  const next = selected
                    ? channels.filter((c: BusinessRegisterFormValues['promoChannels'][number]) => c !== ch)
                    : [...channels, ch];
                  setValue('promoChannels', next, { shouldDirty: true });
                }}
              />
            );
          })}
        </div>
      </Field>

      <CheckboxCard
        label="Receive advertising offers"
        description="Yes — send me partnership & promo opportunities"
        checked={watch('wantAdOffers')}
        onChange={(v) => setValue('wantAdOffers', v, { shouldDirty: true })}
      />

      <CheckboxCard
        label="Photo usage authorization"
        description="Allow Royse City Connect to use my photos for community promotion"
        checked={watch('photoUsageAllowed')}
        onChange={(v) => setValue('photoUsageAllowed', v, { shouldDirty: true })}
      />

      <Field label="Comments">
        <Textarea
          placeholder="Anything else our team should know?"
          {...register('partnershipComments')}
        />
      </Field>
    </div>
  );
}

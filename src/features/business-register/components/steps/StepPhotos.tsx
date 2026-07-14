import { useState } from 'react';
import { PHOTO_SLOTS } from '../../constants';
import { uploadBusinessPhoto } from '../../services/registerBusiness';
import { Field } from '../ui';
import type { StepProps } from './types';

export function StepPhotos({
  watch,
  setValue,
  draftToken,
}: StepProps & { draftToken: string }) {
  const photos = watch('photos');
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onFile = async (slot: (typeof PHOTO_SLOTS)[number]['key'], file?: File) => {
    if (!file) return;
    setError(null);
    setUploading(slot);
    const result = await uploadBusinessPhoto(file, draftToken, slot);
    setUploading(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.url) {
      setValue(`photos.${slot}`, result.url, { shouldDirty: true });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-extrabold text-navy font-display tracking-tight">Photos</h2>
        <p className="text-sm text-slate-500 mt-1">
          Upload HD images (JPEG, PNG, WebP — max 5 MB). URLs are saved automatically.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700" role="alert">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PHOTO_SLOTS.map((slot) => {
          const url = photos?.[slot.key];
          return (
            <Field key={slot.key} label={slot.label}>
              <div className="relative overflow-hidden rounded-2xl border border-dashed border-navy/20 bg-navy/[0.02] min-h-[140px] flex flex-col items-center justify-center">
                {url ? (
                  <>
                    <img src={url} alt={slot.label} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <button
                      type="button"
                      className="absolute top-2 right-2 z-10 rounded-full bg-white/90 px-2 py-1 text-[10px] font-bold text-crimson"
                      onClick={() => setValue(`photos.${slot.key}`, '', { shouldDirty: true })}
                    >
                      Remove
                    </button>
                  </>
                ) : (
                  <div className="text-center px-4 py-8 relative z-10">
                    <div className="text-2xl mb-1 text-navy/30">＋</div>
                    <div className="text-xs font-semibold text-slate-500">
                      {uploading === slot.key ? 'Uploading…' : `Add ${slot.label.toLowerCase()}`}
                    </div>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="absolute inset-0 opacity-0 cursor-pointer z-20"
                  disabled={uploading === slot.key}
                  onChange={(e) => onFile(slot.key, e.target.files?.[0])}
                />
              </div>
            </Field>
          );
        })}
      </div>
    </div>
  );
}

import { useRef, useState } from 'react';
import { uploadImage } from '../services/storage';

export function ImageUpload({
  folder,
  value,
  onChange,
  label = 'Photo (optional)',
}: {
  folder: 'posts' | 'businesses' | 'events' | 'avatars' | 'jobs';
  value?: string;
  onChange: (url: string | undefined) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);
    const { url, error: err } = await uploadImage(file, folder);
    setUploading(false);
    if (err) {
      setError(err);
      return;
    }
    onChange(url);
  };

  return (
    <div>
      <span className="text-xs font-bold text-slate-600">{label}</span>
      <div className="mt-1.5">
        {value ? (
          <div className="relative rounded-xl overflow-hidden border border-slate-200">
            <img src={value} alt="Upload preview" className="w-full h-36 object-cover" />
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="absolute top-2 right-2 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded-lg"
            >
              Remove
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-full border-2 border-dashed border-slate-200 rounded-xl py-6 text-center text-sm text-slate-500 hover:border-crimson/40 hover:text-crimson transition disabled:opacity-50"
          >
            {uploading ? 'Uploading…' : '📷 Tap to add a photo'}
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = '';
          }}
        />
      </div>
      {error && (
        <p className="text-xs text-rose-600 mt-1">{error}</p>
      )}
    </div>
  );
}

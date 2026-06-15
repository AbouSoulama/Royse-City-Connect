import { useState } from 'react';
import { useT } from '../i18n';
import { ModalSheet } from './Layout';
import { submitReport, type ReportReason } from '../services/reports';
import type { SavedItemType } from '../services/savedItems';

const REASONS: { id: ReportReason; label: string }[] = [
  { id: 'spam', label: 'Spam' },
  { id: 'harassment', label: 'Harassment' },
  { id: 'misinformation', label: 'Misinformation' },
  { id: 'inappropriate', label: 'Inappropriate content' },
  { id: 'other', label: 'Other' },
];

export function ReportSheet({
  open,
  onClose,
  itemId,
  itemType,
  reporterId,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  itemId: string;
  itemType: SavedItemType;
  reporterId?: string;
  onSuccess?: () => void;
}) {
  const { t } = useT();
  const [reason, setReason] = useState<ReportReason>('spam');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!reporterId) {
      setError('Sign in to report content.');
      return;
    }
    setLoading(true);
    setError(null);
    const result = await submitReport({ reporterId, itemId, itemType, reason, message });
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setDone(true);
    onSuccess?.();
  };

  const handleClose = () => {
    setDone(false);
    setMessage('');
    setError(null);
    onClose();
  };

  return (
    <ModalSheet open={open} onClose={handleClose} title={t('reportContent')}>
      <div className="p-4 pb-8 space-y-4">
        {done ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-2">✅</div>
            <p className="text-sm text-navy font-semibold">Report submitted. Thank you.</p>
            <button type="button" onClick={handleClose} className="mt-4 w-full bg-navy text-white font-bold py-3 rounded-xl">
              {t('close')}
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-600">Why are you reporting this content?</p>
            <div className="space-y-2">
              {REASONS.map((r) => (
                <label key={r.id} className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <input
                    type="radio"
                    name="report-reason"
                    checked={reason === r.id}
                    onChange={() => setReason(r.id)}
                    className="accent-crimson"
                  />
                  <span className="text-sm text-navy font-medium">{r.label}</span>
                </label>
              ))}
            </div>
            <label className="block">
              <span className="text-xs font-bold text-slate-600">Additional details (optional)</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none resize-none"
                placeholder="Describe the issue…"
              />
            </label>
            {error && (
              <div className="text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-xl px-3 py-2">{error}</div>
            )}
            <button
              type="button"
              onClick={submit}
              disabled={loading}
              className="w-full bg-crimson text-white font-bold py-3 rounded-xl disabled:opacity-60"
            >
              {loading ? '…' : 'Submit report'}
            </button>
          </>
        )}
      </div>
    </ModalSheet>
  );
}

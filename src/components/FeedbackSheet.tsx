import { useState } from 'react';
import { useT } from '../i18n';
import { ModalSheet } from './Layout';
import { submitFeedback, FeedbackCategory } from '../services/feedback';

const CATEGORIES: { id: FeedbackCategory; labelKey: 'feedbackGeneral' | 'feedbackBug' | 'feedbackFeature' | 'feedbackDesign' | 'feedbackOther' }[] = [
  { id: 'general', labelKey: 'feedbackGeneral' },
  { id: 'bug', labelKey: 'feedbackBug' },
  { id: 'feature', labelKey: 'feedbackFeature' },
  { id: 'design', labelKey: 'feedbackDesign' },
  { id: 'other', labelKey: 'feedbackOther' },
];

export function FeedbackSheet({
  open,
  onClose,
  userId,
  userName,
}: {
  open: boolean;
  onClose: () => void;
  userId?: string;
  userName: string;
}) {
  const { t } = useT();
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState<FeedbackCategory>('general');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!message.trim()) {
      setError(t('feedbackRequired'));
      return;
    }
    setSaving(true);
    setError('');
    const result = await submitFeedback({ userId, userName, rating, category, message });
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setDone(true);
    setTimeout(() => {
      setDone(false);
      setMessage('');
      setRating(5);
      setCategory('general');
      onClose();
    }, 1500);
  };

  return (
    <ModalSheet open={open} onClose={onClose} title={t('giveFeedback')}>
      <div className="p-4 pb-6">
        {done ? (
          <p className="text-center text-green-600 font-semibold py-8">{t('feedbackThanks')}</p>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-4">{t('feedbackDesc')}</p>

            <div className="text-xs font-bold text-slate-500 uppercase mb-2">{t('feedbackRating')}</div>
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className={`text-2xl transition-transform ${n <= rating ? 'scale-110' : 'opacity-30 grayscale'}`}
                >
                  ⭐
                </button>
              ))}
            </div>

            <div className="text-xs font-bold text-slate-500 uppercase mb-2">{t('feedbackCategory')}</div>
            <div className="flex flex-wrap gap-2 mb-4">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
                    category === c.id ? 'bg-navy text-white border-navy' : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  {t(c.labelKey)}
                </button>
              ))}
            </div>

            <div className="text-xs font-bold text-slate-500 uppercase mb-2">{t('feedbackMessage')}</div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('feedbackPlaceholder')}
              rows={4}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-navy resize-none mb-3"
            />

            {error && <p className="text-xs text-crimson mb-2">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={saving}
              className="w-full bg-navy text-white font-bold py-3 rounded-xl disabled:opacity-50"
            >
              {saving ? '…' : t('submit')}
            </button>
          </>
        )}
      </div>
    </ModalSheet>
  );
}

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../../contexts/AuthContext';
import { LogoHeader } from '../../../components/Logo';
import { TOTAL_STEPS } from '../constants';
import {
  STEP_FIELDS,
  STEP_SCHEMAS,
  businessRegisterSchema,
  createDefaultValues,
  type BusinessRegisterFormValues,
} from '../schema';
import {
  clearLocalDraft,
  newDraftToken,
  readLocalDraft,
  saveBusinessRegistration,
  writeLocalDraft,
} from '../services/registerBusiness';
import { ProgressBar } from './ProgressBar';
import { SuccessPage } from './SuccessPage';
import { Button } from './ui';
import { StepBusinessInfo } from './steps/StepBusinessInfo';
import { StepOwnerInfo } from './steps/StepOwnerInfo';
import { StepAddress } from './steps/StepAddress';
import { StepHours } from './steps/StepHours';
import { StepOnlinePresence } from './steps/StepOnlinePresence';
import { StepPhotos } from './steps/StepPhotos';
import { StepCommercial } from './steps/StepCommercial';
import { StepAdvanced } from './steps/StepAdvanced';
import { StepPartnership } from './steps/StepPartnership';

export function BusinessRegisterWizard({ onHome }: { onHome: () => void }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draftToken, setDraftToken] = useState(() => newDraftToken());
  const [recordId, setRecordId] = useState<string | undefined>();
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const defaults = useMemo(() => createDefaultValues(), []);

  const methods = useForm<BusinessRegisterFormValues>({
    resolver: zodResolver(businessRegisterSchema),
    defaultValues: defaults,
    mode: 'onBlur',
  });

  const { register, control, handleSubmit, watch, setValue, trigger, formState: { errors }, getValues, reset } = methods;

  // Restore draft or prefill from signed-in user
  useEffect(() => {
    const local = readLocalDraft();
    if (local) {
      setDraftToken(local.draftToken);
      setRecordId(local.id);
      setStep(Math.min(Math.max(local.step || 1, 1), TOTAL_STEPS));
      reset({ ...createDefaultValues(), ...local.values });
      return;
    }
    if (user && !user.guest) {
      reset({
        ...createDefaultValues(),
        ownerName: user.name || '',
        phone: user.phone || '',
        ownerEmail: user.email || '',
        city: user.city || 'Royse City',
      });
    }
  }, [reset, user]);

  const persist = useCallback(
    async (mode: 'draft' | 'pending', nextStep = step) => {
      setSaving(true);
      setError(null);
      const values = getValues();
      const result = await saveBusinessRegistration({
        values,
        mode,
        step: nextStep,
        draftToken,
        id: recordId,
        ownerId: user && !user.guest ? user.id : null,
      });
      setSaving(false);

      if (result.error) {
        setError(result.error);
        // Keep local draft anyway
        writeLocalDraft({
          id: recordId,
          draftToken,
          step: nextStep,
          values,
          updatedAt: new Date().toISOString(),
        });
        return false;
      }

      if (result.row?.id) setRecordId(result.row.id);
      if (result.row?.draft_token) setDraftToken(result.row.draft_token);
      setSaveMsg(mode === 'draft' ? 'Draft saved' : 'Submitted');
      setTimeout(() => setSaveMsg(null), 2200);
      return true;
    },
    [draftToken, getValues, recordId, step, user]
  );

  // Autosave draft on change (debounced)
  useEffect(() => {
    const sub = watch(() => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => {
        void persist('draft', step);
      }, 1800);
    });
    return () => {
      sub.unsubscribe();
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [watch, persist, step]);

  const validateStep = async (s: number) => {
    const fields = STEP_FIELDS[s - 1];
    // Prefer field-level trigger; also run step schema for nested objects
    const okFields = await trigger(fields as (keyof BusinessRegisterFormValues)[]);
    const parsed = STEP_SCHEMAS[s - 1].safeParse(getValues());
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const path = issue.path.join('.') as keyof BusinessRegisterFormValues;
        methods.setError(path as never, { message: issue.message });
      }
      return false;
    }
    return okFields;
  };

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goNext = async () => {
    const ok = await validateStep(step);
    if (!ok) return;
    const next = Math.min(step + 1, TOTAL_STEPS);
    setStep(next);
    await persist('draft', next);
    scrollToTop();
  };

  const goPrev = () => {
    setStep((s) => Math.max(1, s - 1));
    scrollToTop();
  };

  const saveDraft = async () => {
    await persist('draft', step);
  };

  const onSubmit = handleSubmit(async () => {
    // Validate all steps
    for (let s = 1; s <= TOTAL_STEPS; s++) {
      const ok = await validateStep(s);
      if (!ok) {
        setStep(s);
        setError('Please complete the required fields before submitting.');
        return;
      }
    }
    const ok = await persist('pending', TOTAL_STEPS);
    if (ok) {
      clearLocalDraft();
      setSubmitted(true);
    }
  });

  const stepProps = { register, control, errors, watch, setValue };

  if (submitted) {
    return (
      <div className="h-[100dvh] overflow-y-auto phone-scroll bg-cream">
        <SuccessPage onHome={onHome} />
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div
        ref={scrollRef}
        className="h-[100dvh] max-h-[100dvh] overflow-x-clip overflow-y-auto phone-scroll welcome-mesh text-white"
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 pb-28 pt-6 min-h-full">
          <header className="flex items-center justify-between gap-3 mb-6">
            <button type="button" onClick={onHome} className="rounded-2xl bg-white p-2 shadow-lg tap-scale">
              <LogoHeader height={32} />
            </button>
            <div className="text-right">
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/55">Directory listing</div>
              <div className="text-sm font-extrabold font-display">Register your business</div>
            </div>
          </header>

          <div className="rounded-[1.75rem] bg-white text-navy shadow-2xl border border-white/40">
            <div className="px-4 sm:px-8 pt-6 pb-4 border-b border-navy/5">
              <ProgressBar step={step} />
              <div className="mt-2 flex items-center justify-between min-h-[1.25rem]">
                <span className="text-[11px] text-slate-400">
                  {saving ? 'Saving…' : saveMsg ? saveMsg : 'Autosave enabled'}
                </span>
                {recordId && (
                  <span className="text-[10px] font-mono text-slate-300 truncate max-w-[40%]">ID {recordId.slice(0, 8)}</span>
                )}
              </div>
            </div>

            <form onSubmit={onSubmit} className="px-4 sm:px-8 py-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                >
                  {step === 1 && <StepBusinessInfo {...stepProps} />}
                  {step === 2 && <StepOwnerInfo {...stepProps} />}
                  {step === 3 && <StepAddress {...stepProps} />}
                  {step === 4 && <StepHours {...stepProps} />}
                  {step === 5 && <StepOnlinePresence {...stepProps} />}
                  {step === 6 && <StepPhotos {...stepProps} draftToken={draftToken} />}
                  {step === 7 && <StepCommercial {...stepProps} />}
                  {step === 8 && <StepAdvanced {...stepProps} />}
                  {step === 9 && <StepPartnership {...stepProps} />}
                </motion.div>
              </AnimatePresence>

              {error && (
                <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700" role="alert">
                  {error}
                </div>
              )}

              <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3 sm:items-center sm:justify-between">
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" onClick={goPrev} disabled={step === 1 || saving}>
                    Previous
                  </Button>
                  <Button type="button" variant="ghost" onClick={saveDraft} disabled={saving}>
                    Save draft
                  </Button>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  {step < TOTAL_STEPS ? (
                    <Button type="button" variant="primary" onClick={goNext} disabled={saving} className="flex-1 sm:flex-none min-w-[140px]">
                      Next
                    </Button>
                  ) : (
                    <Button type="submit" variant="crimson" disabled={saving} className="flex-1 sm:flex-none min-w-[160px]">
                      Submit for review
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </div>

          <p className="text-center text-[11px] text-white/45 mt-5 leading-relaxed max-w-md mx-auto">
            Submissions are never published automatically. An administrator must set status to{' '}
            <strong className="text-white/70">approved</strong> before your business appears in the guide.
          </p>
        </div>
      </div>
    </FormProvider>
  );
}

import { type ReactNode, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../../utils/cn';

export function Field({
  label,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] font-bold uppercase tracking-wide text-navy/55">
        {label}
        {required && <span className="text-crimson ml-0.5">*</span>}
      </span>
      {children}
      {hint && !error && <span className="block text-[11px] text-slate-400">{hint}</span>}
      {error && <span className="block text-xs text-crimson font-medium" role="alert">{error}</span>}
    </label>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full rounded-xl border border-navy/10 bg-white px-3.5 py-3 text-sm text-navy outline-none transition',
          'placeholder:text-slate-400 focus:border-navy/40 focus:ring-2 focus:ring-navy/10',
          className
        )}
        {...props}
      />
    );
  }
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          'w-full min-h-[108px] rounded-xl border border-navy/10 bg-white px-3.5 py-3 text-sm text-navy outline-none transition resize-y',
          'placeholder:text-slate-400 focus:border-navy/40 focus:ring-2 focus:ring-navy/10',
          className
        )}
        {...props}
      />
    );
  }
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={cn(
          'w-full rounded-xl border border-navy/10 bg-white px-3.5 py-3 text-sm text-navy outline-none transition appearance-none',
          'focus:border-navy/40 focus:ring-2 focus:ring-navy/10',
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);

export function CheckboxCard({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        'w-full text-left rounded-xl border px-3.5 py-3 transition tap-scale',
        checked
          ? 'border-crimson/40 bg-crimson/[0.06] shadow-sm'
          : 'border-navy/10 bg-white hover:border-navy/20'
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[11px] font-bold',
            checked ? 'border-crimson bg-crimson text-white' : 'border-navy/20 text-transparent'
          )}
        >
          ✓
        </span>
        <span>
          <span className="block text-sm font-semibold text-navy">{label}</span>
          {description && <span className="block text-xs text-slate-500 mt-0.5">{description}</span>}
        </span>
      </div>
    </button>
  );
}

export function ChipToggle({
  selected,
  onToggle,
  label,
}: {
  selected: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition',
        selected ? 'chip-active' : 'bg-navy/[0.05] text-slate-600 hover:bg-navy/[0.08]'
      )}
    >
      {label}
    </button>
  );
}

export function Button({
  children,
  variant = 'primary',
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'crimson';
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none font-display',
        variant === 'primary' && 'btn-navy text-white',
        variant === 'crimson' && 'btn-crimson text-white',
        variant === 'secondary' && 'bg-navy/[0.06] text-navy hover:bg-navy/[0.1]',
        variant === 'ghost' && 'bg-transparent text-slate-500 hover:text-navy',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

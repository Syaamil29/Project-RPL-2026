import { InputHTMLAttributes, ReactNode } from "react";

export const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-[#2D24B5] focus:outline-none focus:ring-2 focus:ring-[#2D24B5]/20";

export const labelClass = "mb-1.5 block text-sm font-semibold text-slate-800";

export const hintClass = "mt-1 text-xs text-slate-500";

export const errorClass = "mt-1.5 text-xs font-medium text-red-600";

export const choiceCardClass =
  "flex cursor-pointer items-start gap-3 rounded-xl border-2 border-slate-200 bg-white p-4 shadow-sm transition hover:border-[#2D24B5]/40 has-[:checked]:border-[#2D24B5] has-[:checked]:bg-[#2D24B5]/5";

export const fileInputClass =
  "w-full rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-full file:border-0 file:bg-[#2D24B5] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#20188A]";

export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-5 border-t border-slate-200 pt-8 first:border-t-0 first:pt-0">
      <div>
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

export function FormField({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {hint && <p className={`-mt-1 mb-2 ${hintClass}`}>{hint}</p>}
      {children}
      {error && <p className={errorClass}>{error}</p>}
    </div>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className={errorClass}>{message}</p>;
}

export function ChoiceCard({
  children,
  description,
  className = "",
  ...inputProps
}: {
  children: ReactNode;
  description?: string;
  className?: string;
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`${choiceCardClass} ${className}`}>
      <input type="radio" className="mt-0.5 h-4 w-4 shrink-0 accent-[#2D24B5]" {...inputProps} />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-slate-900">{children}</span>
        {description && <span className="mt-0.5 block text-xs text-slate-600">{description}</span>}
      </span>
    </label>
  );
}

export function ChoiceGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>;
}

export function ChoiceList({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-3">{children}</div>;
}

export function FileUpload({
  label,
  hint,
  error,
  onChange,
  accept = ".pdf,.doc,.docx",
}: {
  label: string;
  hint?: string;
  error?: string;
  onChange: (files: FileList | null) => void;
  accept?: string;
}) {
  return (
    <FormField label={label} hint={hint ?? "Format PDF, DOC, atau DOCX — maks. 10 MB"} error={error}>
      <input
        type="file"
        accept={accept}
        onChange={(e) => onChange(e.target.files)}
        className={fileInputClass}
      />
    </FormField>
  );
}

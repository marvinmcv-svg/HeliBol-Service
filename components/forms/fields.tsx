"use client";
import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const base =
  "peer w-full rounded-2xl border border-line bg-white px-4 pt-6 pb-2.5 text-base text-ink outline-none transition-colors placeholder:text-transparent focus:border-hb-blue aria-invalid:border-hb-rescue";

type FieldProps = { label: string; error?: string; className?: string };

/** Floating-label input. */
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & FieldProps>(
  function Input({ label, error, className, id, ...props }, ref) {
    const fid = id ?? props.name;
    return (
      <div className={cn("relative", className)}>
        <input
          ref={ref}
          id={fid}
          placeholder={label}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${fid}-err` : undefined}
          className={base}
          {...props}
        />
        <label
          htmlFor={fid}
          className="pointer-events-none absolute top-2 left-4 text-xs text-ink-soft transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs"
        >
          {label}
        </label>
        {error && (
          <p id={`${fid}-err`} className="mt-1.5 pl-1 text-sm text-hb-rescue">
            {error}
          </p>
        )}
      </div>
    );
  },
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps
>(function Textarea({ label, error, className, id, ...props }, ref) {
  const fid = id ?? props.name;
  return (
    <div className={cn("relative", className)}>
      <textarea
        ref={ref}
        id={fid}
        placeholder={label}
        rows={4}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fid}-err` : undefined}
        className={cn(base, "resize-y")}
        {...props}
      />
      <label
        htmlFor={fid}
        className="pointer-events-none absolute top-2 left-4 text-xs text-ink-soft transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs"
      >
        {label}
      </label>
      {error && (
        <p id={`${fid}-err`} className="mt-1.5 pl-1 text-sm text-hb-rescue">
          {error}
        </p>
      )}
    </div>
  );
});

/** Off-screen honeypot — bots fill it, people never see it. */
export function Honeypot(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        Website
        <input tabIndex={-1} autoComplete="off" {...props} />
      </label>
    </div>
  );
}

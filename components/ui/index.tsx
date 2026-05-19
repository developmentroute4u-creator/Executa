"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
  asChild?: boolean;
  href?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, href, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none select-none rounded";

    const variants = {
      primary: "bg-accent text-white hover:bg-accent-hover active:scale-[0.98] shadow-sm",
      secondary: "bg-surface border border-border text-text-primary hover:bg-stone-200 active:scale-[0.98]",
      ghost: "text-text-secondary hover:text-text-primary hover:bg-surface",
      outline: "border border-border text-text-primary hover:border-border-strong hover:bg-surface",
      danger: "bg-error text-white hover:bg-red-700 active:scale-[0.98]",
    };

    const sizes = {
      sm: "text-xs px-3.5 py-1.5",
      md: "text-sm px-5 py-2.5",
      lg: "text-base px-7 py-3.5",
      icon: "w-9 h-9 p-0",
    };

    const classes = cn(base, variants[variant], sizes[size], className);

    if (href) {
      return (
        <Link href={href} className={classes}>
          {children}
        </Link>
      );
    }

    return (
      <button ref={ref} className={classes} disabled={disabled || loading} {...props}>
        {loading ? (
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

// Badge component
interface BadgeProps {
  variant?: "blue" | "green" | "amber" | "red" | "stone" | "purple";
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "stone", children, className }: BadgeProps) {
  const variants = {
    blue: "bg-accent-muted text-accent",
    green: "bg-success-muted text-success",
    amber: "bg-warning-muted text-warning",
    red: "bg-error-muted text-error",
    stone: "bg-stone-100 text-stone-600",
    purple: "bg-purple-100 text-purple-700",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium", variants[variant], className)}>
      {children}
    </span>
  );
}

// Card component
export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("bg-white border border-border rounded-xl shadow-sm", className)} {...props}>
      {children}
    </div>
  );
}

// Input component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, "-");
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-text-primary mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded border bg-white px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent hover:border-border-strong",
            error ? "border-error focus:ring-error/20 focus:border-error" : "border-border",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-error mt-1">{error}</p>}
        {hint && !error && <p className="text-xs text-text-secondary mt-1">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

// Textarea
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, "-");
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-text-primary mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded border bg-white px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent hover:border-border-strong resize-none leading-relaxed",
            error ? "border-error" : "border-border",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-error mt-1">{error}</p>}
        {hint && !error && <p className="text-xs text-text-secondary mt-1">{hint}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

// Select component
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, "-");
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-text-primary mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded border bg-white px-4 py-2.5 text-sm text-text-primary transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent hover:border-border-strong appearance-none cursor-pointer",
            error ? "border-error" : "border-border",
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-error mt-1">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";

// Divider
export function Divider({ className }: { className?: string }) {
  return <hr className={cn("border-t border-border", className)} />;
}

// Score Bar
export function ScoreBar({ score, max = 10, label }: { score: number; max?: number; label: string }) {
  const pct = Math.round((score / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-secondary">{label}</span>
        <span className="font-medium text-text-primary tabular-nums">{score}/{max}</span>
      </div>
      <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// Level Badge
export function LevelBadge({ level }: { level: 1 | 2 | 3 }) {
  const map = {
    1: { label: "L1 · Executor", color: "bg-stone-100 text-stone-600 border-stone-200" },
    2: { label: "L2 · Independent", color: "bg-accent-muted text-accent border-accent/20" },
    3: { label: "L3 · Systems Thinker", color: "bg-purple-100 text-purple-700 border-purple-200" },
  };
  const { label, color } = map[level];
  return (
    <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border", color)}>
      {label}
    </span>
  );
}

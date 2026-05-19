import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
}

export function getLevelLabel(level: number) {
  switch (level) {
    case 1: return "Executor";
    case 2: return "Independent";
    case 3: return "Systems Thinker";
    default: return "Unknown";
  }
}

export function getEffortLevel(score: number): 1 | 2 | 3 {
  if (score < 100) return 1;
  if (score < 220) return 2;
  return 3;
}

export function getRateRange(field: string, level: 1 | 2 | 3): { min: number; max: number } {
  const rates: Record<string, Record<number, { min: number; max: number }>> = {
    development: {
      1: { min: 120, max: 160 },
      2: { min: 160, max: 240 },
      3: { min: 240, max: 350 },
    },
    design: {
      1: { min: 100, max: 140 },
      2: { min: 140, max: 210 },
      3: { min: 210, max: 320 },
    },
  };
  return rates[field]?.[level] ?? { min: 100, max: 200 };
}

export function calculatePrice(
  effortScore: number,
  ratePerPoint: number
): {
  freelancerPrice: number;
  scopeFee: number;
  accountabilityFee: number;
  executionFee: number;
  total: number;
} {
  const freelancerPrice = effortScore * ratePerPoint;
  const scopeFee = 999;
  const accountabilityFee = 599;
  const executionFee = Math.round(freelancerPrice * 0.05);
  const total = freelancerPrice + scopeFee + accountabilityFee + executionFee;
  return { freelancerPrice, scopeFee, accountabilityFee, executionFee, total };
}

export function assignLevel(totalScore: number): 1 | 2 | 3 {
  if (totalScore <= 30) return 1;
  if (totalScore <= 40) return 2;
  return 3;
}

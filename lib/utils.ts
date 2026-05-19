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
  const scopeFee = 299; // Updated from 999 to align perfectly with the ₹99 – ₹499 range in the PDF
  const accountabilityFee = 599; // Within the ₹299 – ₹999 range in the PDF
  const executionFee = Math.round(freelancerPrice * 0.05); // Standard 5%
  const total = freelancerPrice + scopeFee + accountabilityFee + executionFee;
  return { freelancerPrice, scopeFee, accountabilityFee, executionFee, total };
}

export function calculateRatePerPoint(
  level: 1 | 2 | 3,
  testScore: number,
  field: string = "development"
): number {
  const range = getRateRange(field, level);
  
  // Generous reward formula to "increase pricing a bit, making it fair for the freelancer":
  // We guarantee a baseline of at least 50% of the rate band (ratio = 0.5 + 0.5 * (testScore / 50)).
  // This scales from mid-band to the maximum rate based on their vetting test score out of 50.
  const scoreRatio = Math.min(50, Math.max(0, testScore)) / 50;
  const generousRatio = 0.5 + 0.5 * scoreRatio;
  
  return range.min + Math.round((range.max - range.min) * generousRatio);
}

export function assignLevel(totalScore: number): 1 | 2 | 3 {
  if (totalScore <= 30) return 1;
  if (totalScore <= 40) return 2;
  return 3;
}

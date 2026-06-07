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
  if (score <= 100) return 1;
  if (score <= 220) return 2;
  return 3;
}

export function getRateRange(field: string, level: 1 | 2 | 3): { min: number; max: number } {
  // Market-aligned rates per effort point (in INR)
  const rates: Record<string, Record<number, { min: number; max: number }>> = {
    development: {
      1: { min: 180, max: 240 },
      2: { min: 260, max: 360 },
      3: { min: 380, max: 520 },
    },
    design: {
      1: { min: 150, max: 210 },
      2: { min: 220, max: 310 },
      3: { min: 320, max: 460 },
    },
    design_development: {
      1: { min: 200, max: 270 },
      2: { min: 290, max: 400 },
      3: { min: 420, max: 580 },
    },
  };
  return rates[field]?.[level] ?? { min: 200, max: 320 };
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
  // 30% uplift applied to reflect fair market pricing and effort quality.
  const freelancerPrice = Math.round(effortScore * ratePerPoint * 1.30);

  const scopeFee = 99;           // Fixed platform scope fee
  const accountabilityFee = 199; // Fixed platform accountability fee
  const executionFee = Math.round(freelancerPrice * 0.05); // 5% of freelancer price

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

export function getRemainingTimeDetails(dueDateStr: string | Date): {
  formattedDate: string;
  isOverdue: boolean;
  diffDays: number;
  remainingText: string;
} {
  const dDate = new Date(dueDateStr);
  const dueDate = new Date(dDate.getFullYear(), dDate.getMonth(), dDate.getDate());
  
  const formattedDate = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(dueDate);

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const diffTime = dueDate.getTime() - now.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return {
      formattedDate,
      isOverdue: false,
      diffDays,
      remainingText: "Due today"
    };
  }

  const isOverdue = diffDays < 0;
  
  // Calculate breakdown of years, months, and days
  let start = isOverdue ? dueDate : now;
  let end = isOverdue ? now : dueDate;

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  if (days < 0) {
    months -= 1;
    // Get number of days in the start month
    const previousMonth = new Date(end.getFullYear(), end.getMonth(), 0);
    days += previousMonth.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const parts = [];
  if (years > 0) {
    parts.push(`${years} year${years > 1 ? "s" : ""}`);
  }
  if (months > 0) {
    parts.push(`${months} month${months > 1 ? "s" : ""}`);
  }
  if (days > 0 || parts.length === 0) {
    parts.push(`${days} day${days > 1 ? "s" : ""}`);
  }

  const breakdown = parts.join(", ");
  const remainingText = `${breakdown} ${isOverdue ? "overdue" : "remaining"}`;

  return {
    formattedDate,
    isOverdue,
    diffDays,
    remainingText
  };
}


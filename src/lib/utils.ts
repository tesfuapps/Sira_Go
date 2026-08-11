import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isJobExpired(deadline: string): boolean {
  const deadlineDate = new Date(deadline);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return deadlineDate < today;
}

export function parseSalary(salary: string | undefined): number | null {
  if (!salary) return null;
  const match = salary.match(/([\d,]+)/);
  if (!match) return null;
  return parseFloat(match[1].replace(/,/g, ''));
}

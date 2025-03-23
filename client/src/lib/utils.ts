import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateMedicationStatus(count: number, frequency: number) {
  if (frequency === 0) return { daysLeft: Infinity, status: 'good' };
  
  const daysLeft = count / frequency;
  
  let status = 'good';
  if (daysLeft <= 3) {
    status = 'urgent';
  } else if (daysLeft <= 7) {
    status = 'warning';
  }
  
  return { daysLeft, status };
}

export function getReorderDate(daysLeft: number) {
  if (daysLeft === Infinity) return 'N/A';
  
  const today = new Date();
  const reorderDate = new Date(today);
  reorderDate.setDate(today.getDate() + Math.floor(daysLeft));
  
  return reorderDate.toLocaleDateString('de-DE');
}

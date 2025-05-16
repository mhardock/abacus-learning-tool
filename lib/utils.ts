import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate a unique worksheet ID
export function generateWorksheetId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Omitted similar characters like O/0, I/1
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

// Format current date as MM/DD/YYYY
export function getFormattedDate(): string {
  const now = new Date();
  return `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`;
}

// LocalStorage helpers
export function loadFromLocalStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  const item = localStorage.getItem(key);
  if (item) {
    try {
      return JSON.parse(item);
    } catch {
      return fallback;
    }
  }
  return fallback;
}

export function saveToLocalStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

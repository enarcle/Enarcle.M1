import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge Tailwind classes safely — deduplication + clsx conditional support */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format cents to a USD currency string */
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style:    'currency',
    currency: 'USD',
  }).format(cents / 100)
}

/** Format a date/timestamp to a human-readable short form */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month:   'short',
    day:     'numeric',
    hour:    'numeric',
    minute:  '2-digit',
    hour12:  true,
  }).format(new Date(date))
}

/** Format a date to a long-form display (e.g. "Thursday, June 12, 2025") */
export function formatDateLong(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month:   'long',
    day:     'numeric',
    year:    'numeric',
  }).format(new Date(date))
}

/** Returns true if the event is currently live */
export function isEventLive(event: { status: string; start_time: string }): boolean {
  return event.status === 'live'
}

/** Return the first 2 uppercase initials from a full name */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/** Truncate a string with an ellipsis if it exceeds maxLength */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 1) + '…'
}

/** Pluralise a word based on count */
export function pluralise(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`)
}

/** Sleep for N milliseconds (useful in async flows) */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

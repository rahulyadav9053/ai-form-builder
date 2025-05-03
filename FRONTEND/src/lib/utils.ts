
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a duration given in seconds into a human-readable string.
 * e.g., 90 seconds -> "1m 30s", 3665 seconds -> "1h 1m 5s"
 * @param totalSeconds The total duration in seconds.
 * @returns A formatted string representing the duration, or '0s' if input is invalid.
 */
export function formatDuration(totalSeconds: number | null | undefined): string {
  if (totalSeconds === null || totalSeconds === undefined || totalSeconds < 0 || !Number.isFinite(totalSeconds)) {
    return 'N/A'; // Return Not Applicable for invalid inputs
  }
  if (totalSeconds === 0) {
    return '0s';
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.round(totalSeconds % 60); // Round seconds

  let result = '';
  if (hours > 0) {
    result += `${hours}h `;
  }
  if (minutes > 0) {
    result += `${minutes}m `;
  }
  // Only show seconds if less than a minute or if there are remaining seconds
  if (seconds > 0 || result === '') {
    result += `${seconds}s`;
  }

  return result.trim(); // Trim trailing space if only hours/minutes are present
}

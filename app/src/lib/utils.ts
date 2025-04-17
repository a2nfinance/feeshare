import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function shortenAddress(address: string, start = 6, end = 4): string {
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}


export async function copyToClipboard(text: string) {
  if (navigator?.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }
  throw new Error("Clipboard not supported");
}
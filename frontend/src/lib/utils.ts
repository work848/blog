import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { BACKEND_BASE_URL } from "@/api/client"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function resolveImageUrl(src?: string): string | undefined {
  if (!src) return src;
  if (/^https?:\/\//i.test(src) || src.startsWith('data:')) return src;
  return `${BACKEND_BASE_URL}${src.startsWith('/') ? '' : '/'}${src}`;
}

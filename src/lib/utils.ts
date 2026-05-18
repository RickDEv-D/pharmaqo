import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function generateUID(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'PQ-'
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) result += '-'
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export const FREIGHT_TABLE: Record<string, { price: number; days: number }> = {
  SP: { price: 50, days: 3 },
  RJ: { price: 50, days: 4 },
  ES: { price: 50, days: 5 },
  MG: { price: 50, days: 5 },
  DF: { price: 50, days: 5 },
  SC: { price: 50, days: 5 },
  PR: { price: 50, days: 5 },
  RS: { price: 50, days: 5 },
  SE: { price: 60, days: 7 },
  AL: { price: 60, days: 7 },
  BA: { price: 60, days: 7 },
  PB: { price: 60, days: 7 },
  CE: { price: 60, days: 7 },
  PI: { price: 60, days: 8 },
  PA: { price: 60, days: 8 },
  GO: { price: 60, days: 6 },
  TO: { price: 60, days: 8 },
  MS: { price: 60, days: 6 },
  RN: { price: 70, days: 8 },
  MA: { price: 70, days: 9 },
  MT: { price: 70, days: 7 },
  PE: { price: 80, days: 8 },
  AM: { price: 80, days: 10 },
  AP: { price: 90, days: 12 },
  AC: { price: 90, days: 12 },
  RO: { price: 80, days: 10 },
  RR: { price: 90, days: 12 },
}

export const PRODUCT_TAGS = [
  'NOVO',
  'MAIS VENDIDO',
  'COMBO',
  'OFERTA',
  'LANÇAMENTO',
  'LIMITADO',
] as const

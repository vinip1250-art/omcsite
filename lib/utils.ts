import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR').format(d)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value)
}

export function calculateFinalCost(params: {
  paidValue: number
  advanceDiscount: number
  cashback: number
  points: number
  thousand: number
}): number {
  const { paidValue, advanceDiscount, cashback, points, thousand } = params
  const pointsValue = (points * thousand) / 1000
  return paidValue - advanceDiscount - cashback - pointsValue
}

export function calculateProfit(soldValue: number, finalCost: number): number {
  return soldValue - finalCost
}

export function getMonthCode(date: Date): string {
  const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']
  const year = date.getFullYear().toString().slice(-2)
  return `${months[date.getMonth()]}${year}`
}

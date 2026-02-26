import { useAuthStore } from '@/stores/auth-store';

const currencyFormatters = new Map<string, Intl.NumberFormat>();

function getFormatter(currency: string): Intl.NumberFormat {
  if (!currencyFormatters.has(currency)) {
    currencyFormatters.set(
      currency,
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }
  return currencyFormatters.get(currency)!;
}

export function formatCurrency(amount: number, currency?: string): string {
  const cur = currency || useAuthStore.getState().currency || 'USD';
  try {
    return getFormatter(cur).format(amount);
  } catch {
    return getFormatter('USD').format(amount);
  }
}

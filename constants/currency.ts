import { Currency, CurrencyType } from '@/types';

export const CURRENCIES = Object.keys(Currency);

export const DEFAULT_CURRENCY_KEY: CurrencyType = 'USD';

export const DEFAULT_CURRENCY = CURRENCIES.find(
  (key) => key === DEFAULT_CURRENCY_KEY,
) as CurrencyType;

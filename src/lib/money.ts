/** Currencies shown first in the picker. */
export const FEATURED_CURRENCIES = ['TND', 'USD', 'EUR', 'DZD']

/** Number of decimal places (minor units) a currency uses, e.g. USD → 2, JPY → 0, KWD → 3. */
export function minorDigits(currency: string): number {
  try {
    return new Intl.NumberFormat('en', { style: 'currency', currency }).resolvedOptions()
      .maximumFractionDigits ?? 2
  } catch {
    return 2
  }
}

/** Every ISO currency code the browser knows, featured ones first. */
export function allCurrencies(): string[] {
  let codes: string[] = []
  try {
    codes = Intl.supportedValuesOf('currency')
  } catch {
    codes = []
  }
  // X-codes are mostly special units (gold, SDR…); keep only the real regional currencies
  const realX = ['XAF', 'XOF', 'XPF', 'XCD']
  const rest = codes.filter((c) => !FEATURED_CURRENCIES.includes(c) && (!c.startsWith('X') || realX.includes(c)))
  return [...FEATURED_CURRENCIES, ...rest]
}

/** Short symbol for a currency, e.g. USD → "$", EUR → "€", DZD → "DZD". */
export function currencySymbol(code: string, locale: string): string {
  try {
    return (
      new Intl.NumberFormat(locale, { style: 'currency', currency: code, currencyDisplay: 'narrowSymbol' })
        .formatToParts(0)
        .find((p) => p.type === 'currency')?.value ?? code
    )
  } catch {
    return code
  }
}

export function currencyName(code: string, locale: string): string {
  try {
    return new Intl.DisplayNames([locale], { type: 'currency' }).of(code) ?? code
  } catch {
    return code
  }
}

/**
 * Parses a typed amount ("1234.5", "1 234,50") into integer minor units without
 * going through floating point. Returns null when the text is not a valid amount.
 */
export function parseAmount(text: string, digits: number): number | null {
  const clean = text.replace(/[\s  ]/g, '').replace(',', '.')
  if (clean === '') return null
  const match = /^(\d*)(?:\.(\d*))?$/.exec(clean)
  if (!match || (match[1] === '' && !match[2])) return null
  const whole = match[1] || '0'
  const frac = match[2] ?? ''
  if (frac.length > digits) return null
  return Number(whole + frac.padEnd(digits, '0'))
}

/** Parses a plain decimal number typed with either "." or "," as separator. */
export function parseNumber(text: string): number | null {
  const clean = text.replace(/[\s  ]/g, '').replace(',', '.')
  if (clean === '' || !/^\d*\.?\d*$/.test(clean) || clean === '.') return null
  return Number(clean)
}

export function formatMoney(minor: number, currency: string, locale: string): string {
  const digits = minorDigits(currency)
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(minor / 10 ** digits)
  } catch {
    return (minor / 10 ** digits).toFixed(digits) + ' ' + currency
  }
}

/** Formats an exact (unrounded) share with extra precision, e.g. "$33.3333". */
export function formatExact(minorExact: number, currency: string, locale: string): string {
  const digits = minorDigits(currency)
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: digits + 2,
      maximumFractionDigits: digits + 4,
    }).format(minorExact / 10 ** digits)
  } catch {
    return (minorExact / 10 ** digits).toFixed(digits + 4) + ' ' + currency
  }
}

// Currency formatting utilities
export function formatCurrency(
  amount: number,
  currencyCode: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
}

// Date formatting utilities
export function formatDate(
  date: Date | string,
  format: string = 'short',
  locale: string = 'en-US'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const options: Intl.DateTimeFormatOptions = ({
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit' },
    datetime: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  }[format] as Intl.DateTimeFormatOptions) || {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  return new Intl.DateTimeFormat(locale, options).format(dateObj);
}

// Unit conversion utilities
export function convertUnit(
  value: number,
  fromUnit: string,
  toUnit: string,
  conversionTable: Record<string, number>
): number {
  if (fromUnit === toUnit) return value;

  const fromMultiplier = conversionTable[fromUnit];
  const toMultiplier = conversionTable[toUnit];

  if (!fromMultiplier || !toMultiplier) {
    throw new Error(`Conversion not supported: ${fromUnit} to ${toUnit}`);
  }

  // Convert to base unit first, then to target unit
  const baseValue = value * fromMultiplier;
  return baseValue / toMultiplier;
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidUuid(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// String utilities
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export function truncate(
  text: string,
  length: number,
  suffix: string = '...'
): string {
  if (text.length <= length) return text;
  return text.substring(0, length - suffix.length) + suffix;
}

// Array utilities
export function groupBy<T, K extends string | number>(
  array: T[],
  key: keyof T | ((item: T) => K)
): Record<K, T[]> {
  return array.reduce(
    (groups, item) => {
      const groupKey = typeof key === 'function' ? key(item) : (item[key] as K);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
      return groups;
    },
    {} as Record<K, T[]>
  );
}

export function uniqueBy<T, K>(
  array: T[],
  key: keyof T | ((item: T) => K)
): T[] {
  const seen = new Set<K>();
  return array.filter(item => {
    const keyValue = typeof key === 'function' ? key(item) : (item[key] as K);
    if (seen.has(keyValue)) {
      return false;
    }
    seen.add(keyValue);
    return true;
  });
}

// Object utilities
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

export function omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  keys.forEach(key => {
    delete result[key];
  });
  return result;
}

// Error handling utilities
export function createErrorResponse(
  message: string,
  status: number = 400,
  code?: string
): { error: string; status: number; code?: string } {
  return {
    error: message,
    status,
    ...(code && { code }),
  };
}

// Async utilities
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt === maxAttempts) {
        throw lastError;
      }
      await sleep(delay * attempt);
    }
  }

  throw lastError!;
}

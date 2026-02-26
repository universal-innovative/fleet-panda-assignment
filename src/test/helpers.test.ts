import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatDate,
  formatTime,
  formatDateTime,
  getToday,
  getRelativeTime,
  formatQuantity,
  formatLiters,
  getInventoryLevel,
  validatePhone,
  validateLicense,
  validateRegistration,
  cn,
  debounce,
  PRODUCT_LABELS,
  STATUS_LABELS,
  STATUS_COLORS,
  PRODUCTS,
} from '../utils/helpers';

// ─── formatDate ───────────────────────────────────────────────────

describe('formatDate', () => {
  it('formats ISO date string to readable format', () => {
    const result = formatDate('2025-11-24T10:30:00Z');
    expect(result).toContain('Nov');
    expect(result).toContain('24');
    expect(result).toContain('2025');
  });

  it('handles different dates correctly', () => {
    const result = formatDate('2025-01-01T00:00:00Z');
    expect(result).toContain('Jan');
    expect(result).toContain('2025');
  });
});

// ─── formatTime ───────────────────────────────────────────────────

describe('formatTime', () => {
  it('formats ISO date string to time string', () => {
    const result = formatTime('2025-11-24T10:30:00Z');
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });
});

// ─── formatDateTime ──────────────────────────────────────────────

describe('formatDateTime', () => {
  it('combines date and time', () => {
    const result = formatDateTime('2025-11-24T10:30:00Z');
    expect(result).toContain('Nov');
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });
});

// ─── getToday ────────────────────────────────────────────────────

describe('getToday', () => {
  it('returns date in YYYY-MM-DD format', () => {
    const today = getToday();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('returns current date', () => {
    const today = getToday();
    const expected = new Date().toISOString().split('T')[0];
    expect(today).toBe(expected);
  });
});

// ─── getRelativeTime ─────────────────────────────────────────────

describe('getRelativeTime', () => {
  it('returns "Just now" for very recent timestamps', () => {
    const now = new Date().toISOString();
    expect(getRelativeTime(now)).toBe('Just now');
  });

  it('returns minutes ago for recent timestamps', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60000).toISOString();
    expect(getRelativeTime(fiveMinAgo)).toBe('5m ago');
  });

  it('returns hours ago for older timestamps', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 3600000).toISOString();
    expect(getRelativeTime(twoHoursAgo)).toBe('2h ago');
  });

  it('returns days ago for very old timestamps', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString();
    expect(getRelativeTime(threeDaysAgo)).toBe('3d ago');
  });
});

// ─── formatQuantity ──────────────────────────────────────────────

describe('formatQuantity', () => {
  it('returns number as-is for values under 1000', () => {
    expect(formatQuantity(500)).toBe('500');
    expect(formatQuantity(0)).toBe('0');
    expect(formatQuantity(999)).toBe('999');
  });

  it('formats to K for values 1000+', () => {
    expect(formatQuantity(1000)).toBe('1.0K');
    expect(formatQuantity(5500)).toBe('5.5K');
    expect(formatQuantity(45000)).toBe('45.0K');
  });
});

// ─── formatLiters ────────────────────────────────────────────────

describe('formatLiters', () => {
  it('formats with locale string and L suffix', () => {
    expect(formatLiters(5000)).toMatch(/5.*000 L/);
    expect(formatLiters(0)).toBe('0 L');
  });
});

// ─── getInventoryLevel ───────────────────────────────────────────

describe('getInventoryLevel', () => {
  it('returns "critical" for quantities <= 1000', () => {
    expect(getInventoryLevel(0)).toBe('critical');
    expect(getInventoryLevel(500)).toBe('critical');
    expect(getInventoryLevel(1000)).toBe('critical');
  });

  it('returns "low" for quantities <= 3000', () => {
    expect(getInventoryLevel(1001)).toBe('low');
    expect(getInventoryLevel(2000)).toBe('low');
    expect(getInventoryLevel(3000)).toBe('low');
  });

  it('returns "normal" for quantities <= 10000', () => {
    expect(getInventoryLevel(3001)).toBe('normal');
    expect(getInventoryLevel(5000)).toBe('normal');
    expect(getInventoryLevel(10000)).toBe('normal');
  });

  it('returns "high" for quantities > 10000', () => {
    expect(getInventoryLevel(10001)).toBe('high');
    expect(getInventoryLevel(50000)).toBe('high');
  });
});

// ─── validatePhone ───────────────────────────────────────────────

describe('validatePhone', () => {
  it('validates correct phone numbers', () => {
    expect(validatePhone('+1-555-0100')).toBe(true);
    expect(validatePhone('+91 98765 43210')).toBe(true);
    expect(validatePhone('(555) 123-4567')).toBe(true);
    expect(validatePhone('5551234567')).toBe(true);
  });

  it('rejects invalid phone numbers', () => {
    expect(validatePhone('abc')).toBe(false);
    expect(validatePhone('123')).toBe(false);
    expect(validatePhone('')).toBe(false);
  });
});

// ─── validateLicense ─────────────────────────────────────────────

describe('validateLicense', () => {
  it('validates correct license formats', () => {
    expect(validateLicense('DL-123456')).toBe(true);
    expect(validateLicense('AB-9999')).toBe(true);
  });

  it('rejects invalid license formats', () => {
    expect(validateLicense('dl-123456')).toBe(false);
    expect(validateLicense('DL123456')).toBe(false);
    expect(validateLicense('D-123456')).toBe(false);
    expect(validateLicense('')).toBe(false);
  });
});

// ─── validateRegistration ────────────────────────────────────────

describe('validateRegistration', () => {
  it('validates correct registration formats', () => {
    expect(validateRegistration('TRK-101')).toBe(true);
    expect(validateRegistration('VAN-44')).toBe(true);
  });

  it('rejects invalid registration formats', () => {
    expect(validateRegistration('trk-101')).toBe(false);
    expect(validateRegistration('T-1')).toBe(false);
    expect(validateRegistration('')).toBe(false);
  });
});

// ─── cn (classname utility) ─────────────────────────────────────

describe('cn', () => {
  it('joins class strings', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('filters out falsy values', () => {
    expect(cn('foo', false, 'bar', undefined, null)).toBe('foo bar');
  });

  it('returns empty string for no valid classes', () => {
    expect(cn(false, undefined, null)).toBe('');
  });
});

// ─── debounce ────────────────────────────────────────────────────

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('delays function execution', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced();
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledOnce();
  });

  it('resets timer on subsequent calls', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced();
    vi.advanceTimersByTime(200);
    debounced(); // reset timer
    vi.advanceTimersByTime(200);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledOnce();
  });
});

// ─── Constants ───────────────────────────────────────────────────

describe('Constants', () => {
  it('PRODUCTS contains all product types', () => {
    expect(PRODUCTS).toEqual(['diesel', 'petrol', 'kerosene', 'lpg']);
  });

  it('PRODUCT_LABELS maps all products', () => {
    expect(PRODUCT_LABELS.diesel).toBe('Diesel');
    expect(PRODUCT_LABELS.petrol).toBe('Petrol');
    expect(PRODUCT_LABELS.kerosene).toBe('Kerosene');
    expect(PRODUCT_LABELS.lpg).toBe('LPG');
  });

  it('STATUS_LABELS maps all statuses', () => {
    expect(STATUS_LABELS.pending).toBe('Pending');
    expect(STATUS_LABELS.assigned).toBe('Assigned');
    expect(STATUS_LABELS['in-transit']).toBe('In Transit');
    expect(STATUS_LABELS.delivered).toBe('Delivered');
    expect(STATUS_LABELS.failed).toBe('Failed');
  });

  it('STATUS_COLORS has bg, text, dot for each status', () => {
    const statuses = ['pending', 'assigned', 'in-transit', 'delivered', 'failed'] as const;
    statuses.forEach((status) => {
      expect(STATUS_COLORS[status]).toHaveProperty('bg');
      expect(STATUS_COLORS[status]).toHaveProperty('text');
      expect(STATUS_COLORS[status]).toHaveProperty('dot');
    });
  });
});

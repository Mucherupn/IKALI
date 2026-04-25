const FULL_NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function collapseSpaces(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

export function normalizeName(value: string) {
  return collapseSpaces(value);
}

export function isValidFullName(value: string) {
  const normalized = normalizeName(value);
  if (normalized.length < 3) return false;
  if (!/[A-Za-zÀ-ÖØ-öø-ÿ]/.test(normalized)) return false;
  return FULL_NAME_REGEX.test(normalized);
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: string) {
  const normalized = normalizeEmail(value);
  return EMAIL_REGEX.test(normalized);
}

export function normalizeKenyanPhone(value: string): string | null {
  const compact = value.replace(/\s+/g, '').trim();
  if (!compact) return null;

  if (/^07\d{8}$/.test(compact)) return `254${compact.slice(1)}`;
  if (/^01\d{8}$/.test(compact)) return `254${compact.slice(1)}`;
  if (/^\+254(7|1)\d{8}$/.test(compact)) return compact.slice(1);
  if (/^254(7|1)\d{8}$/.test(compact)) return compact;
  return null;
}

export function isValidKenyanPhone(value: string) {
  return Boolean(normalizeKenyanPhone(value));
}

export function validatePassword(value: string): { valid: boolean; message: string } {
  if (!value) {
    return { valid: false, message: 'Password is required.' };
  }

  if (value.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters.' };
  }

  if (!/[A-Za-z]/.test(value)) {
    return { valid: false, message: 'Password must include at least one letter.' };
  }

  if (!/\d/.test(value)) {
    return { valid: false, message: 'Password must include at least one number.' };
  }

  if (!(/[A-Z]/.test(value) || /[^A-Za-z0-9]/.test(value))) {
    return { valid: false, message: 'Add one uppercase letter or special character.' };
  }

  return { valid: true, message: '' };
}

export function normalizeLocation(value: string) {
  return collapseSpaces(value);
}

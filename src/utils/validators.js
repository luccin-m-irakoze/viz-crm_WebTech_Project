// Reusable validation and sanitization helpers for Viz CRM

const EMAIL_REGEX =
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const PHONE_REGEX =
  /^[0-9+()\-\s]{6,20}$/;

export function sanitizeString(value) {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  return trimmed.replace(/[<>]/g, '');
}

export function isRequired(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return sanitizeString(value).length > 0;
  return true;
}

export function isValidEmail(value) {
  const v = sanitizeString(value);
  if (!v) return false;
  return EMAIL_REGEX.test(v);
}

export function isValidPhone(value) {
  const v = sanitizeString(value);
  if (!v) return false;
  return PHONE_REGEX.test(v);
}

export function isPositiveNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) && num > 0;
}

export function validateContact(payload) {
  const errors = {};

  if (!isRequired(payload.name)) {
    errors.name = 'Name is required.';
  }

  if (!isValidEmail(payload.email)) {
    errors.email = 'A valid email is required.';
  }

  if (payload.phone && !isValidPhone(payload.phone)) {
    errors.phone = 'Phone number is invalid.';
  }

  if (!isRequired(payload.company)) {
    errors.company = 'Company is required.';
  }

  return errors;
}

export function validateLead(payload) {
  const errors = {};

  if (!isRequired(payload.title)) {
    errors.title = 'Title is required.';
  }

  if (!isPositiveNumber(payload.value)) {
    errors.value = 'Value must be a positive number.';
  }

  if (!isRequired(payload.status)) {
    errors.status = 'Status is required.';
  }

  if (!payload.contactId) {
    errors.contactId = 'Related contact is required.';
  }

  return errors;
}

export function validateUser(payload) {
  const errors = {};

  if (!isRequired(payload.name)) {
    errors.name = 'Name is required.';
  }

  if (!isValidEmail(payload.email)) {
    errors.email = 'A valid email is required.';
  }

  if (!isRequired(payload.role)) {
    errors.role = 'Role is required.';
  }

  if (!isRequired(payload.status)) {
    errors.status = 'Status is required.';
  }

  return errors;
}

export function validateLogin(payload) {
  const errors = {};

  if (!isValidEmail(payload.email)) {
    errors.email = 'A valid email is required.';
  }

  if (!isRequired(payload.password) || String(payload.password).length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }

  return errors;
}

export function validateSignup(payload) {
  const errors = {};

  if (!isRequired(payload.fullName)) {
    errors.fullName = 'Full name is required.';
  }

  if (!isValidEmail(payload.email)) {
    errors.email = 'A valid email is required.';
  }

  if (!isRequired(payload.password) || String(payload.password).length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }

  if (payload.confirmPassword !== payload.password) {
    errors.confirmPassword = 'Passwords must match.';
  }

  return errors;
}

export function validateForgotPassword(payload) {
  const errors = {};

  if (!isValidEmail(payload.email)) {
    errors.email = 'A valid email is required.';
  }

  return errors;
}


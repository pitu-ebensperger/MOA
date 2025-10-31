// EMAIL (Validación básica de formato email)
export function validateEmail(value: string): boolean {
  if (!value) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

// PASSWORD (Valida que la contraseña tenga al menos 'min' caracteres, incluyendo letras y números)
export function validatePassword(value: string, min = 8): boolean {
  if (!value) return false;
  const long = value.length >= min;
  const hasLetter = /[A-Za-z]/.test(value);
  const hasDigit  = /\d/.test(value);
  return long && hasLetter && hasDigit;
}
// Maneja errores de autenticación globalmente
export function handleAuthError(error) {
  if (error?.status === 401 || error?.status === 403) {
    localStorage.clear();
    window.location.href = '/login';
    return true;
  }
  return false;
}

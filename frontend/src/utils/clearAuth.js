/** Limpieza autenticación localStorage
 * (por si vuelve loop cargado sesion)
 * Para usarlo, ejecuta en la consola del navegador:
 * localStorage.removeItem('moa.accessToken');
 * localStorage.removeItem('moa.user');
 * window.location.reload();
 */

export function clearAuth() {
  if (typeof window !== 'undefined' && window.localStorage) {
    console.log('[clearAuth] Limpiando tokens y usuario del localStorage');
    localStorage.removeItem('moa.accessToken');
    localStorage.removeItem('moa.user');
    console.log('[clearAuth] Autenticación limpiada. Recarga la página.');
    return true;
  }
  console.error('[clearAuth] localStorage no disponible');
  return false;
}

export function debugAuth() {
  if (typeof window !== 'undefined' && window.localStorage) {
    const token = localStorage.getItem('moa.accessToken');
    const user = localStorage.getItem('moa.user');
    
    return { 
      hasToken: Boolean(token),
      hasUser: Boolean(user),
      tokenLength: token?.length,
      userValid: (() => {
        try {
          return Boolean(user && JSON.parse(user));
        } catch {
          return false;
        }
      })()
    };
  }
  return null;
}

// Hacer disponibles en window para debugging
if (typeof window !== 'undefined') {
  window.clearAuth = clearAuth;
  window.debugAuth = debugAuth;
}

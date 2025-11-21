/**
 * Utilidad para limpiar completamente la autenticación del localStorage
 * Útil cuando la app se queda atascada en "Cargando sesión..."
 * 
 * Para usarlo, ejecuta en la consola del navegador:
 * 
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
    
    console.log('[debugAuth] Estado de autenticación:');
    console.log('Token:', token);
    console.log('User:', user);
    
    if (token) {
      console.log('Token length:', token.length);
      console.log('Token type:', typeof token);
    }
    
    if (user) {
      try {
        const parsed = JSON.parse(user);
        console.log('User parsed:', parsed);
      } catch (e) {
        console.error('Error parseando user:', e);
      }
    }
    
    return { token, user };
  }
  return null;
}

// Hacer disponibles en window para debugging
if (typeof window !== 'undefined') {
  window.clearAuth = clearAuth;
  window.debugAuth = debugAuth;
}

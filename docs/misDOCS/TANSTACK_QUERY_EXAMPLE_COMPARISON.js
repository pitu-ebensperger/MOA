import { useState, useEffect } from 'react';

export function useRegionesYComunas_OLD() {
  const [regiones, setRegiones] = useState([]);
  const [comunas, setComunas] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [loadingRegiones, setLoadingRegiones] = useState(false);
  const [loadingComunas, setLoadingComunas] = useState(false);
  const [error, setError] = useState(null);

  // 🔴 PROBLEMA 1: useEffect se ejecuta SIEMPRE al montar
  useEffect(() => {
    const fetchRegiones = async () => {
      setLoadingRegiones(true);
      setError(null);
      
      try {
        const response = await fetch('/api/regiones');
        if (!response.ok) throw new Error('Error al cargar regiones');
        const data = await response.json();
        setRegiones(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingRegiones(false);
      }
    };

    fetchRegiones(); // 🔴 Fetch SIEMPRE, sin caché
  }, []); // 🔴 Vacío = solo 1 vez, pero sin caché entre páginas

  // 🔴 PROBLEMA 2: Otro useEffect para comunas
  useEffect(() => {
    if (!selectedRegion) {
      setComunas([]);
      return;
    }

    const fetchComunas = async () => {
      setLoadingComunas(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/regiones/${selectedRegion}/comunas`);
        if (!response.ok) throw new Error('Error al cargar comunas');
        const data = await response.json();
        setComunas(data.data?.comunas || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingComunas(false);
      }
    };

    fetchComunas(); // 🔴 Fetch cada vez que cambia región
  }, [selectedRegion]);

  return {
    regiones,
    comunas,
    selectedRegion,
    setSelectedRegion,
    loadingRegiones,
    loadingComunas,
    error,
  };
}

// 🔴 PROBLEMAS DE LA VERSIÓN VIEJA:
// 1. ❌ Sin caché: si cambias de página y vuelves, fetch de nuevo
// 2. ❌ Sin retry: si falla, te quedas sin datos
// 3. ❌ Mucho código boilerplate (loading, error, try/catch)
// 4. ❌ No visible en DevTools
// 5. ❌ Si 2 componentes usan el hook = 2 fetches duplicados


// ============================================
// ✅ VERSIÓN NUEVA (TanStack Query)
// ============================================

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

export function useRegionesYComunas_NEW() {
  const [selectedRegion, setSelectedRegion] = useState('');

  // ✅ Query de regiones (con caché de 1 hora)
  const regionesQuery = useQuery({
    queryKey: ['regiones'], // 🎯 Identificador único
    queryFn: async () => {
      const response = await fetch('/api/regiones');
      if (!response.ok) throw new Error('Error al cargar regiones');
      const data = await response.json();
      return data.data || [];
    },
    staleTime: 60 * 60 * 1000, // ✅ 1 hora = "datos frescos"
    cacheTime: 24 * 60 * 60 * 1000, // ✅ 24 horas en memoria
  });

  // ✅ Query de comunas (solo si hay región)
  const comunasQuery = useQuery({
    queryKey: ['comunas', selectedRegion], // 🎯 Key dinámica
    queryFn: async () => {
      const response = await fetch(`/api/regiones/${selectedRegion}/comunas`);
      if (!response.ok) throw new Error('Error al cargar comunas');
      const data = await response.json();
      return data.data?.comunas || [];
    },
    enabled: Boolean(selectedRegion), // ✅ Fetch condicional
    staleTime: 30 * 60 * 1000, // ✅ 30 min
    cacheTime: 60 * 60 * 1000, // ✅ 1 hora
  });

  return {
    regiones: regionesQuery.data ?? [],
    loadingRegiones: regionesQuery.isLoading,
    
    comunas: comunasQuery.data ?? [],
    loadingComunas: comunasQuery.isLoading,
    
    selectedRegion,
    setSelectedRegion,
    
    error: regionesQuery.error || comunasQuery.error,
  };
}

// ✅ BENEFICIOS DE LA VERSIÓN NUEVA:
// 1. ✅ Caché automático: 1er fetch guarda datos por 1 hora
// 2. ✅ Retry automático: 2 intentos en errores de red
// 3. ✅ Menos código: sin try/catch, sin setLoading manual
// 4. ✅ Visible en DevTools: ves estado, datos, cache
// 5. ✅ Compartido: 2 componentes = 1 solo fetch


// ============================================
// 🧪 COMPARACIÓN DE USO EN UN COMPONENTE
// ============================================

// ❌ Versión VIEJA
function AddressForm_OLD() {
  const { 
    regiones, 
    comunas, 
    selectedRegion, 
    setSelectedRegion, 
    loadingRegiones 
  } = useRegionesYComunas_OLD();

  // 🔴 Cada vez que montas el componente = fetch nuevo
  // 🔴 Si tienes 3 formularios de dirección = 3 fetches

  return (
    <div>
      {loadingRegiones ? (
        <p>Cargando regiones...</p>
      ) : (
        <select onChange={(e) => setSelectedRegion(e.target.value)}>
          {regiones.map((r) => (
            <option key={r.code} value={r.code}>{r.name}</option>
          ))}
        </select>
      )}
      {/* ... comunas ... */}
    </div>
  );
}

// ✅ Versión NUEVA
function AddressForm_NEW() {
  const { 
    regiones, 
    comunas, 
    selectedRegion, 
    setSelectedRegion, 
    loadingRegiones 
  } = useRegionesYComunas_NEW();

  // ✅ 1er componente fetch, resto usa caché por 1 hora
  // ✅ 3 formularios = 1 solo fetch, resto instantáneo

  return (
    <div>
      {loadingRegiones ? (
        <p>Cargando regiones...</p>
      ) : (
        <select onChange={(e) => setSelectedRegion(e.target.value)}>
          {regiones.map((r) => (
            <option key={r.code} value={r.code}>{r.name}</option>
          ))}
        </select>
      )}
      {/* ... comunas ... */}
    </div>
  );
}

// ============================================
// 📊 VER EN DEVTOOLS
// ============================================

/**
 * Abre el icono flotante en Chrome y verás:
 * 
 * ✅ VERSIÓN NUEVA (con Query):
 * 
 * 📦 Queries (2)
 *   └─ ['regiones']
 *      ├─ Status: success ✅
 *      ├─ Last Updated: hace 5 seg
 *      ├─ Data: [{ code: 'RM', name: 'Región Metropolitana' }, ...]
 *      ├─ Observers: 1
 *      └─ Stale In: 59:55 (quedan 59 min hasta marcar como viejo)
 * 
 *   └─ ['comunas', 'RM']
 *      ├─ Status: success ✅
 *      ├─ Last Updated: hace 2 seg
 *      ├─ Data: [{ code: 'SANTIAGO', name: 'Santiago' }, ...]
 *      └─ Stale In: 29:58
 * 
 * 
 * ❌ VERSIÓN VIEJA (sin Query):
 * 
 * 📦 Queries (0)
 *   └─ (vacío) ❌
 * 
 * No aparece nada porque usa useState + useEffect
 */


// ============================================
// 🎯 MIGRACIÓN PASO A PASO
// ============================================

/**
 * PASO 1: Crear archivo nuevo
 * - Copiar useRegionesYComunas.js → useRegionesYComunas.query.js
 * 
 * PASO 2: Reemplazar useState/useEffect con useQuery
 * - Ver código arriba (versión NEW)
 * 
 * PASO 3: Actualizar imports en componentes
 * - Cambiar: import { useRegionesYComunas } from '@/hooks/useRegionesYComunas'
 * - Por:     import { useRegionesYComunas } from '@/hooks/useRegionesYComunas.query'
 * 
 * PASO 4: Probar
 * - Abrir DevTools
 * - Navegar a formulario de dirección
 * - Ver query ['regiones'] en DevTools
 * - Cambiar de página y volver
 * - Verificar que NO hace fetch (usa caché)
 * 
 * PASO 5: Cleanup (después de confirmar que funciona)
 * - Renombrar useRegionesYComunas.query.js → useRegionesYComunas.js
 * - Eliminar archivo viejo
 * - Commit
 */

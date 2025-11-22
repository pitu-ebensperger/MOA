import { useState, useEffect } from 'react';

/**
 * Hook para manejar regiones y comunas de Chile con cascading logic
 * Consume los endpoints del backend /api/regiones y /api/regiones/:code/comunas
 */
export function useRegionesYComunas() {
  const [regiones, setRegiones] = useState([]);
  const [comunas, setComunas] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [loadingRegiones, setLoadingRegiones] = useState(false);
  const [loadingComunas, setLoadingComunas] = useState(false);
  const [error, setError] = useState(null);

  // Cargar regiones al montar el componente
  useEffect(() => {
    const fetchRegiones = async () => {
      setLoadingRegiones(true);
      setError(null);
      
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'}/api/regiones`);
        
        if (!response.ok) {
          throw new Error('Error al cargar regiones');
        }

        const data = await response.json();
        setRegiones(data.data || []);
      } catch (err) {
        setError(err.message);
        console.error('Error cargando regiones:', err);
      } finally {
        setLoadingRegiones(false);
      }
    };

    fetchRegiones();
  }, []);

  // Cargar comunas cuando cambia la región seleccionada
  useEffect(() => {
    if (!selectedRegion) {
      setComunas([]);
      return;
    }

    const fetchComunas = async () => {
      setLoadingComunas(true);
      setError(null);
      
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'}/api/regiones/${selectedRegion}/comunas`
        );
        
        if (!response.ok) {
          throw new Error('Error al cargar comunas');
        }

        const data = await response.json();
        setComunas(data.data?.comunas || []);
      } catch (err) {
        setError(err.message);
        console.error('Error cargando comunas:', err);
      } finally {
        setLoadingComunas(false);
      }
    };

    fetchComunas();
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

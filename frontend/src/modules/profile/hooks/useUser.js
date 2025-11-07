import { useState, useEffect } from 'react';
// import axios from 'axios';
import { useAuth } from '../../auth/hooks/useAuth';

export const useUser = () => {
  const { user: authUser } = useAuth(); // traemos el usuario autenticado
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Traer perfil del usuario 
  const fetchProfile = async () => {
    if (!authUser) return; // si no hay usuario logueado, no hacemos nada
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/users/${authUser.id}`);
      setProfile(data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Actualizar perfil del usuario
  const updateProfile = async (updatedData) => {
    if (!authUser) return;
    setLoading(true);
    try {
      const { data } = await axios.put(`/api/users/${authUser.id}`, updatedData);
      setProfile(data);
      setError(null);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [authUser]);

  return { profile, loading, error, fetchProfile, updateProfile };
};

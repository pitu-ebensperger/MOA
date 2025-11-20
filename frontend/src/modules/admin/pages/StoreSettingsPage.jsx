import { useState, useEffect } from 'react';
import { Save, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getStoreConfig, updateStoreConfig } from '@/services/config.api.js';
import { Button } from '@/components/ui/Button.jsx';
import { Input } from '@/components/ui/Input.jsx';

export const StoreSettingsPage = () => {
  const [config, setConfig] = useState({
    nombre_tienda: '',
    descripcion: '',
    direccion: '',
    telefono: '',
    email: '',
    instagram_url: '',
    facebook_url: '',
    twitter_url: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getStoreConfig();
      const configPayload = response?.data ?? response;
      setConfig(configPayload);
    } catch (err) {
      console.error('Error al cargar configuración:', err);
      setError('Error al cargar la configuración. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: value
    }));
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      
      await updateStoreConfig(config);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error al guardar configuración:', err);
      setError(err.response?.data?.message || 'Error al guardar los cambios. Por favor, intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center gap-3 text-neutral-600">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Cargando configuración...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary1 mb-2">
          Configuración de la Tienda
        </h1>
        <p className="text-neutral-600">
          Administra la información que se muestra en el footer y otras áreas del sitio
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-800 mb-1">Error</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-green-800 mb-1">¡Éxito!</h3>
            <p className="text-sm text-green-700">Los cambios se guardaron correctamente</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Información Básica */}
        <section className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-xl font-semibold text-neutral-800 mb-6">
            Información Básica
          </h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="nombre_tienda" className="block text-sm font-medium text-neutral-700 mb-2">
                Nombre de la Tienda
              </label>
              <Input
                id="nombre_tienda"
                name="nombre_tienda"
                value={config.nombre_tienda}
                onChange={handleChange}
                placeholder="MOA"
                required
              />
            </div>

            <div>
              <label htmlFor="descripcion" className="block text-sm font-medium text-neutral-700 mb-2">
                Descripción
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={config.descripcion}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary1 focus:border-transparent"
                placeholder="Descripción de la tienda"
                required
              />
              <p className="mt-1 text-sm text-neutral-500">
                Esta descripción aparece en el footer del sitio
              </p>
            </div>
          </div>
        </section>

        {/* Información de Contacto */}
        <section className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-xl font-semibold text-neutral-800 mb-6">
            Información de Contacto
          </h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="direccion" className="block text-sm font-medium text-neutral-700 mb-2">
                Dirección
              </label>
              <Input
                id="direccion"
                name="direccion"
                value={config.direccion}
                onChange={handleChange}
                placeholder="Providencia 1234, Santiago, Chile"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-neutral-700 mb-2">
                  Teléfono
                </label>
                <Input
                  id="telefono"
                  name="telefono"
                  value={config.telefono}
                  onChange={handleChange}
                  placeholder="+56 2 2345 6789"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={config.email}
                  onChange={handleChange}
                  placeholder="hola@moastudio.cl"
                  required
                />
              </div>
            </div>
          </div>
        </section>

        {/* Redes Sociales */}
        <section className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-xl font-semibold text-neutral-800 mb-6">
            Redes Sociales
          </h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="instagram_url" className="block text-sm font-medium text-neutral-700 mb-2">
                Instagram
              </label>
              <Input
                id="instagram_url"
                name="instagram_url"
                type="url"
                value={config.instagram_url}
                onChange={handleChange}
                placeholder="https://instagram.com/moastudio"
              />
            </div>

            <div>
              <label htmlFor="facebook_url" className="block text-sm font-medium text-neutral-700 mb-2">
                Facebook
              </label>
              <Input
                id="facebook_url"
                name="facebook_url"
                type="url"
                value={config.facebook_url}
                onChange={handleChange}
                placeholder="https://facebook.com/moastudio"
              />
            </div>

            <div>
              <label htmlFor="twitter_url" className="block text-sm font-medium text-neutral-700 mb-2">
                Twitter / X
              </label>
              <Input
                id="twitter_url"
                name="twitter_url"
                type="url"
                value={config.twitter_url}
                onChange={handleChange}
                placeholder="https://twitter.com/moastudio"
              />
            </div>
          </div>
        </section>

        {/* Botones de Acción */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Button
            type="button"
            appearance="outline"
            onClick={loadConfig}
            disabled={saving}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Recargar
          </Button>
          
          <Button
            type="submit"
            appearance="solid"
            intent="primary"
            disabled={saving}
          >
            {saving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

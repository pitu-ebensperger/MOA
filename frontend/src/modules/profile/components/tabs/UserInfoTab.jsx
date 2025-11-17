import { useState, useEffect } from 'react';
import { Save, Mail, Phone, Calendar, Edit2, X, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/ui/card.jsx';
import { Button } from '@/components/shadcn/ui/button.jsx';
import { Input } from '@/components/shadcn/ui/input.jsx';
import { Label } from '@/components/shadcn/ui/label.jsx';
import { useAuth } from '@/context/auth-context.js';
import { getUserById, updateUser } from '@/services/users.api.js';

export const UserInfoTab = () => {
  const { user: authUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [userData, setUserData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    fecha_registro: ''
  });

  const [formData, setFormData] = useState({ ...userData });

  useEffect(() => {
    loadUserData();
  }, [authUser]);

  const loadUserData = async () => {
    if (!authUser?.id_usuario) return;
    
    try {
      setLoading(true);
      const response = await getUserById(authUser.id_usuario);
      const data = response.data || response;
      
      const user = {
        nombre: data.nombre || '',
        apellido: data.apellido || '',
        email: data.email || '',
        telefono: data.telefono || '',
        fecha_registro: data.fecha_registro || ''
      };
      
      setUserData(user);
      setFormData(user);
    } catch (err) {
      console.error('Error al cargar datos del usuario:', err);
      setError('Error al cargar los datos del usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      await updateUser(authUser.id_usuario, formData);
      
      setUserData(formData);
      setIsEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error al actualizar usuario:', err);
      setError('Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(userData);
    setIsEditing(false);
    setError(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div 
        className="rounded-xl p-8"
        style={{ 
          backgroundColor: 'var(--color-white)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div className="flex items-center justify-center py-12">
          <div 
            className="animate-spin rounded-full h-10 w-10 border-b-2"
            style={{ borderColor: 'var(--color-primary1)' }}
          ></div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="rounded-xl overflow-hidden"
      style={{ 
        backgroundColor: 'var(--color-white)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      {/* Header */}
      <div 
        className="px-6 lg:px-8 py-6 border-b flex items-center justify-between"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div>
          <h2 
            className="text-xl lg:text-2xl font-semibold mb-1"
            style={{ 
              fontFamily: 'var(--font-display)',
              color: 'var(--color-primary2)'
            }}
          >
            Información Personal
          </h2>
          <p 
            className="text-sm"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Actualiza tus datos personales
          </p>
        </div>
        {!isEditing ? (
          <Button 
            onClick={() => setIsEditing(true)} 
            variant="outline"
            className="rounded-full"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-primary1)'
            }}
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Editar
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button 
              onClick={handleCancel} 
              variant="outline" 
              size="sm" 
              disabled={saving}
              className="rounded-full"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)'
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              size="sm" 
              disabled={saving}
              className="rounded-full"
              style={{
                backgroundColor: 'var(--color-primary1)',
                color: 'var(--color-white)'
              }}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Guardar
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-6 lg:px-8 py-6 space-y-6">
        {error && (
          <div 
            className="p-4 rounded-lg"
            style={{ 
              backgroundColor: 'rgba(184, 131, 107, 0.1)',
              border: '1px solid var(--color-error)'
            }}
          >
            <p className="text-sm" style={{ color: 'var(--color-error)' }}>{error}</p>
          </div>
        )}

        {success && (
          <div 
            className="p-4 rounded-lg"
            style={{ 
              backgroundColor: 'rgba(122, 139, 111, 0.1)',
              border: '1px solid var(--color-success)'
            }}
          >
            <p className="text-sm" style={{ color: 'var(--color-success)' }}>¡Cambios guardados exitosamente!</p>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            {isEditing ? (
              <Input
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Tu nombre"
              />
            ) : (
              <p className="text-lg font-medium">{userData.nombre || 'No especificado'}</p>
            )}
          </div>

          {/* Apellido */}
          <div className="space-y-2">
            <Label htmlFor="apellido">Apellido</Label>
            {isEditing ? (
              <Input
                id="apellido"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                placeholder="Tu apellido"
              />
            ) : (
              <p className="text-lg font-medium">{userData.apellido || 'No especificado'}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Label>
            {isEditing ? (
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
              />
            ) : (
              <p className="text-lg font-medium">{userData.email || 'No especificado'}</p>
            )}
          </div>

          {/* Teléfono */}
          <div className="space-y-2">
            <Label htmlFor="telefono" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Teléfono
            </Label>
            {isEditing ? (
              <Input
                id="telefono"
                name="telefono"
                type="tel"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="+56 9 1234 5678"
              />
            ) : (
              <p className="text-lg font-medium">{userData.telefono || 'No especificado'}</p>
            )}
          </div>

          {/* Fecha de registro (solo lectura) */}
          <div className="space-y-2 md:col-span-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Miembro desde
            </Label>
            <p className="text-lg font-medium text-neutral-600">
              {formatDate(userData.fecha_registro)}
            </p>
          </div>
        </div>

        {/* Botones de acción */}
        {isEditing && (
          <div className="flex gap-3 pt-4 border-t">
            <Button 
              onClick={handleCancel} 
              variant="outline"
              disabled={saving}
              className="flex-1 sm:flex-none rounded-full"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)'
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={saving}
              className="flex-1 sm:flex-none rounded-full"
              style={{
                backgroundColor: 'var(--color-primary1)',
                color: 'var(--color-white)'
              }}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
        )}
      </div>
    </div>
  );
};

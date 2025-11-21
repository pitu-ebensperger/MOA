import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../context/auth-context.js'
import { authApi } from '../../../services/auth.api.js'
import { usersApi } from '../../../services/users.api.js'

const UserInfoSection = () => {
  const { user, token } = useAuth();  
  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("🔍 UserInfoSection useEffect ejecutado -> user:", user, "token:", token);

    if (!token) {
      console.log("❌ No hay token, no se puede cargar el perfil");
      return;
    }

    console.log("✅ Token encontrado, cargando perfil desde backend...");
    setLoading(true);
    setError(null);

    // Usar authApi.profile() que obtiene perfil por token, sin necesidad de user.id
    authApi.profile()
      .then((data) => {
        console.log("✅ Datos cargados exitosamente desde backend:", data);

        setForm({
          nombre: data.nombre || "",
          email: data.email || "",
          telefono: data.telefono || "",
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Error cargando usuario:", err);
        console.error("Error details:", err.message, err.status, err.data);
        setError(err);
        setLoading(false);
      });
  }, [token, user]); // Solo depende del token, user se actualiza desde el AuthContext

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveClick = async () => {
    try {
      const updatedUser = await usersApi.updateUser(user.id, {
        nombre: form.nombre,
        telefono: form.telefono,
      });

      console.log("Usuario actualizado:", updatedUser);

      if (updatedUser.user) {
        setForm({
          nombre: updatedUser.user.nombre,
          email: updatedUser.user.email,
          telefono: updatedUser.user.telefono,
        });
      }

      setIsEditing(false);
    } catch (error) {
      console.error("Error PATCH:", error);
    }
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="font-serif text-4xl text-primary">Mi Perfil</h1>
        <p className="text-text-secondary text-sm">Gestiona tu información personal</p>
      </div>

      {/* Profile Card */}
      <div className="bg-surface rounded-2xl shadow-sm border border-neutral-200 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-32 h-32 rounded-full bg-primary-soft flex items-center justify-center">
              <i className="fa-solid fa-user text-5xl text-primary"></i>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-primary">@{form.nombre || "Usuario"}</h2>
              <p className="text-sm text-text-secondary">{form.email}</p>
            </div>
          </div>

          {/* Form Section */}
          <div className="flex-1 space-y-6">
            {loading && (
              <div className="bg-primary-soft/20 border border-primary-soft rounded-lg p-4 text-center">
                <p className="text-sm text-primary">Cargando información...</p>
              </div>
            )}

            {error && (
              <div className="bg-error/10 border border-error/30 rounded-lg p-4 text-center">
                <p className="text-sm text-error">Error: {error.message || "No se pudo cargar la información"}</p>
              </div>
            )}

            <form className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="nombre" className="block text-sm font-medium text-text">
                  Nombre
                </label>
                <input
                  id="nombre"
                  type="text"
                  name="nombre"
                  disabled={!isEditing}
                  value={form.nombre}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-neutral-300 bg-surface px-4 py-2.5 text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-neutral-200 disabled:cursor-not-allowed"
                  placeholder="Tu nombre"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-text">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  disabled
                  value={form.email}
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-200 px-4 py-2.5 text-text-secondary cursor-not-allowed"
                  placeholder="tu@email.com"
                />
                <p className="text-xs text-text-muted">El email no se puede modificar</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="telefono" className="block text-sm font-medium text-text">
                  Teléfono
                </label>
                <input
                  id="telefono"
                  type="tel"
                  name="telefono"
                  disabled={!isEditing}
                  value={form.telefono}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-neutral-300 bg-surface px-4 py-2.5 text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-neutral-200 disabled:cursor-not-allowed"
                  placeholder="+56 9 1234 5678"
                />
              </div>

              <div className="flex gap-3 pt-4">
                {!isEditing ? (
                  <button
                    type="button"
                    className="flex-1 px-6 py-2.5 bg-primary text-white rounded-lg font-medium transition-all hover:bg-primary-dark hover:shadow-md active:scale-95"
                    onClick={() => setIsEditing(true)}
                  >
                    Editar Perfil
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="flex-1 px-6 py-2.5 border border-neutral-300 text-text rounded-lg font-medium transition-all hover:bg-neutral-100 active:scale-95"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="flex-1 px-6 py-2.5 bg-primary text-white rounded-lg font-medium transition-all hover:bg-primary-dark hover:shadow-md active:scale-95"
                      onClick={handleSaveClick}
                    >
                      Guardar Cambios
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserInfoSection

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
  }, [token]); // Solo depende del token, user se actualiza desde el AuthContext

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
    <section>
      <h2 className="font-italiana text-4xl text-dark mt-24 mb-10 flex justify-center">
        Mi Perfil
      </h2>

      <div className="flex justify-center gap-4">
        <div className="w-1/3 profile-image">
          <i className="fa-solid fa-user text-8xl"></i>
        </div>

        <div className="w-1/3">
          {loading && (
            <div className="text-blue-600 mb-4">
              🔄 Cargando datos del usuario desde backend...
            </div>
          )}

          {error && (
            <div className="text-red-600 mb-4">
              ❌ Error cargando datos: {error.message || "Error desconocido"}
            </div>
          )}

          <h2 className="text-2xl mb-4">@{form.nombre || "Cargando..."}</h2>

          <form className="flex flex-col gap-2">
            <input
              type="text"
              name="nombre"
              disabled={!isEditing}
              value={form.nombre}
              onChange={handleChange}
              className="w-full border border-primary2 rounded px-4 py-2"
            />

            <input
              type="email"
              name="email"
              disabled
              value={form.email}
              className="w-full border border-primary2 rounded px-4 py-2 bg-gray-100"
            />

            <input
              type="tel"
              name="telefono"
              disabled={!isEditing}
              value={form.telefono}
              onChange={handleChange}
              className="w-full border border-primary2 rounded px-4 py-2"
            />

            <div className="flex justify-between gap-2 mt-4">
              <button
                type="button"
                className="w-1/2 px-4 py-2 border border-primary2 text-primary2 rounded"
                onClick={() => setIsEditing(true)}
              >
                Editar
              </button>

              <button
                type="button"
                className={`w-1/2 px-4 py-2 border border-primary2 rounded ${
                  isEditing
                    ? "text-primary2 hover:bg-primary2 hover:text-white"
                    : "opacity-50 cursor-not-allowed"
                }`}
                onClick={handleSaveClick}
                disabled={!isEditing}
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default UserInfoSection

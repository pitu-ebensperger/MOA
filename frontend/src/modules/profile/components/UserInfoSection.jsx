import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../context/auth-context.js'

const UserInfoSection = () => {
  const { user, token } = useAuth();  
  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
  });

  // 🔥 Carga inicial del usuario desde el backend
  useEffect(() => {
    console.log("UseEffect ejecutado -> user:", user, "token:", token);

    if (!user?.id || !token) return;

    fetch(`http://localhost:3000/usuario/${user.id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`, 
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Datos cargados:", data);

        setForm({
          nombre: data.nombre || "",
          email: data.email || "",
          telefono: data.telefono || "",
        });
      })
      .catch((err) => console.error("Error cargando usuario:", err));
  }, [user, token]);

  // 🔥 Actualiza los campos del formulario
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // 🔥 PATCH para guardar cambios
  const handleSaveClick = async () => {
    try {
      const res = await fetch(`http://localhost:3000/usuario/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,  
        },
        body: JSON.stringify({
          nombre: form.nombre,
          telefono: form.telefono,
        }),
      });

      if (!res.ok) {
        console.error("Error al actualizar:", res.status);
        return;
      }

      const data = await res.json();
      console.log("Usuario actualizado:", data);

      // 🟢 Actualiza inmediatamente el formulario con la respuesta del backend
      if (data.user) {
        setForm({
          nombre: data.user.nombre,
          email: data.user.email,
          telefono: data.user.telefono,
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
          <h2 className="text-2xl mb-4">@{form.nombre}</h2>

          <form className="flex flex-col gap-2">
            {/* Nombre */}
            <input
              type="text"
              name="nombre"
              disabled={!isEditing}
              value={form.nombre}
              onChange={handleChange}
              className="w-full border border-primary2 rounded px-4 py-2"
            />

            {/* Email - solo lectura */}
            <input
              type="email"
              name="email"
              disabled
              value={form.email}
              className="w-full border border-primary2 rounded px-4 py-2 bg-gray-100"
            />

            {/* Teléfono */}
            <input
              type="tel"
              name="telefono"
              disabled={!isEditing}
              value={form.telefono}
              onChange={handleChange}
              className="w-full border border-primary2 rounded px-4 py-2"
            />

            {/* Botones */}
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

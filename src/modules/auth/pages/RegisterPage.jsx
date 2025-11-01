import { useState } from "react";
import { useAuth } from "../hooks/useAuth.jsx";

const RegisterPage = () => {
  const { register, status, error } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await register(form);
    } catch {
      // manejado por el estado global
    }
  };

  return (
    <main>
      <h1>Crear cuenta</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Nombre
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Correo
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Contraseña
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            minLength={8}
            required
          />
        </label>

        <button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Creando..." : "Registrarme"}
        </button>

        {error && <p role="alert">No pudimos crear tu cuenta.</p>}
      </form>
    </main>
  );
};

export default RegisterPage;

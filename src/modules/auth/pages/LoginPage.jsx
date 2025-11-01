import { useState } from "react";
import { useAuth } from "../hooks/useAuth.jsx";

const LoginPage = () => {
  const { login, status, error } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await login(form);
    } catch {
      // handled by context state
    }
  };

  return (
    <main>
      <h1>Iniciar sesión</h1>
      <form onSubmit={handleSubmit}>
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
            required
          />
        </label>

        <button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Entrando..." : "Entrar"}
        </button>

        {error && <p role="alert">Revisa tus credenciales.</p>}
      </form>
    </main>
  );
};

export default LoginPage;

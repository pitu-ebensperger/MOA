import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Container } from "../../../shared/components/layout/Container.jsx";
import { Header } from "../../../shared/components/layout/Header.jsx";
import { Button } from "../../../shared/components/ui/Button.jsx";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }
    console.log("Reset con token", token, password);
  };

  return (
    <main className="auth-reset">
      <Header title="Restablecer contraseña" subtitle="Ingresa una nueva contraseña segura." />
      <Container size="sm">
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Nueva contraseña
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              required
            />
          </label>
          <label>
            Confirmar contraseña
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={8}
              required
            />
          </label>
          <Button type="submit">Guardar contraseña</Button>
        </form>
      </Container>
    </main>
  );
};

export default ResetPasswordPage;

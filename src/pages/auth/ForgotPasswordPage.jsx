import { useState } from "react";
import { Container } from "../../../shared/components/layout/Container.jsx";
import { Header } from "../../../shared/components/layout/Header.jsx";
import { Button } from "../../../shared/components/ui/Button.jsx";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Solicitud de reset enviada", email);
  };

  return (
    <main className="auth-forgot">
      <Header title="Recuperar contraseña" subtitle="Te enviaremos un enlace para restablecerla." />
      <Container size="sm">
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Correo electrónico
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <Button type="submit">Enviar instrucciones</Button>
        </form>
      </Container>
    </main>
  );
};

export default ForgotPasswordPage;

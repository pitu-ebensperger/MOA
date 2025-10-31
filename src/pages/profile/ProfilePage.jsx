import { useAuth } from "../../auth/hooks/useAuth.js";

const ProfilePage = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <main>
        <h1>Perfil</h1>
        <p>Debes iniciar sesión para ver tu perfil.</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Perfil</h1>
      <dl>
        <dt>Nombre</dt>
        <dd>{user?.name}</dd>
        <dt>Correo</dt>
        <dd>{user?.email}</dd>
      </dl>
    </main>
  );
};

export default ProfilePage;

import { usersDb } from "@/mocks/database/users.js"

// Mock Auth API
export const mockAuthApi = {
  // POST /auth/login
  login: async (credentials) => {
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simular delay de red

    const { email, password } = credentials;
    
    // Buscar usuario por email
    const user = usersDb.users.find((u) => u.email === email);

    // Validación simple (en mock aceptamos cualquier password para el usuario existente)
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    // En modo mock, aceptamos password "demo" o "admin" o cualquiera
    if (password !== "demo" && password !== "admin" && password !== "123456") {
      throw new Error("Credenciales inválidas");
    }

    // Generar token mock
    const token = `mock-token-${user.id}-${Date.now()}`;

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        addresses: user.addresses || [],
      },
    };
  },

  // POST /auth/register
  register: async (payload) => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    // En mock, simplemente creamos un nuevo usuario temporal
    const newUser = {
      id: `usr-${Date.now()}`,
      username: payload.username || payload.email.split("@")[0],
      firstName: payload.firstName || "Usuario",
      lastName: payload.lastName || "Nuevo",
      email: payload.email,
      role: "CLIENTE",
      status: "activo",
      phone: payload.phone || "",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400",
      createdAt: new Date().toISOString(),
      addresses: [],
    };

    // Generar token
    const token = `mock-token-${newUser.id}-${Date.now()}`;

    return {
      token,
      user: newUser,
    };
  },

  // GET /auth/profile
  profile: async (userId) => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const user = usersDb.users.find((u) => u.id === userId);

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    return {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      addresses: user.addresses || [],
      stats: user.stats,
    };
  },

  // POST /auth/forgot-password
  requestPasswordReset: async (email) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const user = usersDb.users.find((u) => u.email === email);
    
    if (!user) {
      throw new Error("Email no encontrado");
    }

    return {
      message: "Email de recuperación enviado",
      success: true,
    };
  },

  // POST /auth/reset-password
  resetPassword: async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      message: "Contraseña actualizada exitosamente",
      success: true,
    };
  },
};

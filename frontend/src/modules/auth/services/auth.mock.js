import { USERS } from "../../../mocks/database/users.js";

const normalize = (value) => (value ?? "").toLowerCase().trim();

const DEFAULT_PASSWORDS = {
  "admin@moa.cl": "admin123",
  "cliente@mail.com": "cliente123",
};

const passwordStore = Object.fromEntries(
  Object.entries(DEFAULT_PASSWORDS).map(([email, password]) => [normalize(email), password]),
);

const users = USERS.map((user) => ({ ...user }));

const makeError = (message, status = 401) => {
  const error = new Error(message);
  error.status = status;
  error.data = { message };
  return error;
};

const randomId = () => `usr-${Math.round(Date.now() + Math.random() * 9999)}`;

const ensureDom = () => typeof window !== "undefined";

const getStoredUser = () => {
  if (!ensureDom()) return null;
  const raw = window.localStorage.getItem("moa.user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const simulateLatency = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockAuthApi = {
  login: async ({ email, password }) => {
    await simulateLatency();
    if (!email || !password) {
      throw makeError("Credenciales incompletas");
    }
    const normalizedEmail = normalize(email);
    const user = users.find((record) => normalize(record.email) === normalizedEmail);
    if (!user) throw makeError("Credenciales inválidas");
    const expectedPassword = passwordStore[normalizedEmail];
    if (password !== expectedPassword) throw makeError("Credenciales inválidas");
    return {
      token: `mock-token-${user.id}`,
      user,
    };
  },

  register: async ({ name, email, phone, password }) => {
    await simulateLatency();
    if (!email || !password) {
      throw makeError("Email y contraseña son obligatorios", 400);
    }
    const normalizedEmail = normalize(email);
    if (users.some((record) => normalize(record.email) === normalizedEmail)) {
      throw makeError("Ya existe una cuenta con ese correo", 409);
    }
    const [firstName, ...rest] = (name ?? "Cliente").trim().split(" ");
    const lastName = rest.join(" ") || "Anónimo";
    const newUser = {
      id: randomId(),
      username: normalizedEmail.split("@")[0],
      firstName,
      lastName,
      email: normalizedEmail,
      role: "CLIENTE",
      status: "activo",
      phone: phone ?? "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    users.push(newUser);
    passwordStore[normalizedEmail] = password;
    return {
      token: `mock-token-${newUser.id}`,
      user: newUser,
    };
  },

  profile: async () => {
    await simulateLatency();
    const stored = getStoredUser();
    if (!stored) throw makeError("Sin sesión activa");
    return stored;
  },
};

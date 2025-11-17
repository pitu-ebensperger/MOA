import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import pool from "../config.js";

const DEMO_USERS = [
  {
    publicId: nanoid(),
    nombre: "Administrador MOA",
    email: "admin@moa.cl",
    telefono: "+56900000000",
    password: "admin123",
    rol: "admin",
    rol_code: "ADMIN",
  },
  {
    publicId: nanoid(),
    nombre: "Usuario Demo",
    email: "demo@moa.cl",
    telefono: "+56912345678",
    password: "demo",
    rol: "cliente",
    rol_code: "CLIENTE",
  },
  {
    publicId: nanoid(),
    nombre: "Usuario Demo Alias",
    email: "demo@moal.cl",
    telefono: "+56912345679",
    password: "demo",
    rol: "cliente",
    rol_code: "CLIENTE",
  },
  {
    publicId: nanoid(),
    nombre: "Camila López",
    email: "cliente@mail.com",
    telefono: "+56987654321",
    password: "demo",
    rol: "cliente",
    rol_code: "CLIENTE",
  },
];

async function seedDemoUsers() {
  console.log("🌱 Creando usuarios de demostración...");
  
  for (const user of DEMO_USERS) {
    const passwordHash = bcrypt.hashSync(user.password, 10);
    const sql = `
      INSERT INTO usuarios (public_id, nombre, email, telefono, password_hash, rol, rol_code)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (email) DO UPDATE SET
        nombre = EXCLUDED.nombre,
        telefono = EXCLUDED.telefono,
        password_hash = EXCLUDED.password_hash,
        rol = EXCLUDED.rol,
        rol_code = EXCLUDED.rol_code
    `;
    const values = [
      user.publicId,
      user.nombre,
      user.email,
      user.telefono,
      passwordHash,
      user.rol,
      user.rol_code,
    ];

    try {
      await pool.query(sql, values);
      console.log(`✅ Usuario '${user.email}' creado/actualizado (contraseña: ${user.password})`);
    } catch (error) {
      console.error(`❌ Error al crear usuario '${user.email}':`, error.message);
    }
  }
  
  console.log("\n🎉 Proceso de seed completado!");
  process.exit(0);
}

// Manejo de errores
process.on('unhandledRejection', (err) => {
  console.error('❌ Error no manejado:', err);
  process.exit(1);
});

seedDemoUsers();

/**
 * USUARIOS DEMO - Simulación de registro natural durante 2 años
 * 
 * Representa usuarios que descubrieron MOA en diferentes momentos y han interactuado
 * con la plataforma de forma orgánica (compras, wishlists, navegación).
 * 
 * Timeline simulado:
 * - Early adopters (2023): Primeros usuarios, múltiples compras
 * - Mid-term users (2024): Usuarios consolidados, compras regulares  
 * - Recent users (2025): Nuevos usuarios, primeras compras o explorando
 */

export const CLIENTS = [
  // === EARLY ADOPTERS (Registrados hace 18-24 meses) ===
  {
    nombre: "Camila Abarca",
    email: "camila.abarca@mail.cl",
    telefono: "+56912341001",
    rol_code: "CLIENT",
    creado_en: new Date('2023-06-15T10:30:00Z'), // ~18 meses - Cliente frecuente
  },
  {
    nombre: "Martín Calvo",
    email: "martin.calvo@mail.cl",
    telefono: "+56922332002",
    rol_code: "CLIENT",
    creado_en: new Date('2023-07-22T14:15:00Z'), // ~17 meses - Comprador recurrente
  },
  {
    nombre: "Valentina Cruz",
    email: "valentina.cruz@mail.cl",
    telefono: "+56933443003",
    rol_code: "CLIENT",
    creado_en: new Date('2023-08-10T09:20:00Z'), // ~16 meses
  },
  {
    nombre: "Lucas Herrera",
    email: "lucas.herrera@mail.cl",
    telefono: "+56944554004",
    rol_code: "CLIENT",
    creado_en: new Date('2023-09-05T16:45:00Z'), // ~15 meses
  },
  
  // === MID-TERM USERS (Registrados hace 12-18 meses) ===
  {
    nombre: "Isidora Vega",
    email: "isidora.vega@mail.cl",
    telefono: "+56955665005",
    rol_code: "CLIENT",
    creado_en: new Date('2023-11-12T11:30:00Z'), // ~13 meses
  },
  {
    nombre: "Diego Morales",
    email: "diego.morales@mail.cl",
    telefono: "+56966776006",
    rol_code: "CLIENT",
    creado_en: new Date('2024-01-20T13:10:00Z'), // ~10 meses
  },
  {
    nombre: "Fernanda Lagos",
    email: "fernanda.lagos@mail.cl",
    telefono: "+56977887007",
    rol_code: "CLIENT",
    creado_en: new Date('2024-02-14T10:00:00Z'), // ~9 meses
  },
  {
    nombre: "Julián Ríos",
    email: "julian.rios@mail.cl",
    telefono: "+56988998008",
    rol_code: "CLIENT",
    creado_en: new Date('2024-03-08T15:25:00Z'), // ~8 meses
  },
  
  // === REGULAR USERS (Registrados hace 6-12 meses) ===
  {
    nombre: "Camilo Saavedra",
    email: "camilo.saavedra@mail.cl",
    telefono: "+56999009009",
    rol_code: "CLIENT",
    creado_en: new Date('2024-05-18T12:40:00Z'), // ~6 meses
  },
  {
    nombre: "Renata Fuentes",
    email: "renata.fuentes@mail.cl",
    telefono: "+56910101010",
    rol_code: "CLIENT",
    creado_en: new Date('2024-06-25T09:15:00Z'), // ~5 meses
  },
  {
    nombre: "Paula Méndez",
    email: "paula.mendez@mail.cl",
    telefono: "+56911112011",
    rol_code: "CLIENT",
    creado_en: new Date('2024-07-30T14:50:00Z'), // ~4 meses
  },
  
  // === RECENT USERS (Registrados hace 1-6 meses) ===
  {
    nombre: "Sebastián Torres",
    email: "sebastian.torres@mail.cl",
    telefono: "+56922223012",
    rol_code: "CLIENT",
    creado_en: new Date('2024-09-10T11:20:00Z'), // ~2 meses
  },
  {
    nombre: "Carolina Pinto",
    email: "carolina.pinto@mail.cl",
    telefono: "+56933334013",
    rol_code: "CLIENT",
    creado_en: new Date('2024-10-15T16:30:00Z'), // ~1 mes
  },
  
  // === NEW USERS (Registrados últimos 30 días) ===
  {
    nombre: "Ignacio Ruiz",
    email: "ignacio.ruiz@mail.cl",
    telefono: "+56944445014",
    rol_code: "CLIENT",
    creado_en: new Date('2024-11-05T10:45:00Z'), // ~17 días - Usuario nuevo explorando
  },
];

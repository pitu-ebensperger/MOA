// Usuarios demo con fechas de creación distribuidas en el tiempo (2-12 meses atrás)
// Esto permite tener órdenes realistas con antigüedad coherente
export const CLIENTS = [
  {
    nombre: "Camila Abarca",
    email: "camila.abarca@mail.cl",
    telefono: "+56912341001",
    rol_code: "CLIENT",
    creado_en: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 año atrás
  },
  {
    nombre: "Martín Calvo",
    email: "martin.calvo@mail.cl",
    telefono: "+56922332002",
    rol_code: "CLIENT",
    creado_en: new Date(Date.now() - 320 * 24 * 60 * 60 * 1000), // ~10 meses
  },
  {
    nombre: "Valentina Cruz",
    email: "valentina.cruz@mail.cl",
    telefono: "+56933443003",
    rol_code: "CLIENT",
    creado_en: new Date(Date.now() - 280 * 24 * 60 * 60 * 1000), // ~9 meses
  },
  {
    nombre: "Lucas Herrera",
    email: "lucas.herrera@mail.cl",
    telefono: "+56944554004",
    rol_code: "CLIENT",
    creado_en: new Date(Date.now() - 240 * 24 * 60 * 60 * 1000), // ~8 meses
  },
  {
    nombre: "Isidora Vega",
    email: "isidora.vega@mail.cl",
    telefono: "+56955665005",
    rol_code: "CLIENT",
    creado_en: new Date(Date.now() - 210 * 24 * 60 * 60 * 1000), // ~7 meses
  },
  {
    nombre: "Diego Morales",
    email: "diego.morales@mail.cl",
    telefono: "+56966776006",
    rol_code: "CLIENT",
    creado_en: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // 6 meses
  },
  {
    nombre: "Fernanda Lagos",
    email: "fernanda.lagos@mail.cl",
    telefono: "+56977887007",
    rol_code: "CLIENT",
    creado_en: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000), // 5 meses
  },
  {
    nombre: "Julián Ríos",
    email: "julian.rios@mail.cl",
    telefono: "+56988998008",
    rol_code: "CLIENT",
    creado_en: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), // 4 meses
  },
  {
    nombre: "Camilo Saavedra",
    email: "camilo.saavedra@mail.cl",
    telefono: "+56999009009",
    rol_code: "CLIENT",
    creado_en: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 3 meses
  },
  {
    nombre: "Renata Fuentes",
    email: "renata.fuentes@mail.cl",
    telefono: "+56910101010",
    rol_code: "CLIENT",
    creado_en: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000), // ~2.5 meses
  },
  {
    nombre: "Paula Méndez",
    email: "paula.mendez@mail.cl",
    telefono: "+56911112011",
    rol_code: "CLIENT",
    creado_en: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 2 meses
  },
  {
    nombre: "Sebastián Torres",
    email: "sebastian.torres@mail.cl",
    telefono: "+56922223012",
    rol_code: "CLIENT",
    creado_en: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // ~1.5 meses
  },
  {
    nombre: "Carolina Pinto",
    email: "carolina.pinto@mail.cl",
    telefono: "+56933334013",
    rol_code: "CLIENT",
    creado_en: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 1 mes
  },
  {
    nombre: "Ignacio Ruiz",
    email: "ignacio.ruiz@mail.cl",
    telefono: "+56944445014",
    rol_code: "CLIENT",
    creado_en: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 días
  },
];

import { useState } from "react";
import { StoreSettingsPage } from "./StoreSettingsPage.jsx";

const TABS = [
  { id: "store", label: "Tienda" },
  { id: "general", label: "General" },
  { id: "account", label: "Cuenta" },
];

export default function AdminSettingsPage() {
  // Estado para saber qué tab está activa
  const [activeTab, setActiveTab] = useState("store");

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 lg:py-8">
      {/* Título de la página 
      <header className="mb-6 lg:mb-8">
        <h1 className="text-3xl font-bold text-primary1 mb-2">
          Configuración
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Ajusta las preferencias generales del panel de administración.
        </p>
      </header>
*/}
      {/* Tabs con underline */}
      <div className="border-b border-neutral-200 mb-6">
        <nav
          className="flex gap-4 overflow-x-auto scrollbar-thin scrollbar-none"
          aria-label="Secciones de configuración"
        >
          {TABS.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)} // cambia tab activa
                className={[
                  "relative pb-3 px-1 text-sm font-medium transition-colors",
                  "whitespace-nowrap",
                  isActive
                    ? "text-neutral-900"
                    : "text-neutral-500 hover:text-neutral-800",
                ].join(" ")}
              >
                {/* Label del tab */}
                {tab.label}

                {/* Underline animada del tab activo */}
                <span
                  className={[
                    "pointer-events-none absolute left-0 right-0 -bottom-[1px] h-[2px] rounded-full transition-all",
                    isActive ? "bg-neutral-900" : "bg-transparent",
                  ].join(" ")}
                />
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenido dependiendo del tab activo */}
      <section className="space-y-6">
        {activeTab === "store" && <StoreSettingsPage />}
        {activeTab === "general" && <GeneralSettings />}
        {activeTab === "account" && <AccountSettings />}
      </section>
    </div>
  );
}

/* ----------------- BLOQUES DE CONTENIDO (PLACEHOLDERS) ----------------- */

// Cada bloque lo puedes reemplazar luego por formularios reales.
// La idea es que entiendas la estructura base.

function GeneralSettings() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 lg:p-5 space-y-4">
      <header>
        <h2 className="text-sm font-semibold text-neutral-900">
          Preferencias generales
        </h2>
        <p className="text-xs text-neutral-500">
          Nombre del sitio, moneda por defecto, idioma, etc.
        </p>
      </header>

      {/* Ejemplo de campo simple */}
      <div className="space-y-1">
        <label className="block text-xs font-medium text-neutral-700">
          Nombre del panel
        </label>
        <input
          type="text"
          className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-neutral-800 focus:bg-white"
          placeholder="MOA · Panel Admin"
        />
      </div>
    </div>
  );
}

function AccountSettings() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 lg:p-5 space-y-4">
      <header>
        <h2 className="text-sm font-semibold text-neutral-900">
          Cuenta y seguridad
        </h2>
        <p className="text-xs text-neutral-500">
          Cambia tu nombre, correo y contraseña.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="block text-xs font-medium text-neutral-700">
            Nombre
          </label>
          <input
            type="text"
            className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-neutral-800 focus:bg-white"
            placeholder="Admin MOA"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-neutral-700">
            Correo
          </label>
          <input
            type="email"
            className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-neutral-800 focus:bg-white"
            placeholder="admin@moa.cl"
          />
        </div>
      </div>
    </div>
  );
}

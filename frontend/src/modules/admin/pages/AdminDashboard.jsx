import React from "react";
import AdminSidebar from "@/modules/admin/components/AdminSidebar"
import AdminHeader from "@/modules/admin/components/AdminHeader"
import AdminStatsCard from "@/modules/admin/components/AdminStatsCard"
import AdminTable from "@/modules/admin/components/AdminTable"
import AdminActionButton from "@/modules/admin/components/AdminActionButton"

// Vista principal del Dashboard Admin - MOA Muebles & Decoración
export default function AdminDashboard() {
  // Datos de ejemplo adaptados al negocio de muebles MOA
  const stats = [
    { title: "Catálogo Activo", value: "567", icon: "🪑" },
    { title: "Pedidos Mes", value: "89", icon: "�" },
    { title: "Ingresos Mes", value: "$2.890.450", icon: "💰" },
    { title: "Stock Bajo", value: "12", icon: "⚠️" },
  ];

  // Datos de ejemplo para productos recientes o con necesidad de atención
  const tableColumns = ["SKU", "Producto", "Categoría", "Stock", "Estado"];
  const tableData = [
    { SKU: "MOA-LIV-SOFA-001", Producto: "Sofá Modular Arena", Categoría: "Living", Stock: "6", Estado: "Activo" },
    { SKU: "MOA-DOR-VELA-002", Producto: "Velador Rústico", Categoría: "Dormitorio", Stock: "2", Estado: "Stock Bajo" },
    { SKU: "MOA-COM-MESA-045", Producto: "Mesa Roble Extensible", Categoría: "Comedor", Stock: "8", Estado: "Activo" },
    { SKU: "MOA-ILU-LAMP-023", Producto: "Lámpara Industrial", Categoría: "Iluminación", Stock: "0", Estado: "Sin Stock" },
  ];

  return (
    <div className="flex h-screen bg-moa-neutral-50">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <AdminHeader />

        {/* Área de contenido con scroll */}
        <main className="flex-1 overflow-y-auto p-8">
          {/* Grid de estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, idx) => (
              <AdminStatsCard
                key={idx}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
              />
            ))}
          </div>

          {/* Sección de gestión de inventario MOA */}
          <div className="bg-white rounded-lg shadow p-6 mb-8 border border-moa-neutral-200">
            <h2 className="text-xl font-bold text-moa-neutral-900 mb-4">Gestión Rápida MOA</h2>
            <div className="flex flex-wrap gap-4">
              <AdminActionButton onClick={() => alert("Nuevo Producto")}>
                🪑 Nuevo Producto
              </AdminActionButton>
              <AdminActionButton onClick={() => alert("Gestionar Categorías")}>
                📂 Categorías
              </AdminActionButton>
              <AdminActionButton onClick={() => alert("Control Stock")}>
                📊 Control Stock
              </AdminActionButton>
              <AdminActionButton onClick={() => alert("Reportes Ventas")}>
                📈 Reportes
              </AdminActionButton>
              <AdminActionButton onClick={() => alert("Gestión Envíos")}>
                🚚 Envíos
              </AdminActionButton>
            </div>
          </div>

          {/* Tabla de productos que requieren atención */}
          <div className="bg-white rounded-lg shadow p-6 border border-moa-neutral-200">
            <h2 className="text-xl font-bold text-moa-neutral-900 mb-4">Productos Requieren Atención</h2>
            <AdminTable columns={tableColumns} data={tableData} />
          </div>
        </main>
      </div>
    </div>
  );
}

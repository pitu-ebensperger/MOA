# 🏗️ Flujo Completo: Clientes / Direcciones / Métodos de Pago

## 📊 Estado Actual del Proyecto

### ✅ **Lo que YA existe:**
- ✅ Tabla `usuarios` en base de datos
- ✅ Mock de direcciones en `frontend/src/mocks/database/customers.js`
- ✅ UI básica en `CheckoutPage.jsx`
- ✅ Vista de direcciones en `CustomerDrawer.jsx` (admin)
- ✅ Endpoints de usuarios: `/registro`, `/usuario/:id`

### ❌ **Lo que FALTA implementar:**
- ❌ Tablas de direcciones y métodos de pago en BD
- ❌ Endpoints CRUD para direcciones
- ❌ Endpoints CRUD para métodos de pago
- ❌ UI para gestionar direcciones en perfil de usuario
- ❌ UI para gestionar métodos de pago
- 🚫 Integración con pasarela de pago real (fuera de alcance, se mantiene simulada)

---

## 🗄️ PARTE 1: BASE DE DATOS

### 1.1 Nuevas Tablas (agregar a DDL.sql)

```sql
-- Tabla de Direcciones de Usuario
CREATE TABLE direcciones (
    direccion_id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT REFERENCES usuarios (usuario_id) ON DELETE CASCADE,
    etiqueta TEXT, -- "Casa", "Oficina", "Depto", etc.
    calle TEXT NOT NULL,
    numero TEXT,
    depto_oficina TEXT,
    comuna TEXT NOT NULL,
    ciudad TEXT NOT NULL,
    region TEXT NOT NULL,
    codigo_postal TEXT,
    pais TEXT DEFAULT 'Chile',
    telefono_contacto TEXT,
    instrucciones_entrega TEXT,
    es_predeterminada BOOLEAN DEFAULT FALSE,
    creado_en TIMESTAMPTZ DEFAULT now(),
    actualizado_en TIMESTAMPTZ DEFAULT now()
);

-- Tabla de Métodos de Pago
CREATE TABLE metodos_pago (
    metodo_pago_id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT REFERENCES usuarios (usuario_id) ON DELETE CASCADE,
    tipo TEXT NOT NULL, -- 'tarjeta', 'transferencia', 'webpay', etc.
    
    -- Para tarjetas
    ultimos_digitos TEXT, -- "4242"
    marca TEXT, -- "Visa", "Mastercard", "Amex"
    nombre_titular TEXT,
    mes_expiracion INT,
    anio_expiracion INT,
    
    -- Para otros métodos
    banco TEXT,
    tipo_cuenta TEXT, -- "Corriente", "Vista"
    
    -- Token de pasarela de pago (Transbank, Flow, etc.)
    token_externo TEXT,
    
    es_predeterminado BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMPTZ DEFAULT now(),
    actualizado_en TIMESTAMPTZ DEFAULT now()
);

-- Agregar campos a tabla ordenes
ALTER TABLE ordenes ADD COLUMN direccion_id BIGINT REFERENCES direcciones(direccion_id);
ALTER TABLE ordenes ADD COLUMN metodo_pago_id BIGINT REFERENCES metodos_pago(metodo_pago_id);
ALTER TABLE ordenes ADD COLUMN estado_pago TEXT DEFAULT 'pendiente'; -- 'pendiente', 'pagado', 'fallido', 'reembolsado'
ALTER TABLE ordenes ADD COLUMN estado_envio TEXT DEFAULT 'preparacion'; -- 'preparacion', 'enviado', 'entregado'
ALTER TABLE ordenes ADD COLUMN notas_cliente TEXT;
ALTER TABLE ordenes ADD COLUMN notas_internas TEXT;
ALTER TABLE ordenes ADD COLUMN subtotal_cents INT;
ALTER TABLE ordenes ADD COLUMN envio_cents INT DEFAULT 0;

-- Índices para mejorar rendimiento
CREATE INDEX idx_direcciones_usuario ON direcciones(usuario_id);
CREATE INDEX idx_direcciones_predeterminada ON direcciones(usuario_id, es_predeterminada);
CREATE INDEX idx_metodos_pago_usuario ON metodos_pago(usuario_id);
CREATE INDEX idx_metodos_pago_predeterminado ON metodos_pago(usuario_id, es_predeterminado);
```

---

## 🔌 PARTE 2: BACKEND - ENDPOINTS

### 2.1 Crear Modelo de Direcciones
**Archivo: `backend/src/models/addressModel.js`**

```javascript
import { pool } from "../../database/config.js";

export const addressModel = {
  // Obtener todas las direcciones de un usuario
  async getByUserId(userId) {
    const query = `
      SELECT * FROM direcciones 
      WHERE usuario_id = $1 
      ORDER BY es_predeterminada DESC, creado_en DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  },

  // Obtener dirección predeterminada
  async getDefault(userId) {
    const query = `
      SELECT * FROM direcciones 
      WHERE usuario_id = $1 AND es_predeterminada = TRUE 
      LIMIT 1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
  },

  // Crear nueva dirección
  async create(userId, addressData) {
    const {
      etiqueta,
      calle,
      numero,
      depto_oficina,
      comuna,
      ciudad,
      region,
      codigo_postal,
      pais = 'Chile',
      telefono_contacto,
      instrucciones_entrega,
      es_predeterminada = false
    } = addressData;

    // Si es predeterminada, quitar flag de otras direcciones
    if (es_predeterminada) {
      await pool.query(
        'UPDATE direcciones SET es_predeterminada = FALSE WHERE usuario_id = $1',
        [userId]
      );
    }

    const query = `
      INSERT INTO direcciones (
        usuario_id, etiqueta, calle, numero, depto_oficina, comuna, ciudad, 
        region, codigo_postal, pais, telefono_contacto, instrucciones_entrega, 
        es_predeterminada
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;

    const result = await pool.query(query, [
      userId, etiqueta, calle, numero, depto_oficina, comuna, ciudad, 
      region, codigo_postal, pais, telefono_contacto, instrucciones_entrega, 
      es_predeterminada
    ]);

    return result.rows[0];
  },

  // Actualizar dirección
  async update(addressId, userId, addressData) {
    const {
      etiqueta,
      calle,
      numero,
      depto_oficina,
      comuna,
      ciudad,
      region,
      codigo_postal,
      pais,
      telefono_contacto,
      instrucciones_entrega,
      es_predeterminada
    } = addressData;

    // Si es predeterminada, quitar flag de otras direcciones
    if (es_predeterminada) {
      await pool.query(
        'UPDATE direcciones SET es_predeterminada = FALSE WHERE usuario_id = $1',
        [userId]
      );
    }

    const query = `
      UPDATE direcciones 
      SET etiqueta = COALESCE($3, etiqueta),
          calle = COALESCE($4, calle),
          numero = COALESCE($5, numero),
          depto_oficina = COALESCE($6, depto_oficina),
          comuna = COALESCE($7, comuna),
          ciudad = COALESCE($8, ciudad),
          region = COALESCE($9, region),
          codigo_postal = COALESCE($10, codigo_postal),
          pais = COALESCE($11, pais),
          telefono_contacto = COALESCE($12, telefono_contacto),
          instrucciones_entrega = COALESCE($13, instrucciones_entrega),
          es_predeterminada = COALESCE($14, es_predeterminada),
          actualizado_en = now()
      WHERE direccion_id = $1 AND usuario_id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [
      addressId, userId, etiqueta, calle, numero, depto_oficina, comuna, 
      ciudad, region, codigo_postal, pais, telefono_contacto, 
      instrucciones_entrega, es_predeterminada
    ]);

    return result.rows[0] || null;
  },

  // Establecer como predeterminada
  async setAsDefault(addressId, userId) {
    // Quitar flag de todas
    await pool.query(
      'UPDATE direcciones SET es_predeterminada = FALSE WHERE usuario_id = $1',
      [userId]
    );

    // Establecer nueva predeterminada
    const query = `
      UPDATE direcciones 
      SET es_predeterminada = TRUE, actualizado_en = now()
      WHERE direccion_id = $1 AND usuario_id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [addressId, userId]);
    return result.rows[0] || null;
  },

  // Eliminar dirección
  async delete(addressId, userId) {
    const query = `
      DELETE FROM direcciones 
      WHERE direccion_id = $1 AND usuario_id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [addressId, userId]);
    return result.rows[0] || null;
  }
};
```

### 2.2 Crear Controlador de Direcciones
**Archivo: `backend/src/controllers/addressController.js`**

```javascript
import { addressModel } from "../models/addressModel.js";

// GET /api/direcciones - Obtener direcciones del usuario
export const getUserAddresses = async (req, res) => {
  try {
    const userId = req.user.usuario_id; // Del token JWT
    const addresses = await addressModel.getByUserId(userId);
    
    res.status(200).json({
      success: true,
      count: addresses.length,
      data: addresses
    });
  } catch (error) {
    console.error("Error obteniendo direcciones:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener direcciones"
    });
  }
};

// POST /api/direcciones - Crear nueva dirección
export const createAddress = async (req, res) => {
  try {
    const userId = req.user.usuario_id;
    const addressData = req.body;

    // Validaciones básicas
    if (!addressData.calle || !addressData.comuna || !addressData.ciudad || !addressData.region) {
      return res.status(400).json({
        success: false,
        message: "Faltan campos obligatorios"
      });
    }

    const newAddress = await addressModel.create(userId, addressData);
    
    res.status(201).json({
      success: true,
      message: "Dirección creada exitosamente",
      data: newAddress
    });
  } catch (error) {
    console.error("Error creando dirección:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear dirección"
    });
  }
};

// PATCH /api/direcciones/:id - Actualizar dirección
export const updateAddress = async (req, res) => {
  try {
    const userId = req.user.usuario_id;
    const addressId = req.params.id;
    const addressData = req.body;

    const updated = await addressModel.update(addressId, userId, addressData);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Dirección no encontrada"
      });
    }

    res.status(200).json({
      success: true,
      message: "Dirección actualizada exitosamente",
      data: updated
    });
  } catch (error) {
    console.error("Error actualizando dirección:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar dirección"
    });
  }
};

// PATCH /api/direcciones/:id/predeterminada - Establecer como predeterminada
export const setDefaultAddress = async (req, res) => {
  try {
    const userId = req.user.usuario_id;
    const addressId = req.params.id;

    const updated = await addressModel.setAsDefault(addressId, userId);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Dirección no encontrada"
      });
    }

    res.status(200).json({
      success: true,
      message: "Dirección establecida como predeterminada",
      data: updated
    });
  } catch (error) {
    console.error("Error estableciendo dirección predeterminada:", error);
    res.status(500).json({
      success: false,
      message: "Error al establecer dirección predeterminada"
    });
  }
};

// DELETE /api/direcciones/:id - Eliminar dirección
export const deleteAddress = async (req, res) => {
  try {
    const userId = req.user.usuario_id;
    const addressId = req.params.id;

    const deleted = await addressModel.delete(addressId, userId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Dirección no encontrada"
      });
    }

    res.status(200).json({
      success: true,
      message: "Dirección eliminada exitosamente"
    });
  } catch (error) {
    console.error("Error eliminando dirección:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar dirección"
    });
  }
};
```

### 2.3 Crear Rutas de Direcciones
**Archivo: `backend/routes/addressRoutes.js`**

```javascript
import { Router } from "express";
import {
  getUserAddresses,
  createAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress
} from "../src/controllers/addressController.js";
import { verifyToken } from "../src/middleware/tokenMiddleware.js";

const router = Router();

// Todas las rutas requieren autenticación
router.get("/direcciones", verifyToken, getUserAddresses);
router.post("/direcciones", verifyToken, createAddress);
router.patch("/direcciones/:id", verifyToken, updateAddress);
router.patch("/direcciones/:id/predeterminada", verifyToken, setDefaultAddress);
router.delete("/direcciones/:id", verifyToken, deleteAddress);

export default router;
```

### 2.4 Registrar Rutas en index.js
**Modificar: `backend/index.js`**

```javascript
import addressRoutes from "./routes/addressRoutes.js";

// ... otras rutas ...

app.use("/api", addressRoutes);
```

---

## 🎨 PARTE 3: FRONTEND - UI

### 3.1 Crear Servicio API para Direcciones
**Archivo: `frontend/src/services/address.api.js`**

```javascript
import { apiClient } from "./api-client.js";

export const addressApi = {
  // Obtener todas las direcciones del usuario
  async getAddresses() {
    const response = await apiClient.get("/direcciones");
    return response.data;
  },

  // Crear nueva dirección
  async createAddress(addressData) {
    const response = await apiClient.post("/direcciones", addressData);
    return response.data;
  },

  // Actualizar dirección
  async updateAddress(addressId, addressData) {
    const response = await apiClient.patch(`/direcciones/${addressId}`, addressData);
    return response.data;
  },

  // Establecer como predeterminada
  async setDefaultAddress(addressId) {
    const response = await apiClient.patch(`/direcciones/${addressId}/predeterminada`);
    return response.data;
  },

  // Eliminar dirección
  async deleteAddress(addressId) {
    const response = await apiClient.delete(`/direcciones/${addressId}`);
    return response.data;
  }
};
```

### 3.2 Crear Contexto de Direcciones
**Archivo: `frontend/src/context/AddressContext.jsx`**

```javascript
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./auth-context.js";
import { addressApi } from "../services/address.api.js";

const AddressContext = createContext();

export function AddressProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar direcciones al montar o cuando cambie autenticación
  useEffect(() => {
    if (isAuthenticated) {
      loadAddresses();
    } else {
      setAddresses([]);
      setDefaultAddress(null);
    }
  }, [isAuthenticated]);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await addressApi.getAddresses();
      setAddresses(response.data || []);
      
      const defaultAddr = response.data?.find(addr => addr.es_predeterminada);
      setDefaultAddress(defaultAddr || null);
    } catch (err) {
      console.error("Error cargando direcciones:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addAddress = async (addressData) => {
    try {
      const response = await addressApi.createAddress(addressData);
      await loadAddresses(); // Recargar lista
      return response.data;
    } catch (err) {
      console.error("Error agregando dirección:", err);
      throw err;
    }
  };

  const updateAddress = async (addressId, addressData) => {
    try {
      const response = await addressApi.updateAddress(addressId, addressData);
      await loadAddresses();
      return response.data;
    } catch (err) {
      console.error("Error actualizando dirección:", err);
      throw err;
    }
  };

  const setDefault = async (addressId) => {
    try {
      await addressApi.setDefaultAddress(addressId);
      await loadAddresses();
    } catch (err) {
      console.error("Error estableciendo dirección predeterminada:", err);
      throw err;
    }
  };

  const removeAddress = async (addressId) => {
    try {
      await addressApi.deleteAddress(addressId);
      await loadAddresses();
    } catch (err) {
      console.error("Error eliminando dirección:", err);
      throw err;
    }
  };

  return (
    <AddressContext.Provider
      value={{
        addresses,
        defaultAddress,
        loading,
        error,
        addAddress,
        updateAddress,
        setDefault,
        removeAddress,
        refresh: loadAddresses
      }}
    >
      {children}
    </AddressContext.Provider>
  );
}

export function useAddresses() {
  const context = useContext(AddressContext);
  if (!context) {
    throw new Error("useAddresses debe usarse dentro de AddressProvider");
  }
  return context;
}
```

### 3.3 Componente de Gestión de Direcciones
**Archivo: `frontend/src/modules/profile/components/AddressesSection.jsx`**

```jsx
import { useState } from "react";
import { Plus, MapPin, Trash2, Check, Edit } from "lucide-react";
import { useAddresses } from "../../../context/AddressContext.jsx";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea
} from "../../../components/shadcn/ui/index.js";

export default function AddressesSection() {
  const { addresses, defaultAddress, loading, addAddress, updateAddress, setDefault, removeAddress } = useAddresses();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    etiqueta: "",
    calle: "",
    numero: "",
    depto_oficina: "",
    comuna: "",
    ciudad: "Santiago",
    region: "RM",
    codigo_postal: "",
    telefono_contacto: "",
    instrucciones_entrega: "",
    es_predeterminada: false
  });

  const regiones = [
    { value: "RM", label: "Región Metropolitana" },
    { value: "V", label: "Valparaíso" },
    { value: "VIII", label: "Biobío" },
    // Agregar más regiones...
  ];

  const handleOpenDialog = (address = null) => {
    if (address) {
      setEditingAddress(address);
      setFormData(address);
    } else {
      setEditingAddress(null);
      setFormData({
        etiqueta: "",
        calle: "",
        numero: "",
        depto_oficina: "",
        comuna: "",
        ciudad: "Santiago",
        region: "RM",
        codigo_postal: "",
        telefono_contacto: "",
        instrucciones_entrega: "",
        es_predeterminada: addresses.length === 0 // Primera dirección es predeterminada
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingAddress(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingAddress) {
        await updateAddress(editingAddress.direccion_id, formData);
      } else {
        await addAddress(formData);
      }
      handleCloseDialog();
    } catch (error) {
      alert("Error al guardar la dirección");
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      await setDefault(addressId);
    } catch (error) {
      alert("Error al establecer dirección predeterminada");
    }
  };

  const handleDelete = async (addressId) => {
    if (!confirm("¿Estás seguro de eliminar esta dirección?")) return;
    
    try {
      await removeAddress(addressId);
    } catch (error) {
      alert("Error al eliminar la dirección");
    }
  };

  if (loading) {
    return <div className="py-12 text-center">Cargando direcciones...</div>;
  }

  return (
    <section className="container-px mx-auto max-w-4xl py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="title-serif text-3xl text-(--color-primary1)">
            Mis Direcciones
          </h2>
          <p className="mt-2 text-sm text-(--text-weak)">
            Gestiona tus direcciones de envío
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar dirección
        </Button>
      </div>

      {addresses.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <MapPin className="h-12 w-12 text-(--text-weak)" />
            <div>
              <h3 className="text-lg font-semibold">No tienes direcciones guardadas</h3>
              <p className="text-sm text-(--text-weak)">
                Agrega una dirección para agilizar tus compras
              </p>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              Agregar primera dirección
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <Card key={address.direccion_id} className={address.es_predeterminada ? "border-primary" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <CardTitle className="text-base">{address.etiqueta || "Sin etiqueta"}</CardTitle>
                  </div>
                  {address.es_predeterminada && (
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      Predeterminada
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-(--text-strong)">
                  <p>{address.calle} {address.numero}</p>
                  {address.depto_oficina && <p>{address.depto_oficina}</p>}
                  <p>{address.comuna}, {address.ciudad}</p>
                  <p>{address.region}, Chile</p>
                  {address.codigo_postal && <p>C.P. {address.codigo_postal}</p>}
                </div>

                {address.telefono_contacto && (
                  <p className="text-sm text-(--text-weak)">
                    Tel: {address.telefono_contacto}
                  </p>
                )}

                {address.instrucciones_entrega && (
                  <p className="text-xs text-(--text-weak) italic">
                    "{address.instrucciones_entrega}"
                  </p>
                )}

                <div className="flex gap-2 pt-2">
                  {!address.es_predeterminada && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(address.direccion_id)}
                    >
                      <Check className="mr-1 h-3 w-3" />
                      Predeterminar
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDialog(address)}
                  >
                    <Edit className="mr-1 h-3 w-3" />
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(address.direccion_id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog para Agregar/Editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? "Editar dirección" : "Nueva dirección"}
            </DialogTitle>
            <DialogDescription>
              Completa la información de tu dirección de envío
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Etiqueta (opcional)</Label>
              <Input
                placeholder="Casa, Oficina, Depto..."
                value={formData.etiqueta}
                onChange={(e) => setFormData({ ...formData, etiqueta: e.target.value })}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label required>Calle</Label>
                <Input
                  required
                  placeholder="Av. Providencia"
                  value={formData.calle}
                  onChange={(e) => setFormData({ ...formData, calle: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Número</Label>
                <Input
                  placeholder="1234"
                  value={formData.numero}
                  onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Depto / Oficina</Label>
              <Input
                placeholder="Depto 501"
                value={formData.depto_oficina}
                onChange={(e) => setFormData({ ...formData, depto_oficina: e.target.value })}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label required>Comuna</Label>
                <Input
                  required
                  placeholder="Providencia"
                  value={formData.comuna}
                  onChange={(e) => setFormData({ ...formData, comuna: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label required>Ciudad</Label>
                <Input
                  required
                  placeholder="Santiago"
                  value={formData.ciudad}
                  onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label required>Región</Label>
                <Select
                  value={formData.region}
                  onValueChange={(value) => setFormData({ ...formData, region: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {regiones.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Código Postal</Label>
                <Input
                  placeholder="7500000"
                  value={formData.codigo_postal}
                  onChange={(e) => setFormData({ ...formData, codigo_postal: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Teléfono de contacto</Label>
              <Input
                type="tel"
                placeholder="+56 9 1234 5678"
                value={formData.telefono_contacto}
                onChange={(e) => setFormData({ ...formData, telefono_contacto: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Instrucciones de entrega</Label>
              <Textarea
                placeholder="Ej: Tocar timbre del segundo piso..."
                value={formData.instrucciones_entrega}
                onChange={(e) => setFormData({ ...formData, instrucciones_entrega: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="predeterminada"
                checked={formData.es_predeterminada}
                onChange={(e) => setFormData({ ...formData, es_predeterminada: e.target.checked })}
              />
              <Label htmlFor="predeterminada" className="cursor-pointer">
                Establecer como dirección predeterminada
              </Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingAddress ? "Guardar cambios" : "Agregar dirección"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
```

### 3.4 Integrar en ProfilePage

Modificar `frontend/src/modules/profile/pages/ProfilePage.jsx`:

```jsx
import AddressesSection from '../components/AddressesSection.jsx';

export const ProfilePage = () => {
  return (
    <div>
      <UserInfoSection />
      <AddressesSection />  {/* Nueva sección */}
      <WishlistSection />
      <OrderSection />
    </div>
  );
};
```

### 3.5 Agregar Provider en App.jsx

```jsx
import { AddressProvider } from './context/AddressContext.jsx';

function App() {
  return (
    <AuthProvider>
      <AddressProvider>  {/* Nuevo provider */}
        {/* resto de la app */}
      </AddressProvider>
    </AuthProvider>
  );
}
```

---

## 🔄 PARTE 4: FLUJO COMPLETO

### Flujo del Usuario:

1. **Registro/Login** → Usuario se autentica
2. **Navegar a Perfil** → Ve sección "Mis Direcciones" vacía
3. **Agregar Dirección** → Click en "Agregar dirección"
   - Completa formulario
   - Marca como predeterminada (opcional)
   - Guarda
4. **Ver Direcciones** → Lista sus direcciones guardadas
5. **Editar/Eliminar** → Puede modificar o borrar direcciones
6. **Checkout** → Al comprar, puede:
   - Seleccionar dirección existente
   - O agregar nueva dirección al vuelo

### Flujo del Checkout (Modificar CheckoutPage):

```jsx
import { useAddresses } from "../../../context/AddressContext.jsx";

export const CheckoutPage = () => {
  const { addresses, defaultAddress } = useAddresses();
  const [selectedAddress, setSelectedAddress] = useState(null);

  useEffect(() => {
    if (defaultAddress) {
      setSelectedAddress(defaultAddress.direccion_id);
    }
  }, [defaultAddress]);

  return (
    // ... 
    // Selector de dirección en lugar de inputs manuales
    <Select value={selectedAddress} onValueChange={setSelectedAddress}>
      <SelectTrigger>
        <SelectValue placeholder="Selecciona una dirección" />
      </SelectTrigger>
      <SelectContent>
        {addresses.map((addr) => (
          <SelectItem key={addr.direccion_id} value={addr.direccion_id}>
            {addr.etiqueta} - {addr.calle} {addr.numero}, {addr.comuna}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    // ...
  );
};
```

---

## 💳 PARTE 5: MÉTODOS DE PAGO (Similar a Direcciones)

El flujo de métodos de pago es idéntico al de direcciones, pero con estos campos:

- Tipo (tarjeta, transferencia, webpay)
- Últimos 4 dígitos de tarjeta
- Marca (Visa, Mastercard)
- Fecha de expiración
- Token de pasarela de pago

**Archivos a crear:**
- `backend/src/models/paymentMethodModel.js`
- `backend/src/controllers/paymentMethodController.js`
- `backend/routes/paymentMethodRoutes.js`
- `frontend/src/services/paymentMethod.api.js`
- `frontend/src/context/PaymentMethodContext.jsx`
- `frontend/src/modules/profile/components/PaymentMethodsSection.jsx`

---

## 🚀 ORDEN DE IMPLEMENTACIÓN

1. ✅ **Crear tablas en base de datos** (DDL.sql)
2. ✅ **Backend - Direcciones:**
   - Modelo
   - Controlador
   - Rutas
   - Registrar en index.js
3. ✅ **Frontend - Direcciones:**
   - Servicio API
   - Contexto
   - Componente UI
   - Integrar en ProfilePage
4. 🔄 **Repetir pasos 2-3 para Métodos de Pago**
5. 🔄 **Modificar CheckoutPage** para usar direcciones guardadas
6. 🔄 **Integrar pasarela de pago** (Transbank, Flow, etc.)

---

## 📝 NOTAS IMPORTANTES

- ⚠️ **Seguridad:** Nunca guardar datos completos de tarjetas, solo tokens de pasarelas
- ⚠️ **Validación:** Agregar validaciones robustas en backend
- ⚠️ **UX:** Permitir checkout como invitado (sin guardar datos)
- ⚠️ **Testing:** Probar flujos con y sin direcciones guardadas

---

¿Quieres que genere alguno de estos archivos en específico para que puedas empezar a implementar?

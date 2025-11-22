import { pool } from '../config.js';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

const generateOrderCode = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

async function seedMoreData() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('🌱 Agregando más usuarios, direcciones, órdenes y wishlist items...\n');
    
    // 1. Agregar más usuarios (15 usuarios nuevos)
    const passwordHash = await bcrypt.hash('cliente123', 10);
    const newUsers = [];
    
    for (let i = 1; i <= 15; i++) {
      const userId = `cliente${12 + i}`;
      // Generar fechas de creación distribuidas entre 2-6 meses atrás
      const daysAgo = 60 + Math.floor(Math.random() * 120); // 60-180 días
      const createdDate = new Date();
      createdDate.setDate(createdDate.getDate() - daysAgo);
      
      const result = await client.query(
        `INSERT INTO usuarios (public_id, nombre, email, telefono, password_hash, rol_code, status, creado_en)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (email) DO NOTHING
         RETURNING usuario_id, email`,
        [
          nanoid(12),
          `Cliente ${12 + i}`,
          `cliente${12 + i}@demo.cl`,
          `+569 ${Math.floor(10000000 + Math.random() * 90000000)}`,
          passwordHash,
          'CLIENT',
          'activo',
          createdDate
        ]
      );
      if (result.rows.length > 0) {
        newUsers.push(result.rows[0]);
        console.log(`✓ Usuario: ${result.rows[0].email}`);
      }
    }
    
    // 2. Obtener todos los usuarios para asignar direcciones
    const allUsersResult = await client.query(
      `SELECT usuario_id FROM usuarios WHERE rol_code = 'CLIENT' ORDER BY usuario_id`
    );
    const allUserIds = allUsersResult.rows.map(r => r.usuario_id);
    
    // 3. Agregar direcciones a usuarios que no tienen (al menos 1 dirección por usuario)
    const usersWithAddresses = await client.query(
      `SELECT DISTINCT usuario_id FROM direcciones`
    );
    const userIdsWithAddresses = new Set(usersWithAddresses.rows.map(r => r.usuario_id));
    
    const comunas = ['Santiago Centro', 'Providencia', 'Las Condes', 'Ñuñoa', 'La Florida', 'Maipú', 'Puente Alto', 'Viña del Mar', 'Valparaíso', 'Concepción'];
    const calles = ['Los Aromos', 'Los Jazmines', 'Las Rosas', 'San Martín', 'O\'Higgins', 'Arturo Prat', 'Bernardo O\'Higgins', 'Manuel Montt', 'Pedro de Valdivia', 'Providencia'];
    
    for (const userId of allUserIds) {
      if (!userIdsWithAddresses.has(userId)) {
        const comuna = comunas[Math.floor(Math.random() * comunas.length)];
        const calle = calles[Math.floor(Math.random() * calles.length)];
        const numero = Math.floor(100 + Math.random() * 9900);
        
        await client.query(
          `INSERT INTO direcciones (usuario_id, nombre_contacto, telefono_contacto, calle, numero, comuna, ciudad, region, codigo_postal, es_predeterminada)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            userId,
            `Casa`,
            `+569${Math.floor(10000000 + Math.random() * 90000000)}`,
            calle,
            numero.toString(),
            comuna,
            'Santiago',
            'Región Metropolitana',
            `${Math.floor(1000000 + Math.random() * 9000000)}`,
            true
          ]
        );
        console.log(`✓ Dirección para usuario ID: ${userId}`);
      }
    }
    
    // 4. Obtener productos para órdenes
    const productsResult = await client.query(
      `SELECT producto_id, precio_cents FROM productos WHERE status = 'activo' ORDER BY RANDOM() LIMIT 33`
    );
    const products = productsResult.rows;
    
    // 5. Crear más órdenes (30 órdenes nuevas con diferentes estados y fechas)
    const estados_pago = ['pendiente', 'procesando', 'pagado', 'fallido'];
    const estados_envio = ['preparacion', 'enviado', 'en_transito', 'entregado', 'devuelto'];
    const estados_orden = ['draft', 'confirmed', 'cancelled'];
    const metodos_pago = ['transferencia', 'tarjeta', 'efectivo'];
    const metodos_despacho = ['standard', 'express'];
    
    // Generar órdenes distribuidas en los últimos 90 días
    const now = new Date();
    
    for (let i = 0; i < 30; i++) {
      const userId = allUserIds[Math.floor(Math.random() * allUserIds.length)];
      
      // Obtener dirección del usuario
      const addressResult = await client.query(
        `SELECT direccion_id FROM direcciones WHERE usuario_id = $1 LIMIT 1`,
        [userId]
      );
      
      if (addressResult.rows.length === 0) continue;
      
      const direccionId = addressResult.rows[0].direccion_id;
      
      // Fecha aleatoria en los últimos 90 días
      const daysAgo = Math.floor(Math.random() * 90);
      const orderDate = new Date(now);
      orderDate.setDate(orderDate.getDate() - daysAgo);
      
      // Seleccionar estado basado en antigüedad (órdenes más antiguas tienen más probabilidad de estar completadas)
      let estadoPago, estadoEnvio, estadoOrden;
      
      if (daysAgo > 60) {
        estadoPago = 'pagado';
        estadoEnvio = Math.random() > 0.3 ? 'entregado' : 'en_transito';
        estadoOrden = 'confirmed';
      } else if (daysAgo > 30) {
        estadoPago = Math.random() > 0.2 ? 'pagado' : 'procesando';
        estadoEnvio = ['enviado', 'en_transito', 'entregado'][Math.floor(Math.random() * 3)];
        estadoOrden = 'confirmed';
      } else if (daysAgo > 7) {
        estadoPago = ['procesando', 'pagado'][Math.floor(Math.random() * 2)];
        estadoEnvio = ['preparacion', 'enviado', 'en_transito'][Math.floor(Math.random() * 3)];
        estadoOrden = 'confirmed';
      } else {
        estadoPago = estados_pago[Math.floor(Math.random() * estados_pago.length)];
        estadoEnvio = estados_envio[Math.floor(Math.random() * 3)]; // Solo preparacion, enviado, en_transito para recientes
        estadoOrden = estados_orden[Math.floor(Math.random() * estados_orden.length)];
      }
      
      // Calcular subtotal (2-5 productos por orden)
      const numItems = 2 + Math.floor(Math.random() * 4);
      const orderProducts = [];
      let subtotal = 0;
      
      for (let j = 0; j < numItems; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const cantidad = 1 + Math.floor(Math.random() * 3);
        orderProducts.push({ ...product, cantidad });
        subtotal += product.precio_cents * cantidad;
      }
      
      const metodoDespaco = metodos_despacho[Math.floor(Math.random() * metodos_despacho.length)];
      const envioCents = metodoDespaco === 'express' ? 6900 : 0;
      const totalCents = subtotal + envioCents;
      
      // Insertar orden
      const orderResult = await client.query(
        `INSERT INTO ordenes (
          order_code, usuario_id, direccion_id, metodo_pago, subtotal_cents, 
          envio_cents, total_cents, metodo_despacho, estado_pago, estado_envio, 
          estado_orden, creado_en, fecha_pago, fecha_envio, fecha_entrega_real,
          numero_seguimiento, empresa_envio
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING orden_id, order_code`,
        [
          generateOrderCode(),
          userId,
          direccionId,
          metodos_pago[Math.floor(Math.random() * metodos_pago.length)],
          subtotal,
          envioCents,
          totalCents,
          metodoDespaco,
          estadoPago,
          estadoEnvio,
          estadoOrden,
          orderDate.toISOString(),
          estadoPago === 'pagado' ? new Date(orderDate.getTime() + 3600000).toISOString() : null,
          estadoEnvio !== 'preparacion' ? new Date(orderDate.getTime() + 86400000).toISOString() : null,
          estadoEnvio === 'entregado' ? new Date(orderDate.getTime() + 259200000).toISOString() : null,
          estadoEnvio !== 'preparacion' ? `TRACK${Math.floor(100000 + Math.random() * 900000)}` : null,
          estadoEnvio !== 'preparacion' ? ['Chilexpress', 'Starken', 'Blue Express'][Math.floor(Math.random() * 3)] : null
        ]
      );
      
      const ordenId = orderResult.rows[0].orden_id;
      
      // Insertar items de la orden
      for (const product of orderProducts) {
        await client.query(
          `INSERT INTO orden_items (orden_id, producto_id, cantidad, precio_unit)
           VALUES ($1, $2, $3, $4)`,
          [ordenId, product.producto_id, product.cantidad, product.precio_cents]
        );
      }
      
      console.log(`✓ Orden ${orderResult.rows[0].order_code} - ${estadoOrden} - ${estadoPago} - ${estadoEnvio} - ${numItems} items`);
    }
    
    // 6. Agregar más items a wishlists existentes y crear nuevas
    const wishlistsResult = await client.query(
      `SELECT wishlist_id, usuario_id FROM wishlists`
    );
    
    // Agregar items a wishlists existentes
    for (const wishlist of wishlistsResult.rows) {
      const numNewItems = 2 + Math.floor(Math.random() * 4);
      
      for (let i = 0; i < numNewItems; i++) {
        const product = products[Math.floor(Math.random() * products.length)];
        
        await client.query(
          `INSERT INTO wishlist_items (wishlist_id, producto_id)
           VALUES ($1, $2)
           ON CONFLICT (wishlist_id, producto_id) DO NOTHING`,
          [wishlist.wishlist_id, product.producto_id]
        );
      }
    }
    
    // Crear wishlists para usuarios sin wishlist (max 10 más)
    const usersWithoutWishlist = await client.query(
      `SELECT u.usuario_id 
       FROM usuarios u
       LEFT JOIN wishlists w ON u.usuario_id = w.usuario_id
       WHERE w.wishlist_id IS NULL AND u.rol_code = 'CLIENT'
       LIMIT 10`
    );
    
    for (const user of usersWithoutWishlist.rows) {
      const wishlistResult = await client.query(
        `INSERT INTO wishlists (usuario_id) VALUES ($1) RETURNING wishlist_id`,
        [user.usuario_id]
      );
      
      const wishlistId = wishlistResult.rows[0].wishlist_id;
      const numItems = 1 + Math.floor(Math.random() * 5);
      
      for (let i = 0; i < numItems; i++) {
        const product = products[Math.floor(Math.random() * products.length)];
        
        await client.query(
          `INSERT INTO wishlist_items (wishlist_id, producto_id)
           VALUES ($1, $2)
           ON CONFLICT (wishlist_id, producto_id) DO NOTHING`,
          [wishlistId, product.producto_id]
        );
      }
      
      console.log(`✓ Wishlist creada para usuario ID: ${user.usuario_id} con ${numItems} items`);
    }
    
    await client.query('COMMIT');
    
    // Mostrar resumen final
    console.log('\n📊 Resumen final:');
    const summaryResult = await client.query(`
      SELECT 'usuarios' as tabla, COUNT(*) as total FROM usuarios
      UNION ALL SELECT 'direcciones', COUNT(*) FROM direcciones
      UNION ALL SELECT 'ordenes', COUNT(*) FROM ordenes
      UNION ALL SELECT 'orden_items', COUNT(*) FROM orden_items
      UNION ALL SELECT 'wishlists', COUNT(*) FROM wishlists
      UNION ALL SELECT 'wishlist_items', COUNT(*) FROM wishlist_items
      ORDER BY tabla
    `);
    
    console.table(summaryResult.rows);
    
    console.log('\n Seed completado exitosamente!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(' Error durante el seed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedMoreData().catch(console.error);

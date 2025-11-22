import request from 'supertest';
import jwt from 'jsonwebtoken';
import { pool } from '../database/config.js';

let app;

beforeAll(async () => {
  const appMod = await import('../index.js');
  app = appMod.default;
});

afterAll(async () => {
  await pool.end();
});

// Utilidades de setup
async function ensureTestUser() {
  const email = 'stock-test-user@moa.cl';
  const { rows } = await pool.query('SELECT usuario_id FROM usuarios WHERE email = $1', [email]);
  if (rows.length) return rows[0].usuario_id;
  
  const insert = await pool.query(
    `INSERT INTO usuarios (public_id, nombre, email, telefono, password_hash, rol_code, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING usuario_id`,
    ['stocktest1', 'Stock Test User', email, '+56933333333', '$2a$10$abcdefghijklmnopqrstuv', 'CLIENT', 'activo']
  );
  return insert.rows[0].usuario_id;
}

async function ensureTestProduct(sku, initialStock = 10) {
  const { rows } = await pool.query('SELECT producto_id FROM productos WHERE sku = $1', [sku]);
  if (rows.length) {
    // Actualizar stock al valor inicial para el test
    await pool.query('UPDATE productos SET stock = $1 WHERE sku = $2', [initialStock, sku]);
    return rows[0].producto_id;
  }
  
  const insert = await pool.query(
    `INSERT INTO productos (public_id, nombre, slug, sku, precio_cents, stock, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING producto_id`,
    ['stocktest1', 'Test Product Stock', 'test-product-stock', sku, 5000, initialStock, 'activo']
  );
  return insert.rows[0].producto_id;
}

async function ensureTestAddress(usuarioId) {
  const { rows } = await pool.query(
    'SELECT direccion_id FROM direcciones WHERE usuario_id = $1 LIMIT 1',
    [usuarioId]
  );
  if (rows.length) return rows[0].direccion_id;
  
  const insert = await pool.query(
    `INSERT INTO direcciones (usuario_id, nombre_contacto, telefono_contacto, calle, numero, comuna, ciudad, region, es_predeterminada)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING direccion_id`,
    [usuarioId, 'Test User', '+56933333333', 'Calle Test', '123', 'Santiago', 'Santiago', 'Región Metropolitana', true]
  );
  return insert.rows[0].direccion_id;
}

async function clearUserCart(usuarioId) {
  await pool.query(
    'DELETE FROM carrito_items WHERE carrito_id IN (SELECT carrito_id FROM carritos WHERE usuario_id = $1)',
    [usuarioId]
  );
}

async function addItemToCart(usuarioId, productoId, cantidad) {
  // Asegurar que existe el carrito
  let { rows } = await pool.query(
    'SELECT carrito_id FROM carritos WHERE usuario_id = $1',
    [usuarioId]
  );
  
  let carritoId;
  if (rows.length === 0) {
    const insert = await pool.query(
      'INSERT INTO carritos (usuario_id) VALUES ($1) RETURNING carrito_id',
      [usuarioId]
    );
    carritoId = insert.rows[0].carrito_id;
  } else {
    carritoId = rows[0].carrito_id;
  }
  
  // Obtener precio del producto
  const { rows: productRows } = await pool.query(
    'SELECT precio_cents FROM productos WHERE producto_id = $1',
    [productoId]
  );
  const precioCents = productRows[0]?.precio_cents || 5000;
  
  // Agregar item con precio
  await pool.query(
    `INSERT INTO carrito_items (carrito_id, producto_id, cantidad, precio_unit)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (carrito_id, producto_id) DO UPDATE SET cantidad = $3, precio_unit = $4`,
    [carritoId, productoId, cantidad, precioCents]
  );
}

function signToken(usuarioId, roleCode = 'CLIENT') {
  const payload = { 
    id: usuarioId, 
    email: 'test@example.com', 
    role_code: roleCode, 
    rol: roleCode 
  };
  return jwt.sign(payload, (process.env.JWT_SECRET || 'mysecretkey').trim(), { expiresIn: '1h' });
}

describe('Order Stock Validation Tests', () => {
  let usuarioId;
  let productoId;
  let direccionId;
  let token;

  beforeAll(async () => {
    usuarioId = await ensureTestUser();
    productoId = await ensureTestProduct('STOCK-TEST-001', 10);
    direccionId = await ensureTestAddress(usuarioId);
    token = signToken(usuarioId);
  });

  beforeEach(async () => {
    // Reset stock a 10 antes de cada test
    await pool.query('UPDATE productos SET stock = $1 WHERE producto_id = $2', [10, productoId]);
    await clearUserCart(usuarioId);
  });

  describe('Stock Validation', () => {
    test('200 - Orden exitosa con stock suficiente', async () => {
      await addItemToCart(usuarioId, productoId, 5);
      
      const res = await request(app)
        .post('/api/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send({
          direccion_id: direccionId,
          metodo_despacho: 'standard',
          metodo_pago: 'transferencia'
        });
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('orden_id');
      
      // Verificar que el stock se descontó
      const { rows } = await pool.query('SELECT stock FROM productos WHERE producto_id = $1', [productoId]);
      expect(rows[0].stock).toBe(5); // 10 - 5 = 5
    });

    test('400 - Stock insuficiente', async () => {
      await addItemToCart(usuarioId, productoId, 15); // Más que el stock disponible (10)
      
      const res = await request(app)
        .post('/api/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send({
          direccion_id: direccionId,
          metodo_despacho: 'standard',
          metodo_pago: 'transferencia'
        });
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/stock insuficiente/i);
      
      // Verificar que el stock NO se descontó
      const { rows } = await pool.query('SELECT stock FROM productos WHERE producto_id = $1', [productoId]);
      expect(rows[0].stock).toBe(10); // Sin cambios
    });

    test('400 - Stock exacto (límite)', async () => {
      await addItemToCart(usuarioId, productoId, 10); // Exactamente el stock disponible
      
      const res = await request(app)
        .post('/api/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send({
          direccion_id: direccionId,
          metodo_despacho: 'standard',
          metodo_pago: 'transferencia'
        });
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      
      // Verificar que el stock quedó en 0
      const { rows } = await pool.query('SELECT stock FROM productos WHERE producto_id = $1', [productoId]);
      expect(rows[0].stock).toBe(0);
    });

    test('400 - Stock cero', async () => {
      // Poner stock en 0
      await pool.query('UPDATE productos SET stock = 0 WHERE producto_id = $1', [productoId]);
      await addItemToCart(usuarioId, productoId, 1);
      
      const res = await request(app)
        .post('/api/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send({
          direccion_id: direccionId,
          metodo_despacho: 'standard',
          metodo_pago: 'transferencia'
        });
      
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/stock insuficiente/i);
    });

    test('Stock se mantiene si transacción falla', async () => {
      await addItemToCart(usuarioId, productoId, 5);
      
      // Crear orden con dirección inválida (null) para forzar error
      const res = await request(app)
        .post('/api/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send({
          direccion_id: null,
          metodo_despacho: 'standard', // Requiere dirección
          metodo_pago: 'transferencia'
        });
      
      expect(res.status).toBe(400);
      
      // Verificar que el stock NO se descontó (rollback)
      const { rows } = await pool.query('SELECT stock FROM productos WHERE producto_id = $1', [productoId]);
      expect(rows[0].stock).toBe(10);
    });
  });

  describe('Race Conditions Prevention', () => {
    test('Dos órdenes simultáneas con stock limitado', async () => {
      // Setup: Stock de 10, dos usuarios quieren comprar 6 cada uno
      const usuario2Id = await pool.query(
        `INSERT INTO usuarios (public_id, nombre, email, telefono, password_hash, rol_code, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING usuario_id`,
        [`stocktest2-${Date.now()}`, 'Stock Test User 2', `stock-test-user2-${Date.now()}@moa.cl`, '+56944444444', '$2a$10$abcdefghijklmnopqrstuv', 'CLIENT', 'activo']
      ).then(r => r.rows[0].usuario_id);
      
      const direccion2Id = await ensureTestAddress(usuario2Id);
      const token2 = signToken(usuario2Id);
      
      // Agregar 6 items al carrito de cada usuario
      await addItemToCart(usuarioId, productoId, 6);
      await addItemToCart(usuario2Id, productoId, 6);
      
      // Ejecutar dos requests simultáneos
      const [res1, res2] = await Promise.all([
        request(app)
          .post('/api/checkout')
          .set('Authorization', `Bearer ${token}`)
          .send({
            direccion_id: direccionId,
            metodo_despacho: 'standard',
            metodo_pago: 'transferencia'
          }),
        request(app)
          .post('/api/checkout')
          .set('Authorization', `Bearer ${token2}`)
          .send({
            direccion_id: direccion2Id,
            metodo_despacho: 'standard',
            metodo_pago: 'transferencia'
          })
      ]);
      
      // Uno debe tener éxito (201) y el otro debe fallar (400)
      const statuses = [res1.status, res2.status].sort();
      expect(statuses).toEqual([201, 400]);
      
      // Verificar que el stock quedó en 4 (10 - 6 = 4)
      const { rows } = await pool.query('SELECT stock FROM productos WHERE producto_id = $1', [productoId]);
      expect(rows[0].stock).toBe(4);
      
      // Verificar que solo se creó una orden
      const successRes = res1.status === 201 ? res1 : res2;
      const failRes = res1.status === 400 ? res1 : res2;
      
      expect(successRes.body.success).toBe(true);
      expect(failRes.body.message).toMatch(/stock insuficiente/i);
    });

    test('Tres órdenes simultáneas con stock para dos', async () => {
      // Setup: Stock de 10, tres usuarios quieren comprar 5 cada uno
      const timestamp = Date.now();
      const users = await Promise.all([
        pool.query(
          `INSERT INTO usuarios (public_id, nombre, email, telefono, password_hash, rol_code, status)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING usuario_id`,
          [`stocktest3-${timestamp}`, 'User 3', `stock-test-user3-${timestamp}@moa.cl`, '+56955555555', '$2a$10$abc', 'CLIENT', 'activo']
        ).then(r => r.rows[0].usuario_id),
        pool.query(
          `INSERT INTO usuarios (public_id, nombre, email, telefono, password_hash, rol_code, status)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING usuario_id`,
          [`stocktest4-${timestamp}`, 'User 4', `stock-test-user4-${timestamp}@moa.cl`, '+56966666666', '$2a$10$abc', 'CLIENT', 'activo']
        ).then(r => r.rows[0].usuario_id),
        pool.query(
          `INSERT INTO usuarios (public_id, nombre, email, telefono, password_hash, rol_code, status)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING usuario_id`,
          [`stocktest5-${timestamp}`, 'User 5', `stock-test-user5-${timestamp}@moa.cl`, '+56977777777', '$2a$10$abc', 'CLIENT', 'activo']
        ).then(r => r.rows[0].usuario_id)
      ]);
      
      const addresses = await Promise.all(users.map(uid => ensureTestAddress(uid)));
      const tokens = users.map(uid => signToken(uid));
      
      // Agregar items a los carritos
      await Promise.all(users.map(uid => addItemToCart(uid, productoId, 5)));
      
      // Ejecutar tres requests simultáneos
      const responses = await Promise.all(
        tokens.map((token, i) => 
          request(app)
            .post('/api/checkout')
            .set('Authorization', `Bearer ${token}`)
            .send({
              direccion_id: addresses[i],
              metodo_despacho: 'standard',
              metodo_pago: 'transferencia'
            })
        )
      );
      
      const statuses = responses.map(r => r.status).sort();
      const successCount = statuses.filter(s => s === 201).length;
      const failCount = statuses.filter(s => s === 400).length;
      
      // Exactamente 2 deben tener éxito y 1 debe fallar
      expect(successCount).toBe(2);
      expect(failCount).toBe(1);
      
      // Stock debe estar en 0 (10 - 5 - 5 = 0)
      const { rows } = await pool.query('SELECT stock FROM productos WHERE producto_id = $1', [productoId]);
      expect(rows[0].stock).toBe(0);
    });
  });

  describe('Cart Cleanup on Transaction Rollback', () => {
    test('Carrito NO se limpia si orden falla', async () => {
      await addItemToCart(usuarioId, productoId, 5);
      
      // Forzar error con método de pago inválido
      const res = await request(app)
        .post('/api/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send({
          direccion_id: direccionId,
          metodo_despacho: 'standard',
          metodo_pago: 'metodo_invalido'
        });
      
      expect(res.status).toBe(400);
      
      // Verificar que el carrito todavía tiene items
      const { rows } = await pool.query(
        `SELECT ci.cantidad FROM carrito_items ci
         JOIN carritos c ON ci.carrito_id = c.carrito_id
         WHERE c.usuario_id = $1 AND ci.producto_id = $2`,
        [usuarioId, productoId]
      );
      
      expect(rows.length).toBe(1);
      expect(rows[0].cantidad).toBe(5);
    });

    test('Carrito se limpia si orden exitosa', async () => {
      await addItemToCart(usuarioId, productoId, 5);
      
      const res = await request(app)
        .post('/api/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send({
          direccion_id: direccionId,
          metodo_despacho: 'standard',
          metodo_pago: 'transferencia'
        });
      
      expect(res.status).toBe(201);
      
      // Verificar que el carrito está vacío
      const { rows } = await pool.query(
        `SELECT COUNT(*) as count FROM carrito_items ci
         JOIN carritos c ON ci.carrito_id = c.carrito_id
         WHERE c.usuario_id = $1`,
        [usuarioId]
      );
      
      expect(parseInt(rows[0].count)).toBe(0);
    });
  });
});

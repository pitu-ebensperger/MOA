/**
 * Tests de validación de stock y race conditions
 * Verifica descuento de stock, locks, y concurrencia
 */

import { pool } from '../database/config.js';
import orderModel from '../src/models/orderModel.js';
import { nanoid } from 'nanoid';

describe('Stock Validation Tests', () => {
  let testProductId;
  let testUserId;
  let testAddressId;
  
  beforeAll(async () => {
    // Crear usuario de prueba
    const userResult = await pool.query(
      `INSERT INTO usuarios (public_id, nombre, email, password_hash, rol_code)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING usuario_id`,
      [nanoid(), 'Test Stock User', `stock-test-${Date.now()}@test.com`, 'hash', 'CLIENT']
    );
    testUserId = userResult.rows[0].usuario_id;
    
    // Crear dirección de prueba
    const addressResult = await pool.query(
      `INSERT INTO direcciones (usuario_id, nombre_contacto, telefono_contacto, calle, numero, comuna, ciudad, region)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING direccion_id`,
      [testUserId, 'Test Contact', '123456789', 'Test St', '123', 'Test Comuna', 'Test City', 'Región Metropolitana']
    );
    testAddressId = addressResult.rows[0].direccion_id;
    
    // Crear categoría de prueba
    const categoryResult = await pool.query(
      `INSERT INTO categorias (nombre, slug)
       VALUES ($1, $2)
       ON CONFLICT (slug) DO UPDATE SET nombre = EXCLUDED.nombre
       RETURNING categoria_id`,
      ['Test Category', 'test-stock-category']
    );
    const testCategoryId = categoryResult.rows[0].categoria_id;
    
    // Crear producto de prueba con stock=10
    const productResult = await pool.query(
      `INSERT INTO productos (public_id, categoria_id, nombre, slug, sku, precio_cents, stock, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING producto_id`,
      [nanoid(), testCategoryId, 'Test Product Stock', `test-stock-${Date.now()}`, `SKU-${Date.now()}`, 10000, 10, 'activo']
    );
    testProductId = productResult.rows[0].producto_id;
  });
  
  afterAll(async () => {
    // Limpiar datos de prueba
    if (testUserId) {
      await pool.query('DELETE FROM orden_items WHERE orden_id IN (SELECT orden_id FROM ordenes WHERE usuario_id = $1)', [testUserId]);
      await pool.query('DELETE FROM ordenes WHERE usuario_id = $1', [testUserId]);
      await pool.query('DELETE FROM direcciones WHERE usuario_id = $1', [testUserId]);
      await pool.query('DELETE FROM carrito_items WHERE carrito_id IN (SELECT carrito_id FROM carritos WHERE usuario_id = $1)', [testUserId]);
      await pool.query('DELETE FROM carritos WHERE usuario_id = $1', [testUserId]);
      await pool.query('DELETE FROM usuarios WHERE usuario_id = $1', [testUserId]);
    }
    if (testProductId) {
      await pool.query('DELETE FROM productos WHERE producto_id = $1', [testProductId]);
    }
    await pool.query('DELETE FROM categorias WHERE slug = $1', ['test-stock-category']);
  });
  
  test('Debe descontar stock al crear orden', async () => {
    // Obtener stock inicial
    const initialStock = await pool.query('SELECT stock FROM productos WHERE producto_id = $1', [testProductId]);
    expect(initialStock.rows[0].stock).toBe(10);
    
    // Crear orden con 3 unidades
    const orderData = {
      usuario_id: testUserId,
      direccion_id: testAddressId,
      metodo_despacho: 'standard',
      metodo_pago: 'transferencia',
      subtotal_cents: 30000,
      envio_cents: 0,
      total_cents: 30000,
      items: [
        {
          producto_id: testProductId,
          cantidad: 3,
          precio_unit: 10000
        }
      ]
    };
    
    const order = await orderModel.createOrder(orderData);
    expect(order).toBeDefined();
    expect(order.orden_id).toBeDefined();
    
    // Verificar que stock se descontó
    const finalStock = await pool.query('SELECT stock FROM productos WHERE producto_id = $1', [testProductId]);
    expect(finalStock.rows[0].stock).toBe(7); // 10 - 3 = 7
  });
  
  test('Debe rechazar orden si stock insuficiente', async () => {
    // Stock actual = 7 (después del test anterior)
    const orderData = {
      usuario_id: testUserId,
      direccion_id: testAddressId,
      metodo_despacho: 'standard',
      metodo_pago: 'transferencia',
      subtotal_cents: 100000,
      envio_cents: 0,
      total_cents: 100000,
      items: [
        {
          producto_id: testProductId,
          cantidad: 10, // Intentar comprar 10 cuando solo hay 7
          precio_unit: 10000
        }
      ]
    };
    
    await expect(orderModel.createOrder(orderData)).rejects.toThrow(/Stock insuficiente/);
    
    // Verificar que stock NO cambió
    const finalStock = await pool.query('SELECT stock FROM productos WHERE producto_id = $1', [testProductId]);
    expect(finalStock.rows[0].stock).toBe(7); // Debe seguir en 7
  });
  
  test('Debe hacer rollback de stock si transacción falla', async () => {
    const currentStock = await pool.query('SELECT stock FROM productos WHERE producto_id = $1', [testProductId]);
    const initialStock = currentStock.rows[0].stock;
    
    // Intentar crear orden con producto_id inválido (causará error)
    const orderData = {
      usuario_id: testUserId,
      direccion_id: testAddressId,
      metodo_despacho: 'standard',
      metodo_pago: 'transferencia',
      subtotal_cents: 20000,
      envio_cents: 0,
      total_cents: 20000,
      items: [
        {
          producto_id: testProductId,
          cantidad: 2,
          precio_unit: 10000
        },
        {
          producto_id: 999999, // Producto inexistente
          cantidad: 1,
          precio_unit: 10000
        }
      ]
    };
    
    await expect(orderModel.createOrder(orderData)).rejects.toThrow();
    
    // Verificar que stock NO cambió (rollback exitoso)
    const finalStock = await pool.query('SELECT stock FROM productos WHERE producto_id = $1', [testProductId]);
    expect(finalStock.rows[0].stock).toBe(initialStock);
  });
  
  test('Race condition: SELECT FOR UPDATE previene compras simultáneas', async () => {
    // Resetear stock a 5 para esta prueba
    await pool.query('UPDATE productos SET stock = $1 WHERE producto_id = $2', [5, testProductId]);
    
    // Simular 3 usuarios intentando comprar 2 unidades simultáneamente
    // Agregar delay entre requests para evitar colisión de order_code
    const orderPromises = [];
    for (let i = 0; i < 3; i++) {
      await new Promise(resolve => setTimeout(resolve, 10)); // 10ms delay
      const orderData = {
        usuario_id: testUserId,
        direccion_id: testAddressId,
        metodo_despacho: 'standard',
        metodo_pago: 'transferencia',
        subtotal_cents: 20000,
        envio_cents: 0,
        total_cents: 20000,
        items: [
          {
            producto_id: testProductId,
            cantidad: 2,
            precio_unit: 10000
          }
        ]
      };
      orderPromises.push(orderModel.createOrder(orderData));
    }
    
    // Ejecutar todas las órdenes simultáneamente
    const results = await Promise.allSettled(orderPromises);
    
    // Contar cuántas órdenes se crearon exitosamente
    const successfulOrders = results.filter(r => r.status === 'fulfilled').length;
    const failedOrders = results.filter(r => r.status === 'rejected').length;
    
    // Solo 2 órdenes deben ser exitosas (2*2=4 unidades), la 3ra debe fallar
    expect(successfulOrders).toBe(2);
    expect(failedOrders).toBe(1);
    
    // Verificar stock final = 1 (5 - 4 = 1)
    const finalStock = await pool.query('SELECT stock FROM productos WHERE producto_id = $1', [testProductId]);
    expect(finalStock.rows[0].stock).toBe(1);
    
    // Verificar que al menos una orden falló por stock o constraint
    const failedOrder = results.find(r => r.status === 'rejected');
    expect(failedOrder).toBeDefined();
    expect(failedOrder.reason.message).toMatch(/Stock insuficiente|duplicate key/);
  });
  
  test('Debe permitir múltiples órdenes secuenciales hasta agotar stock', async () => {
    // Resetear stock a 6
    await pool.query('UPDATE productos SET stock = $1 WHERE producto_id = $2', [6, testProductId]);
    
    // Crear 3 órdenes de 2 unidades cada una (secuenciales)
    for (let i = 0; i < 3; i++) {
      const orderData = {
        usuario_id: testUserId,
        direccion_id: testAddressId,
        metodo_despacho: 'standard',
        metodo_pago: 'transferencia',
        subtotal_cents: 20000,
        envio_cents: 0,
        total_cents: 20000,
        items: [
          {
            producto_id: testProductId,
            cantidad: 2,
            precio_unit: 10000
          }
        ]
      };
      
      const order = await orderModel.createOrder(orderData);
      expect(order).toBeDefined();
    }
    
    // Verificar stock final = 0
    const finalStock = await pool.query('SELECT stock FROM productos WHERE producto_id = $1', [testProductId]);
    expect(finalStock.rows[0].stock).toBe(0);
    
    // Intentar crear una orden más debe fallar
    const orderData = {
      usuario_id: testUserId,
      direccion_id: testAddressId,
      metodo_despacho: 'standard',
      metodo_pago: 'transferencia',
      subtotal_cents: 10000,
      envio_cents: 0,
      total_cents: 10000,
      items: [
        {
          producto_id: testProductId,
          cantidad: 1,
          precio_unit: 10000
        }
      ]
    };
    
    await expect(orderModel.createOrder(orderData)).rejects.toThrow(/Stock insuficiente/);
  });
  
  test('Debe validar stock para múltiples productos en una orden', async () => {
    // Crear segundo producto
    const product2Result = await pool.query(
      `INSERT INTO productos (public_id, categoria_id, nombre, slug, sku, precio_cents, stock, status)
       VALUES ($1, (SELECT categoria_id FROM categorias WHERE slug = 'test-stock-category'), $2, $3, $4, $5, $6, $7)
       RETURNING producto_id`,
      [nanoid(), 'Test Product 2', `test-stock-2-${Date.now()}`, `SKU2-${Date.now()}`, 5000, 3, 'activo']
    );
    const product2Id = product2Result.rows[0].producto_id;
    
    // Resetear stock producto 1
    await pool.query('UPDATE productos SET stock = $1 WHERE producto_id = $2', [5, testProductId]);
    
    // Intentar orden con producto 1 (OK) y producto 2 sin stock suficiente
    const orderData = {
      usuario_id: testUserId,
      direccion_id: testAddressId,
      metodo_despacho: 'standard',
      metodo_pago: 'transferencia',
      subtotal_cents: 35000,
      envio_cents: 0,
      total_cents: 35000,
      items: [
        {
          producto_id: testProductId,
          cantidad: 2,
          precio_unit: 10000
        },
        {
          producto_id: product2Id,
          cantidad: 5, // Solo hay 3 en stock
          precio_unit: 5000
        }
      ]
    };
    
    await expect(orderModel.createOrder(orderData)).rejects.toThrow(/Stock insuficiente/);
    
    // Verificar que NINGÚN stock cambió (rollback completo)
    const stock1 = await pool.query('SELECT stock FROM productos WHERE producto_id = $1', [testProductId]);
    const stock2 = await pool.query('SELECT stock FROM productos WHERE producto_id = $1', [product2Id]);
    expect(stock1.rows[0].stock).toBe(5);
    expect(stock2.rows[0].stock).toBe(3);
    
    // Limpiar producto 2
    await pool.query('DELETE FROM productos WHERE producto_id = $1', [product2Id]);
  });
});

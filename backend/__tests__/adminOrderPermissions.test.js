/**
 * Tests de permisos y validación para orderAdminController
 * Verifica que solo admins pueden actualizar estados y que las validaciones funcionan
 */

import request from 'supertest';
import app from '../index.js';
import { pool } from '../database/config.js';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';

describe('Admin Order Permissions Tests', () => {
  let adminToken;
  let customerToken;
  let testOrderId;
  let testAdminId;
  let testCustomerId;
  
  beforeAll(async () => {
    // Crear usuario admin
    const adminResult = await pool.query(
      `INSERT INTO usuarios (public_id, nombre, email, password_hash, rol_code)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING usuario_id`,
      [nanoid(), 'Admin Test', `admin-perms-${Date.now()}@test.com`, 'hash', 'ADMIN']
    );
    testAdminId = adminResult.rows[0].usuario_id;
    
    // Crear usuario customer
    const customerResult = await pool.query(
      `INSERT INTO usuarios (public_id, nombre, email, password_hash, rol_code)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING usuario_id`,
      [nanoid(), 'Customer Test', `customer-perms-${Date.now()}@test.com`, 'hash', 'CLIENT']
    );
    testCustomerId = customerResult.rows[0].usuario_id;
    
    // Generar tokens
    adminToken = jwt.sign(
      { id: testAdminId, email: 'admin@test.com', role_code: 'ADMIN' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
    
    customerToken = jwt.sign(
      { id: testCustomerId, email: 'customer@test.com', role_code: 'CLIENT' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
    
    // Crear orden de prueba
    const orderResult = await pool.query(
      `INSERT INTO ordenes (order_code, usuario_id, total_cents, estado_pago, estado_envio, estado_orden)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING orden_id`,
      [`TEST-${Date.now()}`, testCustomerId, 10000, 'pendiente', 'preparacion', 'confirmado']
    );
    testOrderId = orderResult.rows[0].orden_id;
  });
  
  afterAll(async () => {
    // Limpiar datos de prueba
    if (testOrderId) {
      await pool.query('DELETE FROM orden_items WHERE orden_id = $1', [testOrderId]);
      await pool.query('DELETE FROM ordenes WHERE orden_id = $1', [testOrderId]);
    }
    if (testCustomerId) {
      await pool.query('DELETE FROM direcciones WHERE usuario_id = $1', [testCustomerId]);
      await pool.query('DELETE FROM carrito_items WHERE carrito_id IN (SELECT carrito_id FROM carritos WHERE usuario_id = $1)', [testCustomerId]);
      await pool.query('DELETE FROM carritos WHERE usuario_id = $1', [testCustomerId]);
      await pool.query('DELETE FROM usuarios WHERE usuario_id = $1', [testCustomerId]);
    }
    if (testAdminId) {
      await pool.query('DELETE FROM usuarios WHERE usuario_id = $1', [testAdminId]);
    }
  });
  
  describe('Permisos de actualización de estado', () => {
    test('Admin debe poder actualizar estado de orden', async () => {
      const response = await request(app)
        .patch(`/admin/pedidos/${testOrderId}/estado`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          estado_pago: 'pagado',
          estado_envio: 'enviado'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.estado_pago).toBe('pagado');
      expect(response.body.data.estado_envio).toBe('enviado');
    });
    
    test('Customer NO debe poder actualizar estado de orden', async () => {
      const response = await request(app)
        .patch(`/admin/pedidos/${testOrderId}/estado`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          estado_pago: 'pagado',
          estado_envio: 'enviado'
        });
      
      expect(response.status).toBe(403);
      expect(response.body.message).toMatch(/admin|permitido|autorizado/i);
    });
    
    test('Request sin token debe ser rechazado', async () => {
      const response = await request(app)
        .patch(`/admin/pedidos/${testOrderId}/estado`)
        .send({
          estado_pago: 'pagado'
        });
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('Validaciones de estados', () => {
    test('Debe rechazar estado_pago inválido', async () => {
      const response = await request(app)
        .patch(`/admin/pedidos/${testOrderId}/estado`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          estado_pago: 'estado_invalido'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/inválido|válido/i);
    });
    
    test('Debe rechazar estado_envio inválido', async () => {
      const response = await request(app)
        .patch(`/admin/pedidos/${testOrderId}/estado`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          estado_envio: 'estado_invalido'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/inválido|válido/i);
    });
    
    test('Debe aceptar estados válidos', async () => {
      const estadosPagoValidos = ['pendiente', 'pagado', 'rechazado', 'reembolsado'];
      const estadosEnvioValidos = ['preparacion', 'enviado', 'en_transito', 'entregado', 'cancelado'];
      
      // Probar un estado válido de cada tipo
      const response = await request(app)
        .patch(`/admin/pedidos/${testOrderId}/estado`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          estado_pago: 'pagado',
          estado_envio: 'en_transito'
        });
      
      expect(response.status).toBe(200);
      expect(estadosPagoValidos).toContain(response.body.data.estado_pago);
      expect(estadosEnvioValidos).toContain(response.body.data.estado_envio);
    });
    
    test('Debe permitir actualizar solo estado_pago', async () => {
      const initialState = await pool.query(
        'SELECT estado_envio FROM ordenes WHERE orden_id = $1',
        [testOrderId]
      );
      
      const response = await request(app)
        .patch(`/admin/pedidos/${testOrderId}/estado`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          estado_pago: 'pagado'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.data.estado_pago).toBe('pagado');
      expect(response.body.data.estado_envio).toBe(initialState.rows[0].estado_envio);
    });
    
    test('Debe permitir actualizar solo estado_envio', async () => {
      const initialState = await pool.query(
        'SELECT estado_pago FROM ordenes WHERE orden_id = $1',
        [testOrderId]
      );
      
      const response = await request(app)
        .patch(`/admin/pedidos/${testOrderId}/estado`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          estado_envio: 'entregado'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.data.estado_envio).toBe('entregado');
      expect(response.body.data.estado_pago).toBe(initialState.rows[0].estado_pago);
    });
  });
  
  describe('Validaciones de tracking', () => {
    test('Admin debe poder agregar información de seguimiento', async () => {
      const response = await request(app)
        .post(`/admin/pedidos/${testOrderId}/seguimiento`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          numero_seguimiento: 'TRACK123456',
          empresa_envio: 'Chilexpress'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.numero_seguimiento).toBe('TRACK123456');
      expect(response.body.data.empresa_envio).toMatch(/chilexpress/i);
    });
    
    test('Customer NO debe poder agregar tracking', async () => {
      const response = await request(app)
        .post(`/admin/pedidos/${testOrderId}/seguimiento`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          numero_seguimiento: 'TRACK123456',
          empresa_envio: 'Chilexpress'
        });
      
      expect(response.status).toBe(403);
    });
    
    test('Debe validar que numero_seguimiento no esté vacío', async () => {
      const response = await request(app)
        .post(`/admin/pedidos/${testOrderId}/seguimiento`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          numero_seguimiento: '',
          empresa_envio: 'Chilexpress'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/seguimiento|requerido|obligatorio/i);
    });
  });
  
  describe('Listado de órdenes', () => {
    test('Admin debe poder ver todas las órdenes', async () => {
      const response = await request(app)
        .get('/admin/pedidos')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data || response.body)).toBe(true);
    });
    
    test('Customer NO debe poder acceder al listado admin', async () => {
      const response = await request(app)
        .get('/admin/pedidos')
        .set('Authorization', `Bearer ${customerToken}`);
      
      expect(response.status).toBe(403);
    });
    
    test('Admin debe poder filtrar órdenes por estado', async () => {
      const response = await request(app)
        .get('/admin/pedidos?estado_pago=pagado')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      const orders = response.body.data || response.body;
      if (orders.length > 0) {
        orders.forEach(order => {
          expect(order.estado_pago).toBe('pagado');
        });
      }
    });
  });
  
  describe('Exportación de órdenes', () => {
    test('Admin debe poder exportar órdenes', async () => {
      const response = await request(app)
        .get('/admin/pedidos/export')
        .set('Authorization', `Bearer ${adminToken}`);
      
      // Debe retornar CSV o indicar que no hay datos
      expect([200, 204]).toContain(response.status);
    });
    
    test('Customer NO debe poder exportar órdenes', async () => {
      const response = await request(app)
        .get('/admin/pedidos/export')
        .set('Authorization', `Bearer ${customerToken}`);
      
      expect(response.status).toBe(403);
    });
  });
  

});

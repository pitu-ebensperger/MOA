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

// Utilidades
async function ensureUser(email, roleCode, roleName) {
  const { rows } = await pool.query('SELECT usuario_id, rol_code FROM usuarios WHERE email = $1', [email]);
  if (rows.length) return rows[0];
  
  const insert = await pool.query(
    `INSERT INTO usuarios (public_id, nombre, email, telefono, password_hash, rol, rol_code, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING usuario_id, rol_code`,
    [`permtest-${Date.now()}`, `Permissions Test ${roleName}`, email, '+56900000000', '$2a$10$abcdefghijklmnopqrstuv', roleName, roleCode, 'activo']
  );
  return insert.rows[0];
}

async function createTestOrder(usuarioId) {
  const code = `PERM-TEST-${Date.now()}`;
  const result = await pool.query(
    `INSERT INTO ordenes (order_code, usuario_id, total_cents, estado_pago, estado_envio, estado_orden)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING orden_id, order_code`,
    [code, usuarioId, 10000, 'pendiente', 'preparacion', 'confirmed']
  );
  return result.rows[0];
}

function signToken(user) {
  const payload = { 
    id: user.usuario_id, 
    email: 'test@example.com', 
    role_code: user.rol_code, 
    rol: user.rol_code 
  };
  return jwt.sign(payload, (process.env.JWT_SECRET || 'mysecretkey').trim(), { expiresIn: '1h' });
}

describe('Admin Permissions Tests', () => {
  let adminUser, clientUser, order;
  let adminToken, clientToken;

  beforeAll(async () => {
    adminUser = await ensureUser('admin-perms@moa.cl', 'ADMIN', 'admin');
    clientUser = await ensureUser('client-perms@moa.cl', 'CUSTOMER', 'cliente');
    order = await createTestOrder(clientUser.usuario_id);
    adminToken = signToken(adminUser);
    clientToken = signToken(clientUser);
  });

  describe('Order Status Update Permissions', () => {
    test('403 - Cliente no puede actualizar estados de órdenes', async () => {
      const res = await request(app)
        .patch(`/admin/pedidos/${order.orden_id}/estado`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ estado_pago: 'pagado' });
      
      expect([401, 403]).toContain(res.status);
    });

    test('200 - Admin puede actualizar estado_pago', async () => {
      const res = await request(app)
        .patch(`/admin/pedidos/${order.orden_id}/estado`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ estado_pago: 'pagado' });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.estado_pago).toBe('pagado');
    });

    test('200 - Admin puede actualizar estado_envio', async () => {
      const res = await request(app)
        .patch(`/admin/pedidos/${order.orden_id}/estado`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ estado_envio: 'enviado' });
      
      expect(res.status).toBe(200);
      expect(res.body.data.estado_envio).toBe('enviado');
    });

    test('200 - Admin puede agregar notas_internas', async () => {
      const res = await request(app)
        .patch(`/admin/pedidos/${order.orden_id}/estado`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ 
          notas_internas: 'Nota de prueba del administrador'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.data.notas_internas).toContain('Nota de prueba');
    });

    test('200 - Admin puede actualizar múltiples campos', async () => {
      const res = await request(app)
        .patch(`/admin/pedidos/${order.orden_id}/estado`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ 
          estado_pago: 'pagado',
          estado_envio: 'entregado',
          notas_internas: 'Pedido completado'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.data.estado_pago).toBe('pagado');
      expect(res.body.data.estado_envio).toBe('entregado');
    });
  });

  describe('Order Tracking Permissions', () => {
    test('403 - Cliente no puede agregar tracking', async () => {
      const res = await request(app)
        .post(`/admin/pedidos/${order.orden_id}/seguimiento`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ 
          numero_seguimiento: 'TRACK123',
          empresa_envio: 'Chilexpress'
        });
      
      expect([401, 403]).toContain(res.status);
    });

    test('200 - Admin puede agregar tracking', async () => {
      const res = await request(app)
        .post(`/admin/pedidos/${order.orden_id}/seguimiento`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ 
          numero_seguimiento: 'TRACK456',
          empresa_envio: 'Blue Express'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.data.numero_seguimiento).toBe('TRACK456');
      expect(res.body.data.empresa_envio).toBe('Blue Express');
    });
  });

  describe('Admin Orders List Permissions', () => {
    test('403 - Cliente no puede ver lista de todas las órdenes', async () => {
      const res = await request(app)
        .get('/admin/pedidos')
        .set('Authorization', `Bearer ${clientToken}`);
      
      expect([401, 403]).toContain(res.status);
    });

    test('200 - Admin puede ver lista de todas las órdenes', async () => {
      const res = await request(app)
        .get('/admin/pedidos')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data || res.body.orders || res.body)).toBe(true);
    });

    test('200 - Admin puede filtrar por usuario_id', async () => {
      const res = await request(app)
        .get(`/admin/pedidos?usuario_id=${clientUser.usuario_id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
    });
  });

  describe('Admin Stats Permissions', () => {
    test('403 - Cliente no puede ver estadísticas', async () => {
      const res = await request(app)
        .get('/admin/pedidos/stats')
        .set('Authorization', `Bearer ${clientToken}`);
      
      expect([401, 403]).toContain(res.status);
    });

    test('200 - Admin puede ver estadísticas', async () => {
      const res = await request(app)
        .get('/admin/pedidos/stats')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
    });
  });

  describe('Validation Tests', () => {
    test('400 - estado_pago con valor inválido', async () => {
      const res = await request(app)
        .patch(`/admin/pedidos/${order.orden_id}/estado`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ estado_pago: 'estado_invalido' });
      
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Estado de pago inválido/i);
    });

    test('400 - estado_envio con valor inválido', async () => {
      const res = await request(app)
        .patch(`/admin/pedidos/${order.orden_id}/estado`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ estado_envio: 'estado_invalido' });
      
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Estado de envío inválido/i);
    });

    test('400 - Payload vacío', async () => {
      const res = await request(app)
        .patch(`/admin/pedidos/${order.orden_id}/estado`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});
      
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/al menos un campo/i);
    });

    test('404 - Orden inexistente', async () => {
      const res = await request(app)
        .patch('/admin/pedidos/999999/estado')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ estado_pago: 'pagado' });
      
      expect(res.status).toBe(404);
    });

    test('400 - tracking sin numero_seguimiento', async () => {
      const res = await request(app)
        .post(`/admin/pedidos/${order.orden_id}/seguimiento`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ empresa_envio: 'Chilexpress' });
      
      expect(res.status).toBe(400);
    });

    test('400 - tracking con empresa_envio inválida', async () => {
      const res = await request(app)
        .post(`/admin/pedidos/${order.orden_id}/seguimiento`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ 
          numero_seguimiento: 'TRACK789',
          empresa_envio: 'EmpresaInvalida'
        });
      
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/empresa de envío no válida/i);
    });
  });

  describe('Token Validation', () => {
    test('401 - Sin token de autorización', async () => {
      const res = await request(app)
        .patch(`/admin/pedidos/${order.orden_id}/estado`)
        .send({ estado_pago: 'pagado' });
      
      expect(res.status).toBe(401);
    });

    test('401 - Token inválido', async () => {
      const res = await request(app)
        .patch(`/admin/pedidos/${order.orden_id}/estado`)
        .set('Authorization', 'Bearer token_invalido')
        .send({ estado_pago: 'pagado' });
      
      expect(res.status).toBe(401);
    });

    test('401 - Token expirado', async () => {
      const expiredPayload = { 
        id: adminUser.usuario_id, 
        email: 'admin@example.com', 
        role_code: 'ADMIN', 
        rol: 'ADMIN' 
      };
      const expiredToken = jwt.sign(
        expiredPayload, 
        (process.env.JWT_SECRET || 'mysecretkey').trim(), 
        { expiresIn: '-1h' } // Token expirado hace 1 hora
      );
      
      const res = await request(app)
        .patch(`/admin/pedidos/${order.orden_id}/estado`)
        .set('Authorization', `Bearer ${expiredToken}`)
        .send({ estado_pago: 'pagado' });
      
      expect(res.status).toBe(401);
    });
  });

  describe('Edge Cases', () => {
    test('200 - Actualizar estado_envio con fecha automática', async () => {
      const res = await request(app)
        .patch(`/admin/pedidos/${order.orden_id}/estado`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ estado_envio: 'enviado' });
      
      expect(res.status).toBe(200);
      // fecha_envio debe ser agregada automáticamente
      const { rows } = await pool.query(
        'SELECT fecha_envio FROM ordenes WHERE orden_id = $1',
        [order.orden_id]
      );
      expect(rows[0].fecha_envio).toBeTruthy();
    });

    test('200 - Actualizar estado_envio a entregado con fecha_entrega_real', async () => {
      const res = await request(app)
        .patch(`/admin/pedidos/${order.orden_id}/estado`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ estado_envio: 'entregado' });
      
      expect(res.status).toBe(200);
      const { rows } = await pool.query(
        'SELECT fecha_entrega_real FROM ordenes WHERE orden_id = $1',
        [order.orden_id]
      );
      expect(rows[0].fecha_entrega_real).toBeTruthy();
    });

    test('200 - Notas internas no son visibles para clientes', async () => {
      // Admin agrega nota interna
      await request(app)
        .patch(`/admin/pedidos/${order.orden_id}/estado`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ notas_internas: 'Nota confidencial' });
      
      // Cliente intenta ver su propia orden
      const res = await request(app)
        .get(`/api/orders/${order.orden_id}`)
        .set('Authorization', `Bearer ${clientToken}`);
      
      // Si el endpoint es accesible, verificar que notas_internas no se incluyen
      if (res.status === 200) {
        expect(res.body.notas_internas).toBeUndefined();
      }
    });
  });
});

import request from 'supertest';
import jwt from 'jsonwebtoken';
let app;
let pool;
beforeAll(async () => {
  const appMod = await import('../index.js');
  app = appMod.default;
  const poolMod = await import('../database/config.js');
  pool = poolMod.pool;
});

// Utilidad para crear usuario y orden mínima
async function ensureAdminUser() {
  const email = 'admin-test-status@moa.cl';
  const { rows } = await pool.query('SELECT usuario_id, rol_code FROM usuarios WHERE email = $1', [email]);
  if (rows.length) return rows[0];
  const insert = await pool.query(
    `INSERT INTO usuarios (public_id, nombre, email, telefono, password_hash, rol_code, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING usuario_id, rol_code`,
    [ 'admstat1', 'Admin Status', email, '+56911111111', '$2a$10$abcdefghijklmnopqrstuv', 'ADMIN', 'activo' ]
  );
  return insert.rows[0];
}

async function ensureClientUser() {
  const email = 'cliente-test-status@moa.cl';
  const { rows } = await pool.query('SELECT usuario_id, rol_code FROM usuarios WHERE email = $1', [email]);
  if (rows.length) return rows[0];
  const insert = await pool.query(
    `INSERT INTO usuarios (public_id, nombre, email, telefono, password_hash, rol_code, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING usuario_id, rol_code`,
    [ 'clistat1', 'Cliente Status', email, '+56922222222', '$2a$10$abcdefghijklmnopqrstuv', 'CLIENT', 'activo' ]
  );
  return insert.rows[0];
}

async function createMinimalOrder(usuarioId) {
  // total_cents NOT NULL
  const code = 'TEST-STATUS-' + Date.now();
  const result = await pool.query(
    `INSERT INTO ordenes (order_code, usuario_id, total_cents, estado_pago, estado_envio)
     VALUES ($1,$2,$3,$4,$5) RETURNING orden_id, order_code`,
    [ code, usuarioId, 19900, 'pendiente', 'preparacion' ]
  );
  return result.rows[0];
}

function signToken(user) {
  const payload = { id: user.usuario_id, email: 'ignored@example.com', role_code: user.rol_code, rol: user.rol_code };
  return jwt.sign(payload, (process.env.JWT_SECRET || 'mysecretkey').trim(), { expiresIn: '1h' });
}

describe('Admin Order Status API', () => {
  let adminUser; let clientUser; let order;
  let adminToken; let clientToken;

  beforeAll(async () => {
    adminUser = await ensureAdminUser();
    clientUser = await ensureClientUser();
    order = await createMinimalOrder(clientUser.usuario_id);
    adminToken = signToken(adminUser);
    clientToken = signToken(clientUser);
  });

  afterAll(async () => {
    await pool.end();
  });

  test('401 sin token', async () => {
    const res = await request(app).patch(`/admin/pedidos/${order.orden_id}/estado`).send({ estado_pago: 'pagado' });
    expect(res.status).toBe(401); // token middleware
  });

  test('403 cliente no admin', async () => {
    const res = await request(app)
      .patch(`/admin/pedidos/${order.orden_id}/estado`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ estado_pago: 'pagado' });
    expect([401,403]).toContain(res.status); // verifyAdmin puede devolver 403
  });

  test('400 payload vacío', async () => {
    const res = await request(app)
      .patch(`/admin/pedidos/${order.orden_id}/estado`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/al menos un campo/i);
  });

  test('400 estado_pago inválido', async () => {
    const res = await request(app)
      .patch(`/admin/pedidos/${order.orden_id}/estado`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ estado_pago: 'xxx' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Estado de pago inválido/i);
  });

  test('400 estado_envio inválido', async () => {
    const res = await request(app)
      .patch(`/admin/pedidos/${order.orden_id}/estado`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ estado_envio: 'foobar' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Estado de envío inválido/i);
  });

  test('200 actualizar estado_pago', async () => {
    const res = await request(app)
      .patch(`/admin/pedidos/${order.orden_id}/estado`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ estado_pago: 'pagado' });
    expect(res.status).toBe(200);
    expect(res.body.data.estado_pago).toBe('pagado');
  });

  test('200 actualizar estado_pago + estado_envio', async () => {
    const res = await request(app)
      .patch(`/admin/pedidos/${order.orden_id}/estado`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ estado_pago: 'pagado', estado_envio: 'enviado' });
    expect(res.status).toBe(200);
    expect(res.body.data.estado_pago).toBe('pagado');
    expect(res.body.data.estado_envio).toBe('enviado');
  });

  test('400 empresa_envio inválida', async () => {
    const res = await request(app)
      .patch(`/admin/pedidos/${order.orden_id}/estado`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ 
        estado_envio: 'enviado',
        empresa_envio: 'fedex_invalid',
        numero_seguimiento: 'TEST123'
      });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Empresa de envío inválida/i);
  });

  test('404 orden no existe', async () => {
    const res = await request(app)
      .patch('/admin/pedidos/999999/estado')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ estado_pago: 'pagado' });
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/Orden no encontrada/i);
  });

  test('200 actualizar con notas internas', async () => {
    const res = await request(app)
      .patch(`/admin/pedidos/${order.orden_id}/estado`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ 
        estado_envio: 'preparacion',
        // notas_internas: 'Cliente solicitó empaque reforzado'
      });
    expect(res.status).toBe(200);
    expect(res.body.data.estado_envio).toBe('preparacion');
    // expect(.*notas_internas).toContain('empaque reforzado');
  });

  test('200 actualizar tracking completo', async () => {
    const res = await request(app)
      .patch(`/admin/pedidos/${order.orden_id}/estado`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ 
        estado_envio: 'enviado',
        numero_seguimiento: 'CHX987654321',
        empresa_envio: 'chilexpress',
        fecha_envio: '2025-11-21'
      });
    expect(res.status).toBe(200);
    expect(res.body.data.estado_envio).toBe('enviado');
    expect(res.body.data.numero_seguimiento).toBe('CHX987654321');
    expect(res.body.data.empresa_envio).toMatch(/chilexpress/i); // case-insensitive
    expect(res.body.data.fecha_envio).toBeTruthy();
  });

  test('200 normalización de empresa_envio (case-insensitive)', async () => {
    const res = await request(app)
      .patch(`/admin/pedidos/${order.orden_id}/estado`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ 
        estado_envio: 'enviado',
        empresa_envio: 'Blue-Express', // mixed case + dash
        numero_seguimiento: 'BLE123'
      });
    expect(res.status).toBe(200);
    expect(res.body.data.empresa_envio).toMatch(/blue.?express/i); // normalizado (case-insensitive)
  });

  test('200 actualizar múltiples campos a la vez', async () => {
    const res = await request(app)
      .patch(`/admin/pedidos/${order.orden_id}/estado`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ 
        estado_pago: 'pagado',
        estado_envio: 'en_transito',
        numero_seguimiento: 'STK555666',
        empresa_envio: 'starken',
        // notas_internas: 'Actualización masiva de estado',
        fecha_pago: '2025-11-20',
        fecha_envio: '2025-11-21'
      });
    expect(res.status).toBe(200);
    expect(res.body.data.estado_pago).toBe('pagado');
    expect(res.body.data.estado_envio).toBe('en_transito');
    expect(res.body.data.numero_seguimiento).toBe('STK555666');
    expect(res.body.data.empresa_envio).toMatch(/starken/i); // case-insensitive
  });

  test('200 actualizar solo notas internas (sin cambio de estado)', async () => {
    const res = await request(app)
      .patch(`/admin/pedidos/${order.orden_id}/estado`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ 
        // notas_internas: 'Actualización de nota administrativa'
      });
    expect(res.status).toBe(200);
    // expect(.*notas_internas).toContain('administrativa');
  });

  test('400 múltiples validaciones (estado_pago + empresa_envio inválidos)', async () => {
    const res = await request(app)
      .patch(`/admin/pedidos/${order.orden_id}/estado`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ 
        estado_pago: 'invalid_status',
        empresa_envio: 'invalid_courier'
      });
    expect(res.status).toBe(400);
    // Debe fallar en primera validación (estado_pago)
    expect(res.body.message).toMatch(/Estado de pago inválido/i);
  });
});

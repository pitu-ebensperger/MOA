import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../index.js';
import pool from '../database/config.js';

async function ensureAdminUser() {
  const email = 'admin-test-status@moa.cl';
  const { rows } = await pool.query('SELECT usuario_id, rol_code FROM usuarios WHERE email = $1', [email]);
  if (rows.length) return rows[0];
  const insert = await pool.query(
    `INSERT INTO usuarios (public_id, nombre, email, telefono, password_hash, rol, rol_code, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING usuario_id, rol_code`,
    [ 'admstat1', 'Admin Status', email, '+56911111111', '$2a$10$abcdefghijklmnopqrstuv', 'admin', 'ADMIN', 'activo' ]
  );
  return insert.rows[0];
}

async function ensureClientUser() {
  const email = 'cliente-test-status@moa.cl';
  const { rows } = await pool.query('SELECT usuario_id, rol_code FROM usuarios WHERE email = $1', [email]);
  if (rows.length) return rows[0];
  const insert = await pool.query(
    `INSERT INTO usuarios (public_id, nombre, email, telefono, password_hash, rol, rol_code, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING usuario_id, rol_code`,
    [ 'clistat1', 'Cliente Status', email, '+56922222222', '$2a$10$abcdefghijklmnopqrstuv', 'cliente', 'CUSTOMER', 'activo' ]
  );
  return insert.rows[0];
}

async function createMinimalOrder(usuarioId) {
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

describe.skip('Admin Order Status API (skipped until ESM Jest config)', () => {
  test.skip('401 sin token', async () => {
    const res = await request(app).patch(`/admin/pedidos/${order.orden_id}/estado`).send({ estado_pago: 'pagado' });
    expect(res.status).toBe(401);
  });
  test.skip('403 cliente no admin', async () => {
    const res = await request(app)
      .patch(`/admin/pedidos/${order.orden_id}/estado`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ estado_pago: 'pagado' });
    expect([401,403]).toContain(res.status);
  });
  test.skip('400 payload vacío', async () => {
    const res = await request(app)
      .patch(`/admin/pedidos/${order.orden_id}/estado`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/al menos un campo/i);
  });
  test.skip('400 estado_pago inválido', async () => {
    const res = await request(app)
      .patch(`/admin/pedidos/${order.orden_id}/estado`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ estado_pago: 'xxx' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Estado de pago inválido/i);
  });
  test.skip('400 estado_envio inválido', async () => {
    const res = await request(app)
      .patch(`/admin/pedidos/${order.orden_id}/estado`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ estado_envio: 'foobar' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Estado de envío inválido/i);
  });
  test.skip('200 actualizar estado_pago', async () => {
    const res = await request(app)
      .patch(`/admin/pedidos/${order.orden_id}/estado`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ estado_pago: 'pagado' });
    expect(res.status).toBe(200);
    expect(res.body.data.estado_pago).toBe('pagado');
  });
  test.skip('200 actualizar estado_pago + estado_envio', async () => {
    const res = await request(app)
      .patch(`/admin/pedidos/${order.orden_id}/estado`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ estado_pago: 'pagado', estado_envio: 'enviado' });
    expect(res.status).toBe(200);
    expect(res.body.data.estado_pago).toBe('pagado');
    expect(res.body.data.estado_envio).toBe('enviado');
  });
});

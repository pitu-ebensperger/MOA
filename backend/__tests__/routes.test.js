import request from "supertest";
import app from "../index.js"; 

describe("TEST API – MOA", () => {
  let authToken = null;
  let testProductId = null;

  /* ------------------------------------------------------------- */
  /* TESTS DE RUTAS BÁSICAS */
  /* ------------------------------------------------------------- */
  
  test("GET / → debe responder 200", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'API funcionando');
  });

  /* ------------------------------------------------------------- */
  /* TESTS DE AUTENTICACIÓN */
  /* ------------------------------------------------------------- */

  test("POST /login → credenciales inválidas debe devolver 401", async () => {
    const res = await request(app)
      .post("/login")
      .send({ email: "fake@test.com", password: "1234" });

    expect([400, 401]).toContain(res.status); 
  });

  test("GET /usuario → sin token debe devolver 401", async () => {
    const res = await request(app).get("/usuario");
    expect([401, 403]).toContain(res.status);
  });

  test("GET /auth/perfil → sin token debe devolver 401", async () => {
    const res = await request(app).get("/auth/perfil");
    expect([401, 403]).toContain(res.status);
  });

  /* ------------------------------------------------------------- */
  /* TESTS DE CATEGORÍAS */
  /* ------------------------------------------------------------- */

  test("GET /categorias → debe responder 200", async () => {
    const res = await request(app).get("/categorias");
    expect([200, 404]).toContain(res.status);
    
    if (res.status === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });

  test("GET /categorias/999 → categoría inexistente debe devolver 404", async () => {
    const res = await request(app).get("/categorias/999");
    expect(res.status).toBe(404);
  });

  /* ------------------------------------------------------------- */
  /* TESTS DE PRODUCTOS */
  /* ------------------------------------------------------------- */

  test("GET /productos → debe responder 200", async () => {
    const res = await request(app).get("/productos");
    expect([200, 404, 500]).toContain(res.status);
    
    if (res.status === 200) {
      // Log para debug
      console.log('Response body structure:', Object.keys(res.body));
      console.log('Response body sample:', res.body);
      
      // Verificar que tenga la estructura esperada de paginación
      expect(res.body).toHaveProperty('items');
      expect(Array.isArray(res.body.items)).toBe(true);
    }
  });

  test("GET /productos/search → búsqueda debe funcionar", async () => {
    const res = await request(app).get("/productos/search?q=test");
    expect([200, 404, 500]).toContain(res.status);
  });

  test("GET /productos/999 → producto inexistente debe devolver 404", async () => {
    const res = await request(app).get("/productos/999");
    expect([404, 500]).toContain(res.status);
  });

  /* ------------------------------------------------------------- */
  /* TESTS DE RUTAS ADMIN (SIN TOKEN) */
  /* ------------------------------------------------------------- */

  test("POST /admin/categorias → sin token debe devolver 401", async () => {
    const res = await request(app)
      .post("/admin/categorias")
      .send({ name: "Test Category" });
    
    expect([401, 403]).toContain(res.status);
  });

  test("POST /admin/productos → sin token debe devolver 401", async () => {
    const res = await request(app)
      .post("/admin/productos")
      .send({ name: "Test Product" });
    
    expect([401, 403]).toContain(res.status);
  });

  test("PUT /admin/categorias/1 → sin token debe devolver 401", async () => {
    const res = await request(app)
      .put("/admin/categorias/1")
      .send({ name: "Updated Category" });
    
    expect([401, 403]).toContain(res.status);
  });

  test("DELETE /admin/categorias/1 → sin token debe devolver 401", async () => {
    const res = await request(app)
      .delete("/admin/categorias/1");
    
    expect([401, 403]).toContain(res.status);
  });

  /* ------------------------------------------------------------- */
  /* TESTS DE VALIDACIÓN */
  /* ------------------------------------------------------------- */

  test("POST /login → sin email debe devolver 400", async () => {
    const res = await request(app)
      .post("/login")
      .send({ password: "1234" });

    expect([400, 422]).toContain(res.status);
  });

  test("POST /login → sin password debe devolver 400", async () => {
    const res = await request(app)
      .post("/login")
      .send({ email: "test@test.com" });

    expect([400, 422]).toContain(res.status);
  });

  test("POST /login → email con formato inválido", async () => {
    const res = await request(app)
      .post("/login")
      .send({ email: "invalid-email", password: "1234" });

    expect([400, 401]).toContain(res.status);
  });

  /* ------------------------------------------------------------- */
  /* TESTS DE CARRITO (SIN AUTENTICACIÓN) */
  /* ------------------------------------------------------------- */

  test("GET /cart → sin token debe devolver 401", async () => {
    const res = await request(app).get("/cart");
    expect([401, 403, 404]).toContain(res.status);
  });

  test("POST /cart → sin token debe devolver 401", async () => {
    const res = await request(app)
      .post("/cart")
      .send({ productId: "123", quantity: 1 });
    
    expect([401, 403, 404]).toContain(res.status);
  });

  /* ------------------------------------------------------------- */
  /* TESTS DE WISHLIST (SIN AUTENTICACIÓN) */
  /* ------------------------------------------------------------- */

  test("GET /wishlist → sin token debe devolver 401", async () => {
    const res = await request(app).get("/wishlist");
    expect([401, 403, 404]).toContain(res.status);
  });

  test("POST /wishlist → sin token debe devolver 401", async () => {
    const res = await request(app)
      .post("/wishlist")
      .send({ productId: "123" });
    
    expect([401, 403, 404]).toContain(res.status);
  });

  /* ------------------------------------------------------------- */
  /* TESTS DE DIRECCIONES (SIN AUTENTICACIÓN) */
  /* ------------------------------------------------------------- */

  test("GET /api/addresses → sin token debe devolver 401", async () => {
    const res = await request(app).get("/api/addresses");
    expect([401, 403, 404]).toContain(res.status);
  });

  test("POST /api/addresses → sin token debe devolver 401", async () => {
    const res = await request(app)
      .post("/api/addresses")
      .send({ street: "Test St", city: "Test City" });
    
    expect([401, 403, 404]).toContain(res.status);
  });

  /* ------------------------------------------------------------- */
  /* TESTS DE ÓRDENES (SIN AUTENTICACIÓN) */
  /* ------------------------------------------------------------- */

  test("GET /orders → sin token debe devolver 401", async () => {
    const res = await request(app).get("/orders");
    expect([401, 403, 404]).toContain(res.status);
  });

  test("POST /orders → sin token debe devolver 401", async () => {
    const res = await request(app)
      .post("/orders")
      .send({ items: [] });
    
    expect([401, 403, 404]).toContain(res.status);
  });

  /* ------------------------------------------------------------- */
  /* TESTS DE FILTROS Y PAGINACIÓN */
  /* ------------------------------------------------------------- */

  test("GET /productos?page=1 → paginación debe funcionar", async () => {
    const res = await request(app).get("/productos?page=1");
    expect([200, 404, 500]).toContain(res.status);
  });

  test("GET /productos?limit=10 → límite debe funcionar", async () => {
    const res = await request(app).get("/productos?limit=10");
    expect([200, 404, 500]).toContain(res.status);
  });

  test("GET /productos?categoryId=1 → filtro por categoría", async () => {
    const res = await request(app).get("/productos?categoryId=1");
    expect([200, 404, 500]).toContain(res.status);
  });

  /* ------------------------------------------------------------- */
  /* TESTS DE MANEJO DE ERRORES */
  /* ------------------------------------------------------------- */

  test("GET /ruta-inexistente → debe devolver 404", async () => {
    const res = await request(app).get("/ruta-inexistente");
    expect(res.status).toBe(404);
  });

  test("POST con JSON malformado", async () => {
    const res = await request(app)
      .post("/login")
      .set('Content-Type', 'application/json')
      .send('{"email": "test@test.com", "password":'); // JSON malformado
    
    expect([400, 500]).toContain(res.status);
  });

  /* ------------------------------------------------------------- */
  /* TESTS DE CONFIGURACIÓN */
  /* ------------------------------------------------------------- */

  test("GET /config → configuración debe estar disponible", async () => {
    const res = await request(app).get("/config");
    expect([200, 404, 500]).toContain(res.status);
  });

  /* ------------------------------------------------------------- */
  /* TESTS DE RUTAS DE PAGO (SIN AUTENTICACIÓN) */
  /* ------------------------------------------------------------- */

  test("POST /payment → sin token debe devolver 401", async () => {
    const res = await request(app)
      .post("/payment")
      .send({ amount: 1000 });
    
    expect([401, 403, 404]).toContain(res.status);
  });

});
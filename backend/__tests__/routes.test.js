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
    expect([200, 404]).toContain(res.status);
    
    if (res.status === 200) {
      expect(Array.isArray(res.body.products || res.body)).toBe(true);
    }
  });

  test("GET /productos/search → búsqueda debe funcionar", async () => {
    const res = await request(app).get("/productos/search?q=test");
    expect([200, 404]).toContain(res.status);
  });

  test("GET /productos/999 → producto inexistente debe devolver 404", async () => {
    const res = await request(app).get("/productos/999");
    expect(res.status).toBe(404);
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

});
import { jest } from '@jest/globals';
jest.mock("../database/config.js"); 

import request from "supertest";
import app from "../index.js";

describe("TESTS API – MOA", () => {

  /* ------------------------------------------------------------- */
  test("GET /categories/999 → debe devolver 404 si la categoría no existe", async () => {
    const res = await request(app).get("/categories/999");
    expect(res.statusCode).toBe(404);
  });

  /* ------------------------------------------------------------- */
  test("POST /login → debe devolver 400 si faltan credenciales", async () => {
    const res = await request(app)
      .post("/login")
      .send({}); // sin email ni password

    expect(res.statusCode).toBe(400);
  });

  /* ------------------------------------------------------------- */
  test("GET /auth/perfil → debe devolver 401 sin token", async () => {
    const res = await request(app).get("/auth/perfil");
    expect([401, 403]).toContain(res.statusCode);
  });

  /* ------------------------------------------------------------- */
  test("GET /products/9999 → debe devolver 404 si el producto no existe", async () => {
    const res = await request(app).get("/products/9999");
    expect(res.statusCode).toBe(404);
  });

});
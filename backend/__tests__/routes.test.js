
import request from "supertest";
import app from "../index.js"; 

describe("TEST API – MOA", () => {

  /* ------------------------------------------------------------- */
  test("GET /home → debe responder 200", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
  });

  /* ------------------------------------------------------------- */
  test("POST /login → credenciales inválidas debe devolver 401", async () => {
    const res = await request(app)
      .post("/login")
      .send({ email: "fake@test.com", password: "1234" });

    expect([400, 401]).toContain(res.status); 
  });

  /* ------------------------------------------------------------- */
 test("GET /usuario → sin token debe devolver 401", async () => {
  const res = await request(app).get("/usuario");
  expect([401, 403]).toContain(res.status);
});


  /* ------------------------------------------------------------- */
  test("GET /categories → debe responder 200 o 404 si no hay datos", async () => {
    const res = await request(app).get("/categories");

    expect([200, 404]).toContain(res.status);
  });

});

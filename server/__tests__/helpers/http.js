import request from "supertest";

let app;

async function getApp() {
  if (!app) {
    const module = await import("../../app.js");
    app = module.default;
  }
  return app;
}

export async function createAgent() {
  return request.agent(await getApp());
}

export async function loginAsAdmin(agent) {
  const response = await agent
    .post("/auth/login")
    .send({ email: "admin@teste.com", senha: "123456" })
    .expect(200);

  return response;
}

export async function loginAsCliente(agent) {
  const response = await agent
    .post("/auth/login")
    .send({ email: "cliente@teste.com", senha: "123456" })
    .expect(200);

  return response;
}

export function uniqueTestEmail(prefix = "cliente") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@teste.com`;
}

import { createAgent } from "./helpers/http.js";
import { describeIntegration } from "./helpers/integration.js";
import { seedLoginUsers } from "./helpers/seed.js";

describeIntegration("POST /auth/login", () => {
  beforeAll(async () => {
    await seedLoginUsers();
  });
  it("retorna 400 quando email ou senha estão ausentes", async () => {
    const agent = await createAgent();

    const semEmail = await agent.post("/auth/login").send({ senha: "123456" });
    expect(semEmail.status).toBe(400);
    expect(semEmail.body.error).toMatch(/obrigatórios/i);

    const semSenha = await agent.post("/auth/login").send({ email: "admin@teste.com" });
    expect(semSenha.status).toBe(400);
    expect(semSenha.body.error).toMatch(/obrigatórios/i);
  });

  it("retorna 401 para credenciais inválidas", async () => {
    const agent = await createAgent();

    const response = await agent
      .post("/auth/login")
      .send({ email: "admin@teste.com", senha: "senha-errada" });

    expect(response.status).toBe(401);
    expect(response.body.error).toMatch(/credenciais inválidas/i);
  });

  it("autentica administrador e define cookie JWT", async () => {
    const agent = await createAgent();

    const response = await agent
      .post("/auth/login")
      .send({ email: "admin@teste.com", senha: "123456" });

    expect(response.status).toBe(200);
    expect(response.body.usuario).toMatchObject({
      email: "admin@teste.com",
      perfil: "administrador",
    });
    expect(response.headers["set-cookie"]).toEqual(
      expect.arrayContaining([expect.stringMatching(/^token=/)]),
    );
  });

  it("autentica cliente com perfil correto", async () => {
    const agent = await createAgent();

    const response = await agent
      .post("/auth/login")
      .send({ email: "cliente@teste.com", senha: "123456" });

    expect(response.status).toBe(200);
    expect(response.body.usuario.perfil).toBe("cliente");
  });
});

describeIntegration("POST /auth/logout", () => {
  beforeAll(async () => {
    await seedLoginUsers();
  });

  it("encerra sessão com sucesso", async () => {
    const agent = await createAgent();

    await agent
      .post("/auth/login")
      .send({ email: "admin@teste.com", senha: "123456" })
      .expect(200);

    const logout = await agent.post("/auth/logout");
    expect(logout.status).toBe(200);
    expect(logout.body.message).toMatch(/logout/i);
  });
});

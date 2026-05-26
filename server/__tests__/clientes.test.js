import { createAgent, loginAsAdmin, loginAsCliente, uniqueTestEmail } from "./helpers/http.js";
import { describeIntegration } from "./helpers/integration.js";
import { seedLoginUsers } from "./helpers/seed.js";

describeIntegration("/clientes", () => {
  let adminAgent;
  let createdClienteId;

  beforeAll(async () => {
    await seedLoginUsers();
    adminAgent = await createAgent();
    await loginAsAdmin(adminAgent);
  });

  afterAll(async () => {
    if (createdClienteId) {
      await adminAgent.delete(`/clientes/${createdClienteId}`);
    }
  });

  describe("autorização", () => {
    it("retorna 401 sem cookie de autenticação", async () => {
      const agent = await createAgent();
      const response = await agent.get("/clientes");
      expect(response.status).toBe(401);
      expect(response.body.error).toMatch(/token/i);
    });

    it("retorna 403 para perfil cliente", async () => {
      const agent = await createAgent();
      await loginAsCliente(agent);

      const response = await agent.get("/clientes");
      expect(response.status).toBe(403);
      expect(response.body.error).toMatch(/acesso negado/i);
    });
  });

  describe("CRUD", () => {
    const email = uniqueTestEmail("crud");
    const nome = "Cliente Automatizado";

    it("POST /clientes cria cliente (201)", async () => {
      const response = await adminAgent.post("/clientes").send({
        nome,
        email,
        senha: "123456",
        ativo: true,
      });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        nome,
        email,
        ativo: true,
      });
      expect(response.body.id).toBeDefined();
      createdClienteId = response.body.id;
    });

    it("GET /clientes lista clientes incluindo o criado", async () => {
      const response = await adminAgent.get("/clientes");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.some((c) => c.id === createdClienteId)).toBe(true);
    });

    it("GET /clientes/:id retorna um cliente", async () => {
      const response = await adminAgent.get(`/clientes/${createdClienteId}`);

      expect(response.status).toBe(200);
      expect(response.body.email).toBe(email);
    });

    it("PUT /clientes/:id atualiza cliente inteiro", async () => {
      const novoNome = "Cliente Atualizado PUT";
      const novoEmail = uniqueTestEmail("put");

      const response = await adminAgent.put(`/clientes/${createdClienteId}`).send({
        nome: novoNome,
        email: novoEmail,
        ativo: false,
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        nome: novoNome,
        email: novoEmail,
        ativo: false,
      });
    });

    it("PATCH /clientes/:id atualiza parcialmente", async () => {
      const response = await adminAgent.patch(`/clientes/${createdClienteId}`).send({
        ativo: true,
      });

      expect(response.status).toBe(200);
      expect(response.body.ativo).toBe(true);
    });

    it("GET /clientes/:id inválido retorna 400", async () => {
      const response = await adminAgent.get("/clientes/abc");
      expect(response.status).toBe(400);
    });

    it("GET /clientes/:id inexistente retorna 404", async () => {
      const response = await adminAgent.get("/clientes/999999999");
      expect(response.status).toBe(404);
    });

    it("POST /clientes com email duplicado retorna 409", async () => {
      const cliente = await adminAgent.get(`/clientes/${createdClienteId}`);
      const emailDuplicado = cliente.body.email;

      const response = await adminAgent.post("/clientes").send({
        nome: "Outro Cliente",
        email: emailDuplicado,
        senha: "123456",
      });

      expect(response.status).toBe(409);
    });

    it("POST /clientes com payload inválido retorna 400", async () => {
      const response = await adminAgent.post("/clientes").send({
        nome: "",
        email: "email-invalido",
        senha: "123",
      });

      expect(response.status).toBe(400);
    });

    it("DELETE /clientes/:id remove cliente (204)", async () => {
      const id = createdClienteId;
      const response = await adminAgent.delete(`/clientes/${id}`);
      expect(response.status).toBe(204);
      createdClienteId = null;

      const notFound = await adminAgent.get(`/clientes/${id}`);
      expect(notFound.status).toBe(404);
    });
  });
});

describeIntegration("DELETE /clientes/:id após remoção", () => {
  it("retorna 404 ao buscar cliente removido", async () => {
    const adminAgent = await createAgent();
    await loginAsAdmin(adminAgent);

    const email = uniqueTestEmail("delete");
    const created = await adminAgent.post("/clientes").send({
      nome: "Para Deletar",
      email,
      senha: "123456",
    });

    const id = created.body.id;
    await adminAgent.delete(`/clientes/${id}`).expect(204);

    const response = await adminAgent.get(`/clientes/${id}`);
    expect(response.status).toBe(404);
  });
});

import { createAgent, loginAsAdmin, loginAsCliente } from "./helpers/http.js";
import { describeIntegration } from "./helpers/integration.js";
import { seedLoginUsers } from "./helpers/seed.js";

describeIntegration("/maquinas", () => {
  let clienteAgent;
  let createdMaquinaId;

  beforeAll(async () => {
    await seedLoginUsers();
    clienteAgent = await createAgent();
    await loginAsCliente(clienteAgent);
  });

  afterAll(async () => {
    if (createdMaquinaId) {
      await clienteAgent.delete(`/maquinas/${createdMaquinaId}`);
    }
  });

  describe("autorização", () => {
    it("retorna 401 sem cookie de autenticação", async () => {
      const agent = await createAgent();
      const response = await agent.get("/maquinas");
      expect(response.status).toBe(401);
      expect(response.body.error).toMatch(/token/i);
    });

    it("retorna 403 para perfil administrador", async () => {
      const agent = await createAgent();
      await loginAsAdmin(agent);

      const response = await agent.get("/maquinas");
      expect(response.status).toBe(403);
      expect(response.body.error).toMatch(/acesso negado/i);
    });
  });

  describe("CRUD", () => {
    const nome = "Torno CNC Teste";

    it("POST /maquinas cria máquina com token gerado (201)", async () => {
      const response = await clienteAgent.post("/maquinas").send({
        nome,
        ativo: true,
      });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        nome,
        ativo: true,
      });
      expect(response.body.id).toBeDefined();
      expect(response.body.cliente_id).toBeDefined();
      expect(response.body.token_comunicacao).toMatch(/^[a-f0-9]{64}$/);
      createdMaquinaId = response.body.id;
    });

    it("GET /maquinas lista máquinas incluindo a criada", async () => {
      const response = await clienteAgent.get("/maquinas");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.some((m) => m.id === createdMaquinaId)).toBe(true);
    });

    it("GET /maquinas/:id retorna uma máquina", async () => {
      const response = await clienteAgent.get(`/maquinas/${createdMaquinaId}`);

      expect(response.status).toBe(200);
      expect(response.body.nome).toBe(nome);
      expect(response.body.token_comunicacao).toBeDefined();
    });

    it("PUT /maquinas/:id atualiza máquina inteira", async () => {
      const novoNome = "Injetora Atualizada PUT";

      const response = await clienteAgent.put(`/maquinas/${createdMaquinaId}`).send({
        nome: novoNome,
        ativo: false,
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        nome: novoNome,
        ativo: false,
      });
    });

    it("PATCH /maquinas/:id atualiza parcialmente", async () => {
      const response = await clienteAgent.patch(`/maquinas/${createdMaquinaId}`).send({
        ativo: true,
      });

      expect(response.status).toBe(200);
      expect(response.body.ativo).toBe(true);
    });

    it("GET /maquinas/:id inválido retorna 400", async () => {
      const response = await clienteAgent.get("/maquinas/abc");
      expect(response.status).toBe(400);
    });

    it("GET /maquinas/:id inexistente retorna 404", async () => {
      const response = await clienteAgent.get("/maquinas/999999999");
      expect(response.status).toBe(404);
    });

    it("POST /maquinas com payload inválido retorna 400", async () => {
      const response = await clienteAgent.post("/maquinas").send({
        nome: "",
      });

      expect(response.status).toBe(400);
    });

    it("DELETE /maquinas/:id remove máquina (204)", async () => {
      const id = createdMaquinaId;
      const response = await clienteAgent.delete(`/maquinas/${id}`);
      expect(response.status).toBe(204);
      createdMaquinaId = null;

      const notFound = await clienteAgent.get(`/maquinas/${id}`);
      expect(notFound.status).toBe(404);
    });
  });
});

describeIntegration("DELETE /maquinas/:id após remoção", () => {
  it("retorna 404 ao buscar máquina removida", async () => {
    const clienteAgent = await createAgent();
    await loginAsCliente(clienteAgent);

    const created = await clienteAgent.post("/maquinas").send({
      nome: "Para Deletar",
      ativo: true,
    });

    const id = created.body.id;
    await clienteAgent.delete(`/maquinas/${id}`).expect(204);

    const response = await clienteAgent.get(`/maquinas/${id}`);
    expect(response.status).toBe(404);
  });
});

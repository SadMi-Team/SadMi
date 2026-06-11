import { createAgent } from "./helpers/http.js";
import { describeIntegration } from "./helpers/integration.js";
import { seedLoginUsers } from "./helpers/seed.js";
import { query } from "../db.js";

describeIntegration("Máquinas CRUD", () => {
  let clientId;

  beforeAll(async () => {
    await seedLoginUsers();
    const result = await query(
      "SELECT id FROM clientes WHERE email = $1 LIMIT 1",
      ["cliente@teste.com"],
    );
    clientId = result.rows[0]?.id;
  });

  it("cria, lê, atualiza e exclui uma máquina com token de comunicação", async () => {
    const agent = await createAgent();
    await agent
      .post("/auth/login")
      .send({ email: "admin@teste.com", senha: "123456" })
      .expect(200);

    const createResponse = await agent
      .post("/maquinas")
      .send({ nome: "Torno CNC", cliente_id: clientId, ativo: true })
      .expect(201);

    expect(createResponse.body).toMatchObject({
      cliente_id: clientId,
      nome: "Torno CNC",
      ativo: true,
    });
    expect(typeof createResponse.body.token_comunicacao).toBe("string");
    expect(createResponse.body.token_comunicacao.length).toBeGreaterThan(20);

    const machineId = createResponse.body.id;

    const getResponse = await agent.get(`/maquinas/${machineId}`).expect(200);
    expect(getResponse.body).toMatchObject({
      id: machineId,
      nome: "Torno CNC",
      cliente_id: clientId,
    });

    const patchResponse = await agent
      .patch(`/maquinas/${machineId}`)
      .send({ nome: "Torno CNC Atualizado", ativo: false })
      .expect(200);
    expect(patchResponse.body.nome).toBe("Torno CNC Atualizado");
    expect(patchResponse.body.ativo).toBe(false);

    await agent.delete(`/maquinas/${machineId}`).expect(204);

    await agent.get(`/maquinas/${machineId}`).expect(404);
  });
});

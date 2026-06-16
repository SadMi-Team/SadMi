import api from "./utils/axios";
import "./mockApi";

describe("mockApi CRUD and auth", () => {
  it("POST /clientes should create a client", async () => {
    const payload = { nome: "Cliente Teste", email: "cliente@teste.local", ativo: true };
    const res = await api.post('/clientes', payload);
    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.status).toBeLessThan(300);
    expect(res.data).toBeDefined();
  });

  it("PATCH /clientes/:id should edit a client", async () => {
    // create first
    const create = await api.post('/clientes', { nome: 'ToEdit', email: 'toedit@x' });
    const id = create.data.cliente?.id || create.data.cliente?.id || 1;
    const res = await api.patch(`/clientes/${id}`, { nome: 'Edited' });
    expect(res.status).toBe(200);
    expect(res.data).toBeDefined();
  });

  it("DELETE /clientes/:id should delete a client", async () => {
    const create = await api.post('/clientes', { nome: 'ToDelete' });
    const id = create.data.cliente?.id || create.data.cliente?.id || 1;
    const res = await api.delete(`/clientes/${id}`);
    expect(res.status).toBe(200);
    expect(res.data).toBeDefined();
  });

  it("POST /auth/logout should return success", async () => {
    const res = await api.post('/auth/logout');
    expect(res.status).toBe(200);
    expect(res.data).toBeDefined();
  });
});

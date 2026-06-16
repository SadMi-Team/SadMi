import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import "./mockApi";
import api from "./utils/axios";

describe("mockApi endpoints", () => {
  it("should return clientes list", async () => {
    const response = await api.get("/clientes");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data.length).toBeGreaterThan(0);
    expect(response.data[0]).toHaveProperty("nome");
  });

  it("should return maquinas list", async () => {
    const response = await api.get("/maquinas");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data[0]).toHaveProperty("nome");
  });

  it("should return admin summarization", async () => {
    const response = await api.get("/admin/sumarizacao");
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty("totalMaquinas");
    expect(response.data).toHaveProperty("taxaUtilizacao");
  });

  it("should return cliente summarization", async () => {
    const response = await api.get("/cliente/sumarizacao");
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty("oeeMedio");
    expect(Array.isArray(response.data.historicoOee)).toBe(true);
    expect(Array.isArray(response.data.historicoProducao)).toBe(true);
  });

  it("should return machine telemetry", async () => {
    const response = await api.get("/maquinas/1/telemetria");
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty("oee");
    expect(response.data).toHaveProperty("qualidade");
  });

  it("should return machine anomalies", async () => {
    const response = await api.get("/maquinas/1/anomalias");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data[0]).toHaveProperty("operador");
  });

  it("should return machine cycles", async () => {
    const response = await api.get("/maquinas/1/ciclos");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data[0]).toHaveProperty("tipoPeca");
  });

  it("should return machine by id", async () => {
    const response = await api.get("/maquinas/1");
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty("id");
    expect(response.data.id).toBe("1");
  });
});

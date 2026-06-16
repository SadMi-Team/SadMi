import MockAdapter from "axios-mock-adapter";
import api from "./utils/axios";

const mock = new MockAdapter(api, { delayResponse: 300 });
const apiBase = import.meta.env.VITE_API_URL || "";

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const absoluteUrl = (path: string) => new RegExp(`^${escapeRegExp(apiBase + path)}$`);
const relativeUrl = (path: string) => new RegExp(`^${escapeRegExp(path)}$`);

const clientes = [
  {
    id: 1,
    nome: "Indústria São Paulo",
    email: "contato@sadmi.com",
    ativo: true,
    criado_em: "2025-05-10T08:30:00.000Z",
    atualizado_em: "2026-06-10T09:15:00.000Z",
  },
  {
    id: 2,
    nome: "Fábrica Alfa",
    email: "alpha@fabricas.com",
    ativo: false,
    criado_em: "2025-08-02T10:00:00.000Z",
    atualizado_em: "2026-04-03T14:45:00.000Z",
  },
];

const maquinas = [
  {
    id: "1",
    nome: "Prensa A01",
    ativo: true,
    cliente_id: "1",
    token_comunicacao: "token-01",
    criado_em: "2025-11-01T07:00:00.000Z",
    atualizado_em: "2026-06-12T12:20:00.000Z",
  },
  {
    id: "2",
    nome: "Fresadora B02",
    ativo: true,
    cliente_id: "1",
    token_comunicacao: "token-02",
    criado_em: "2025-11-10T08:45:00.000Z",
    atualizado_em: "2026-06-13T15:35:00.000Z",
  },
  {
    id: "3",
    nome: "Torno C03",
    ativo: false,
    cliente_id: "2",
    token_comunicacao: "token-03",
    criado_em: "2026-01-08T09:10:00.000Z",
    atualizado_em: "2026-05-20T10:05:00.000Z",
  },
  {
    id: "4",
    nome: "Cortadora D04",
    ativo: true,
    cliente_id: "1",
    token_comunicacao: "token-04",
    criado_em: "2026-02-20T11:40:00.000Z",
    atualizado_em: "2026-06-14T13:50:00.000Z",
  },
];

const telemetria = {
  oee: 86.2,
  disponibilidade: 92.5,
  performance: 89.1,
  qualidade: 95.8,
};

const tableEntries = [
  {
    dataHora: "2026-06-15 08:30",
    operador: "João",
    tipoPeca: "A1",
    qtdOk: 120,
    refugo: 4,
    energia: "5.2",
    material: "1.4",
    duracao: "17",
  },
  {
    dataHora: "2026-06-15 09:15",
    operador: "Mariana",
    tipoPeca: "B3",
    qtdOk: 98,
    refugo: 2,
    energia: "4.8",
    material: "1.2",
    duracao: "15",
  },
  {
    dataHora: "2026-06-15 10:00",
    operador: "Carlos",
    tipoPeca: "C2",
    qtdOk: 110,
    refugo: 1,
    energia: "5.0",
    material: "1.3",
    duracao: "16",
  },
];

mock.onGet(absoluteUrl("/clientes")).reply(200, clientes);
mock.onGet(relativeUrl("/clientes")).reply(200, clientes);

mock.onGet(absoluteUrl("/maquinas")).reply(200, maquinas);
mock.onGet(relativeUrl("/maquinas")).reply(200, maquinas);

mock.onGet(absoluteUrl("/admin/sumarizacao")).reply(200, {
  totalMaquinas: maquinas.length,
  taxaUtilizacao: 78,
});
mock.onGet(relativeUrl("/admin/sumarizacao")).reply(200, {
  totalMaquinas: maquinas.length,
  taxaUtilizacao: 78,
});

mock.onGet(absoluteUrl("/cliente/sumarizacao")).reply(200, {
  oeeMedio: "75.3",
  maquinasAtivas: maquinas.filter((m) => m.ativo).length,
  producaoSemanal: 1380,
  alertas: 5,
  historicoOee: [
    { data: "Seg", oee: 70 },
    { data: "Ter", oee: 74 },
    { data: "Qua", oee: 76 },
    { data: "Qui", oee: 79 },
    { data: "Sex", oee: 81 },
    { data: "Sáb", oee: 77 },
    { data: "Dom", oee: 75 },
  ],
  historicoProducao: [
    { dia: "Seg", produzidas: 180, refugo: 8 },
    { dia: "Ter", produzidas: 220, refugo: 10 },
    { dia: "Qua", produzidas: 210, refugo: 9 },
    { dia: "Qui", produzidas: 240, refugo: 11 },
    { dia: "Sex", produzidas: 230, refugo: 12 },
    { dia: "Sáb", produzidas: 170, refugo: 7 },
    { dia: "Dom", produzidas: 150, refugo: 5 },
  ],
});
mock.onGet(relativeUrl("/cliente/sumarizacao")).reply(200, {
  oeeMedio: "75.3",
  maquinasAtivas: maquinas.filter((m) => m.ativo).length,
  producaoSemanal: 1380,
  alertas: 5,
  historicoOee: [
    { data: "Seg", oee: 70 },
    { data: "Ter", oee: 74 },
    { data: "Qua", oee: 76 },
    { data: "Qui", oee: 79 },
    { data: "Sex", oee: 81 },
    { data: "Sáb", oee: 77 },
    { data: "Dom", oee: 75 },
  ],
  historicoProducao: [
    { dia: "Seg", produzidas: 180, refugo: 8 },
    { dia: "Ter", produzidas: 220, refugo: 10 },
    { dia: "Qua", produzidas: 210, refugo: 9 },
    { dia: "Qui", produzidas: 240, refugo: 11 },
    { dia: "Sex", produzidas: 230, refugo: 12 },
    { dia: "Sáb", produzidas: 170, refugo: 7 },
    { dia: "Dom", produzidas: 150, refugo: 5 },
  ],
});

// POST /clientes - create
mock.onPost(new RegExp(`^${escapeRegExp(apiBase)}/clientes$`)).reply((config) => {
  try {
    const body = config.data ? JSON.parse(config.data) : {};
    const id = clientes.length + 1;
    const novo = {
      id,
      nome: body.nome || `Cliente ${id}`,
      email: body.email || `cliente${id}@teste.local`,
      ativo: typeof body.ativo === "boolean" ? body.ativo : true,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    };
    clientes.push(novo);
    return [201, { data: "Sucesso", message: "Cliente adicionado", cliente: novo }];
  } catch (e) {
    return [500, { error: "Parse error" }];
  }
});
mock.onPost(new RegExp(`/clientes$`)).reply((config) => {
  try {
    const body = config.data ? JSON.parse(config.data) : {};
    const id = clientes.length + 1;
    const novo = {
      id,
      nome: body.nome || `Cliente ${id}`,
      email: body.email || `cliente${id}@teste.local`,
      ativo: typeof body.ativo === "boolean" ? body.ativo : true,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    };
    clientes.push(novo);
    return [201, { data: "Sucesso", message: "Cliente adicionado", cliente: novo }];
  } catch (e) {
    return [500, { error: "Parse error" }];
  }
});

// PATCH /clientes/:id - update
mock.onPatch(new RegExp(`^${escapeRegExp(apiBase)}/clientes/\\d+$`)).reply((config) => {
  try {
    const idMatch = config.url?.match(/\/clientes\/(\d+)$/);
    const id = idMatch ? Number(idMatch[1]) : null;
    const body = config.data ? JSON.parse(config.data) : {};
    const idx = clientes.findIndex((c) => c.id === id);
    if (idx === -1) return [404, { error: "Not found" }];
    clientes[idx] = { ...clientes[idx], ...body, atualizado_em: new Date().toISOString() };
    return [200, { data: "Sucesso", message: "Cliente modificado", cliente: clientes[idx] }];
  } catch (e) {
    return [500, { error: "Parse error" }];
  }
});
mock.onPatch(new RegExp(`/clientes/\\d+$`)).reply((config) => {
  try {
    const idMatch = config.url?.match(/\/clientes\/(\d+)$/);
    const id = idMatch ? Number(idMatch[1]) : null;
    const body = config.data ? JSON.parse(config.data) : {};
    const idx = clientes.findIndex((c) => c.id === id);
    if (idx === -1) return [404, { error: "Not found" }];
    clientes[idx] = { ...clientes[idx], ...body, atualizado_em: new Date().toISOString() };
    return [200, { data: "Sucesso", message: "Cliente modificado", cliente: clientes[idx] }];
  } catch (e) {
    return [500, { error: "Parse error" }];
  }
});

// DELETE /clientes/:id
mock.onDelete(new RegExp(`^${escapeRegExp(apiBase)}/clientes/\\d+$`)).reply((config) => {
  const idMatch = config.url?.match(/\/clientes\/(\d+)$/);
  const id = idMatch ? Number(idMatch[1]) : null;
  const idx = clientes.findIndex((c) => c.id === id);
  if (idx === -1) return [404, { error: "Not found" }];
  clientes.splice(idx, 1);
  return [200, { data: "Sucesso", message: "Cliente deletado" }];
});
mock.onDelete(new RegExp(`/clientes/\\d+$`)).reply((config) => {
  const idMatch = config.url?.match(/\/clientes\/(\d+)$/);
  const id = idMatch ? Number(idMatch[1]) : null;
  const idx = clientes.findIndex((c) => c.id === id);
  if (idx === -1) return [404, { error: "Not found" }];
  clientes.splice(idx, 1);
  return [200, { data: "Sucesso", message: "Cliente deletado" }];
});

// POST /auth/login
mock.onPost(new RegExp(`^${escapeRegExp(apiBase)}/auth/login$`)).reply((config) => {
  try {
    const body = config.data ? JSON.parse(config.data) : {};
    const email = String(body.email || "").trim().toLowerCase();
    const senha = String(body.senha || "").trim();

    if (!email || !senha) {
      return [400, { erro: "Email e senha são obrigatórios", error: "Informe suas credenciais" }];
    }

    const perfil = email.includes("admin") ? "administrador" : "cliente";
    return [200, { data: "Sucesso", message: "Login realizado", usuario: { email, perfil } }];
  } catch (e) {
    return [500, { error: "Parse error" }];
  }
});
mock.onPost(new RegExp(`/auth/login$`)).reply((config) => {
  try {
    const body = config.data ? JSON.parse(config.data) : {};
    const email = String(body.email || "").trim().toLowerCase();
    const senha = String(body.senha || "").trim();

    if (!email || !senha) {
      return [400, { erro: "Email e senha são obrigatórios", error: "Informe suas credenciais" }];
    }

    const perfil = email.includes("admin") ? "administrador" : "cliente";
    return [200, { data: "Sucesso", message: "Login realizado", usuario: { email, perfil } }];
  } catch (e) {
    return [500, { error: "Parse error" }];
  }
});

// POST /auth/logout
mock.onPost(new RegExp(`^${escapeRegExp(apiBase)}/auth/logout$`)).reply(200, { data: "Sucesso", message: "Logout realizado" });
mock.onPost(new RegExp(`/auth/logout$`)).reply(200, { data: "Sucesso", message: "Logout realizado" });

mock.onGet(new RegExp(`^${escapeRegExp(apiBase)}/maquinas/\\d+/telemetria$`)).reply(200, telemetria);
mock.onGet(new RegExp(`/maquinas/\\d+/telemetria$`)).reply(200, telemetria);

mock.onGet(new RegExp(`^${escapeRegExp(apiBase)}/maquinas/\\d+/anomalias$`)).reply(200, tableEntries);
mock.onGet(new RegExp(`/maquinas/\\d+/anomalias$`)).reply(200, tableEntries);

mock.onGet(new RegExp(`^${escapeRegExp(apiBase)}/maquinas/\\d+/ciclos$`)).reply(200, tableEntries);
mock.onGet(new RegExp(`/maquinas/\\d+/ciclos$`)).reply(200, tableEntries);

mock.onGet(new RegExp(`^${escapeRegExp(apiBase)}/maquinas/\\d+$`)).reply((config) => {
  const idMatch = config.url?.match(/\/maquinas\/(\d+)$/);
  const id = idMatch ? idMatch[1] : "1";
  const machine = maquinas.find((item) => item.id === id) ?? maquinas[0];
  return [200, machine];
});
mock.onGet(new RegExp(`/maquinas/\\d+$`)).reply((config) => {
  const idMatch = config.url?.match(/\/maquinas\/(\d+)$/);
  const id = idMatch ? idMatch[1] : "1";
  const machine = maquinas.find((item) => item.id === id) ?? maquinas[0];
  return [200, machine];
});

// POST /maquinas - create machine
mock.onPost(new RegExp(`^${escapeRegExp(apiBase)}/maquinas$`)).reply((config) => {
  try {
    const body = config.data ? JSON.parse(config.data) : {};
    const id = (maquinas.length + 1).toString();
    const token = `token-${Math.random().toString(36).substring(2, 10)}`;
    const now = new Date().toISOString();
    const novo = {
      id,
      nome: body.nome || `Maquina ${id}`,
      ativo: typeof body.ativo === "boolean" ? body.ativo : true,
      cliente_id: body.cliente_id || "1",
      token_comunicacao: token,
      criado_em: now,
      atualizado_em: now,
    };
    maquinas.push(novo);
    return [201, { token_comunicacao: token, data: "Sucesso", message: "Máquina adicionada", maquina: novo }];
  } catch (e) {
    return [500, { error: "Parse error" }];
  }
});
mock.onPost(new RegExp(`/maquinas$`)).reply((config) => {
  try {
    const body = config.data ? JSON.parse(config.data) : {};
    const id = (maquinas.length + 1).toString();
    const token = `token-${Math.random().toString(36).substring(2, 10)}`;
    const now = new Date().toISOString();
    const novo = {
      id,
      nome: body.nome || `Maquina ${id}`,
      ativo: typeof body.ativo === "boolean" ? body.ativo : true,
      cliente_id: body.cliente_id || "1",
      token_comunicacao: token,
      criado_em: now,
      atualizado_em: now,
    };
    maquinas.push(novo);
    return [201, { token_comunicacao: token, data: "Sucesso", message: "Máquina adicionada", maquina: novo }];
  } catch (e) {
    return [500, { error: "Parse error" }];
  }
});

// PATCH /maquinas/:id - edit machine
mock.onPatch(new RegExp(`^${escapeRegExp(apiBase)}/maquinas/\\d+$`)).reply((config) => {
  try {
    const idMatch = config.url?.match(/\/maquinas\/(\d+)$/);
    const id = idMatch ? idMatch[1] : null;
    const body = config.data ? JSON.parse(config.data) : {};
    const idx = maquinas.findIndex((m) => m.id === id);
    if (idx === -1) return [404, { error: "Not found" }];
    maquinas[idx] = { ...maquinas[idx], ...body, atualizado_em: new Date().toISOString() };
    return [200, { data: "Sucesso", message: "Máquina atualizada", maquina: maquinas[idx] }];
  } catch (e) {
    return [500, { error: "Parse error" }];
  }
});
mock.onPatch(new RegExp(`/maquinas/\\d+$`)).reply((config) => {
  try {
    const idMatch = config.url?.match(/\/maquinas\/(\d+)$/);
    const id = idMatch ? idMatch[1] : null;
    const body = config.data ? JSON.parse(config.data) : {};
    const idx = maquinas.findIndex((m) => m.id === id);
    if (idx === -1) return [404, { error: "Not found" }];
    maquinas[idx] = { ...maquinas[idx], ...body, atualizado_em: new Date().toISOString() };
    return [200, { data: "Sucesso", message: "Máquina atualizada", maquina: maquinas[idx] }];
  } catch (e) {
    return [500, { error: "Parse error" }];
  }
});

// DELETE /maquinas/:id - delete machine
mock.onDelete(new RegExp(`^${escapeRegExp(apiBase)}/maquinas/\\d+$`)).reply((config) => {
  const idMatch = config.url?.match(/\/maquinas\/(\d+)$/);
  const id = idMatch ? idMatch[1] : null;
  const idx = maquinas.findIndex((m) => m.id === id);
  if (idx === -1) return [404, { error: "Not found" }];
  const removed = maquinas.splice(idx, 1)[0];
  return [200, { data: "Sucesso", message: "Máquina deletada", maquina: removed }];
});
mock.onDelete(new RegExp(`/maquinas/\\d+$`)).reply((config) => {
  const idMatch = config.url?.match(/\/maquinas\/(\d+)$/);
  const id = idMatch ? idMatch[1] : null;
  const idx = maquinas.findIndex((m) => m.id === id);
  if (idx === -1) return [404, { error: "Not found" }];
  const removed = maquinas.splice(idx, 1)[0];
  return [200, { data: "Sucesso", message: "Máquina deletada", maquina: removed }];
});

export default mock;

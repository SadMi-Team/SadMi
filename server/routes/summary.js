import express from "express";

import { query } from "../db.js";
import { authenticateJwt } from "../middlewares/auth.js";
import { parseMaquinaId } from "../utils/maquinaValidation.js";

const router = express.Router();

router.use(authenticateJwt);

function getClienteId(req) {
  if (req.user?.role === "cliente") {
    return Number.parseInt(String(req.user?.sub), 10);
  }
  return null;
}

function normalizeNumber(value) {
  if (value === null || value === undefined) {
    return 0;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

router.get("/global", async (req, res, next) => {
  try {
    const clienteId = getClienteId(req);
    const whereClause = clienteId ? "WHERE m.cliente_id = $1" : "";
    const values = clienteId ? [clienteId] : [];

    const summarySql = `
      SELECT
        COUNT(cp.*) AS total_ciclos,
        COALESCE(SUM(cp.quantidade_pecas), 0) AS total_pecas,
        COALESCE(SUM(cp.quantidade_refugo), 0) AS total_refugo,
        COALESCE(SUM(cp.consumo_materia_prima), 0) AS total_materia_prima,
        COALESCE(SUM(cp.consumo_energia_kwh), 0) AS total_energia_kwh,
        COUNT(DISTINCT cp.operador) AS total_operadores,
        COUNT(DISTINCT cp.tipo_peca) AS total_tipos_peca,
        COUNT(*) FILTER (WHERE cp.observacoes_anomalias IS NOT NULL AND trim(cp.observacoes_anomalias) <> '') AS total_anomalias,
        COALESCE(SUM(EXTRACT(EPOCH FROM (cp.fim_ciclo - cp.inicio_ciclo))), 0) AS total_duration_seconds
      FROM ciclos_producao cp
      JOIN maquinas m ON m.id = cp.maquina_id
      ${whereClause}`;

    const machineCountSql = `
      SELECT
        COUNT(*) AS maquinas_total,
        COUNT(*) FILTER (WHERE ativo) AS maquinas_ativas,
        COUNT(*) FILTER (WHERE NOT ativo) AS maquinas_inativas
      FROM maquinas m
      ${whereClause}`;

    const [summaryResult, machineCountResult] = await Promise.all([
      query(summarySql, values),
      query(machineCountSql, values),
    ]);

    const summaryRow = summaryResult.rows[0] ?? {};
    const machineCountRow = machineCountResult.rows[0] ?? {};

    const response = {
      scope: req.user?.role || null,
      summary: {
        total_ciclos: normalizeNumber(summaryRow.total_ciclos),
        total_pecas: normalizeNumber(summaryRow.total_pecas),
        total_refugo: normalizeNumber(summaryRow.total_refugo),
        total_materia_prima: normalizeNumber(summaryRow.total_materia_prima),
        total_energia_kwh: normalizeNumber(summaryRow.total_energia_kwh),
        total_operadores: normalizeNumber(summaryRow.total_operadores),
        total_tipos_peca: normalizeNumber(summaryRow.total_tipos_peca),
        total_anomalias: normalizeNumber(summaryRow.total_anomalias),
        total_duration_seconds: normalizeNumber(summaryRow.total_duration_seconds),
        total_duration_hours: Number((normalizeNumber(summaryRow.total_duration_seconds) / 3600).toFixed(3)),
        maquinas_total: normalizeNumber(machineCountRow.maquinas_total),
        maquinas_ativas: normalizeNumber(machineCountRow.maquinas_ativas),
        maquinas_inativas: normalizeNumber(machineCountRow.maquinas_inativas),
      },
    };

    if (req.user?.role === "administrador") {
      const perClienteSql = `
        SELECT
          c.id AS cliente_id,
          c.nome AS cliente_nome,
          COUNT(DISTINCT m.id) AS maquinas_total,
          COUNT(DISTINCT m.id) FILTER (WHERE m.ativo) AS maquinas_ativas,
          COUNT(DISTINCT m.id) FILTER (WHERE NOT m.ativo) AS maquinas_inativas,
          COALESCE(SUM(cp.quantidade_pecas), 0) AS total_pecas,
          COALESCE(SUM(cp.quantidade_refugo), 0) AS total_refugo,
          COALESCE(SUM(cp.consumo_materia_prima), 0) AS total_materia_prima,
          COALESCE(SUM(cp.consumo_energia_kwh), 0) AS total_energia_kwh,
          COUNT(*) FILTER (WHERE cp.observacoes_anomalias IS NOT NULL AND trim(cp.observacoes_anomalias) <> '') AS total_anomalias
        FROM clientes c
        LEFT JOIN maquinas m ON m.cliente_id = c.id
        LEFT JOIN ciclos_producao cp ON cp.maquina_id = m.id
        GROUP BY c.id
        ORDER BY c.nome`;

      const perClienteResult = await query(perClienteSql);
      response.por_cliente = perClienteResult.rows.map((row) => ({
        cliente_id: normalizeNumber(row.cliente_id),
        cliente_nome: row.cliente_nome,
        maquinas_total: normalizeNumber(row.maquinas_total),
        maquinas_ativas: normalizeNumber(row.maquinas_ativas),
        maquinas_inativas: normalizeNumber(row.maquinas_inativas),
        total_pecas: normalizeNumber(row.total_pecas),
        total_refugo: normalizeNumber(row.total_refugo),
        total_materia_prima: normalizeNumber(row.total_materia_prima),
        total_energia_kwh: normalizeNumber(row.total_energia_kwh),
        total_anomalias: normalizeNumber(row.total_anomalias),
      }));
    }

    return res.status(200).json(response);
  } catch (err) {
    return next(err);
  }
});

router.get("/maquina/:id", async (req, res, next) => {
  try {
    const id = parseMaquinaId(req.params.id);
    if (!id) {
      return invalidIdResponse(res);
    }

    const clienteId = getClienteId(req);
    const machineSql = clienteId
      ? `SELECT id, cliente_id, nome, ativo FROM maquinas WHERE id = $1 AND cliente_id = $2 LIMIT 1`
      : `SELECT id, cliente_id, nome, ativo FROM maquinas WHERE id = $1 LIMIT 1`;
    const machineValues = clienteId ? [id, clienteId] : [id];
    const machineResult = await query(machineSql, machineValues);

    if (machineResult.rows.length === 0) {
      return res.status(404).json({ error: "Máquina não encontrada." });
    }

    const summarySql = `
      SELECT
        COUNT(*) AS total_ciclos,
        COALESCE(SUM(quantidade_pecas), 0) AS total_pecas,
        COALESCE(SUM(quantidade_refugo), 0) AS total_refugo,
        COALESCE(SUM(consumo_materia_prima), 0) AS total_materia_prima,
        COALESCE(SUM(consumo_energia_kwh), 0) AS total_energia_kwh,
        COUNT(DISTINCT operador) AS total_operadores,
        COUNT(DISTINCT tipo_peca) AS total_tipos_peca,
        COUNT(*) FILTER (WHERE observacoes_anomalias IS NOT NULL AND trim(observacoes_anomalias) <> '') AS total_anomalias,
        COALESCE(SUM(EXTRACT(EPOCH FROM (fim_ciclo - inicio_ciclo))), 0) AS total_duration_seconds
      FROM ciclos_producao
      WHERE maquina_id = $1`;
    const summaryResult = await query(summarySql, [id]);
    const row = summaryResult.rows[0] ?? {};

    return res.status(200).json({
      maquina: machineResult.rows[0],
      summary: {
        total_ciclos: normalizeNumber(row.total_ciclos),
        total_pecas: normalizeNumber(row.total_pecas),
        total_refugo: normalizeNumber(row.total_refugo),
        total_materia_prima: normalizeNumber(row.total_materia_prima),
        total_energia_kwh: normalizeNumber(row.total_energia_kwh),
        total_operadores: normalizeNumber(row.total_operadores),
        total_tipos_peca: normalizeNumber(row.total_tipos_peca),
        total_anomalias: normalizeNumber(row.total_anomalias),
        total_duration_seconds: normalizeNumber(row.total_duration_seconds),
        total_duration_hours: Number((normalizeNumber(row.total_duration_seconds) / 3600).toFixed(3)),
      },
    });
  } catch (err) {
    return next(err);
  }
});

export default router;

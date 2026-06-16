import express from "express";
import { query } from "../db.js";

const router = express.Router();

// Endpoint público para ingestão de telemetria por máquinas.
// Valida o token de comunicação da máquina e insere um ciclo de produção.

router.post("/", async (req, res, next) => {
  try {
    const token = req.headers["x-device-token"] || req.body?.token;

    if (!token || typeof token !== "string") {
      return res.status(401).json({ error: "Token de máquina ausente ou inválido." });
    }

    const maquinaRes = await query(
      `SELECT id, cliente_id, ativo FROM maquinas WHERE token_comunicacao = $1 LIMIT 1`,
      [token],
    );

    if (maquinaRes.rows.length === 0) {
      return res.status(401).json({ error: "Token de máquina inválido." });
    }

    const maquina = maquinaRes.rows[0];
    if (!maquina.ativo) {
      return res.status(403).json({ error: "Máquina inativa." });
    }

    // Extrai campos esperados do payload
    const operador = req.body?.operador ?? null;
    const tipoPeca = req.body?.tipo_peca ?? null;
    const quantidadePecas = Number(req.body?.quantidade_pecas ?? req.body?.quantidade ?? 0);
    const quantidadeRefugo = Number(req.body?.quantidade_refugo ?? req.body?.refugo ?? 0);
    const consumoMateria = req.body?.consumo_materia_prima !== undefined
      ? Number(req.body.consumo_materia_prima)
      : null;
    const consumoEnergia = req.body?.consumo_energia_kwh !== undefined
      ? Number(req.body.consumo_energia_kwh)
      : null;
    const observacoes = req.body?.observacoes_anomalias ?? req.body?.anomalias ?? null;
    const inicioCiclo = req.body?.inicio_ciclo ?? req.body?.inicio ?? new Date().toISOString();
    const fimCiclo = req.body?.fim_ciclo ?? req.body?.fim ?? null;

    if (!Number.isFinite(quantidadePecas) || quantidadePecas < 0) {
      return res.status(400).json({ error: "Campo 'quantidade_pecas' inválido." });
    }

    if (quantidadeRefugo === undefined || !Number.isFinite(quantidadeRefugo) || quantidadeRefugo < 0) {
      return res.status(400).json({ error: "Campo 'quantidade_refugo' inválido." });
    }

    const result = await query(
      `INSERT INTO ciclos_producao (
         maquina_id, operador, tipo_peca, quantidade_pecas,
         quantidade_refugo, consumo_materia_prima, consumo_energia_kwh,
         observacoes_anomalias, inicio_ciclo, fim_ciclo
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [
        maquina.id,
        operador,
        tipoPeca,
        quantidadePecas,
        quantidadeRefugo,
        consumoMateria,
        consumoEnergia,
        observacoes,
        inicioCiclo,
        fimCiclo,
      ],
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
});

export default router;

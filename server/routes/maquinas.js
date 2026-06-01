import express from "express";

import { query } from "../db.js";
import { authenticateJwt, requireRole } from "../middlewares/auth.js";
import {
  generateTokenComunicacao,
  normalizeNome,
  parseAtivo,
  parseMaquinaId,
} from "../utils/maquinaValidation.js";

const router = express.Router();

const MAQUINA_COLUMNS =
  "id, cliente_id, nome, token_comunicacao, ativo, criado_em, atualizado_em";

router.use(authenticateJwt, requireRole("cliente"));

function getClienteId(req) {
  return Number.parseInt(String(req.user?.sub), 10);
}

function invalidIdResponse(res) {
  return res.status(400).json({ error: "ID de máquina inválido." });
}

router.post("/", async (req, res, next) => {
  try {
    const clienteId = getClienteId(req);
    const nome = normalizeNome(req.body?.nome);
    const ativo = parseAtivo(req.body?.ativo, true);

    if (!nome) {
      return res.status(400).json({
        error: "Informe 'nome' válido com até 140 caracteres.",
      });
    }

    if (ativo === undefined) {
      return res.status(400).json({ error: "O campo 'ativo' deve ser booleano." });
    }

    const tokenComunicacao = generateTokenComunicacao();

    const result = await query(
      `INSERT INTO maquinas (cliente_id, nome, token_comunicacao, ativo)
       VALUES ($1, $2, $3, $4)
       RETURNING ${MAQUINA_COLUMNS}`,
      [clienteId, nome, tokenComunicacao, ativo],
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({
        error: "Token de comunicação duplicado. Tente novamente.",
      });
    }
    return next(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const clienteId = getClienteId(req);

    const result = await query(
      `SELECT ${MAQUINA_COLUMNS}
       FROM maquinas
       WHERE cliente_id = $1
       ORDER BY id DESC`,
      [clienteId],
    );

    return res.status(200).json(result.rows);
  } catch (err) {
    return next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const id = parseMaquinaId(req.params.id);
    if (!id) {
      return invalidIdResponse(res);
    }

    const clienteId = getClienteId(req);

    const result = await query(
      `SELECT ${MAQUINA_COLUMNS}
       FROM maquinas
       WHERE id = $1 AND cliente_id = $2
       LIMIT 1`,
      [id, clienteId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Máquina não encontrada." });
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const id = parseMaquinaId(req.params.id);
    if (!id) {
      return invalidIdResponse(res);
    }

    const clienteId = getClienteId(req);
    const nome = normalizeNome(req.body?.nome);
    const ativo = parseAtivo(req.body?.ativo);

    if (!nome || ativo === undefined) {
      return res.status(400).json({
        error: "Informe 'nome' válido e 'ativo' (booleano).",
      });
    }

    const result = await query(
      `UPDATE maquinas
       SET nome = $1, ativo = $2, atualizado_em = NOW()
       WHERE id = $3 AND cliente_id = $4
       RETURNING ${MAQUINA_COLUMNS}`,
      [nome, ativo, id, clienteId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Máquina não encontrada." });
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const id = parseMaquinaId(req.params.id);
    if (!id) {
      return invalidIdResponse(res);
    }

    const clienteId = getClienteId(req);
    const fields = [];
    const values = [];

    if (req.body?.nome !== undefined) {
      const nome = normalizeNome(req.body.nome);
      if (!nome) {
        return res.status(400).json({ error: "O campo 'nome' é inválido." });
      }
      fields.push(`nome = $${fields.length + 1}`);
      values.push(nome);
    }

    if (req.body?.ativo !== undefined) {
      const ativo = parseAtivo(req.body.ativo);
      if (ativo === undefined) {
        return res.status(400).json({ error: "O campo 'ativo' deve ser booleano." });
      }
      fields.push(`ativo = $${fields.length + 1}`);
      values.push(ativo);
    }

    if (fields.length === 0) {
      return res.status(400).json({
        error: "Informe ao menos um campo para atualizar: nome ou ativo.",
      });
    }

    fields.push("atualizado_em = NOW()");
    values.push(id, clienteId);

    const result = await query(
      `UPDATE maquinas
       SET ${fields.join(", ")}
       WHERE id = $${values.length - 1} AND cliente_id = $${values.length}
       RETURNING ${MAQUINA_COLUMNS}`,
      values,
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Máquina não encontrada." });
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const id = parseMaquinaId(req.params.id);
    if (!id) {
      return invalidIdResponse(res);
    }

    const clienteId = getClienteId(req);

    const result = await query(
      `DELETE FROM maquinas
       WHERE id = $1 AND cliente_id = $2
       RETURNING id`,
      [id, clienteId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Máquina não encontrada." });
    }

    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

export default router;

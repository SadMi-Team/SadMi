import express from "express";

import { query } from "../db.js";
import { authenticateJwt } from "../middlewares/auth.js";
import {
  generateTokenComunicacao,
  normalizeNome,
  parseAtivo,
  parseMaquinaId,
} from "../utils/maquinaValidation.js";

const router = express.Router();

const MAQUINA_COLUMNS =
  "id, cliente_id, nome, token_comunicacao, ativo, criado_em, atualizado_em";

router.use(authenticateJwt);

function getClienteId(req) {
  if (req.user?.role === "cliente") {
    return Number.parseInt(String(req.user?.sub), 10);
  }
  return null;
}

function getQueryClienteId(req) {
  if (req.user?.role === "administrador" && req.query?.cliente_id) {
    const clienteId = Number.parseInt(String(req.query.cliente_id), 10);
    return Number.isInteger(clienteId) && clienteId > 0 ? clienteId : null;
  }
  return null;
}

function invalidIdResponse(res) {
  return res.status(400).json({ error: "ID de máquina inválido." });
}

router.post("/", async (req, res, next) => {
  try {
    // permite que administrador crie máquinas para qualquer cliente passando `cliente_id` no body
    let clienteId = getClienteId(req);
    if (req.user?.role === "administrador") {
      clienteId = req.body?.cliente_id ? Number.parseInt(String(req.body.cliente_id), 10) : null;
    }

    if (!clienteId) {
      return res.status(400).json({ error: "Administradores devem informar 'cliente_id' no corpo da requisição." });
    }

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
    const queryClienteId = getQueryClienteId(req);

    let sql = `SELECT ${MAQUINA_COLUMNS} FROM maquinas`;
    const values = [];

    if (clienteId) {
      sql += ` WHERE cliente_id = $1`;
      values.push(clienteId);
    } else if (queryClienteId) {
      sql += ` WHERE cliente_id = $1`;
      values.push(queryClienteId);
    }

    sql += ` ORDER BY id DESC`;

    const result = await query(sql, values);

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
    let sql = `SELECT ${MAQUINA_COLUMNS} FROM maquinas WHERE id = $1`;
    const values = [id];

    if (clienteId) {
      sql += ` AND cliente_id = $2`;
      values.push(clienteId);
    }

    sql += ` LIMIT 1`;

    const result = await query(sql, values);

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

    let sql = `UPDATE maquinas
       SET nome = $1, ativo = $2, atualizado_em = NOW()
       WHERE id = $3`;
    const values = [nome, ativo, id];
    if (clienteId) {
      sql += ` AND cliente_id = $4`;
      values.push(clienteId);
    }

    sql += ` RETURNING ${MAQUINA_COLUMNS}`;

    const result = await query(sql, values);

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
    values.push(id);

    let sql = `UPDATE maquinas
       SET ${fields.join(", ")}
       WHERE id = $${values.length}`;
    if (clienteId) {
      sql += ` AND cliente_id = $${values.length + 1}`;
      values.push(clienteId);
    }

    sql += ` RETURNING ${MAQUINA_COLUMNS}`;

    const result = await query(sql, values);

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
    let sql = `DELETE FROM maquinas WHERE id = $1`;
    const values = [id];
    if (clienteId) {
      sql += ` AND cliente_id = $2`;
      values.push(clienteId);
    }

    const result = await query(`${sql} RETURNING id`, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Máquina não encontrada." });
    }

    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

export default router;

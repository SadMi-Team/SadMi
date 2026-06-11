import express from "express";
import crypto from "crypto";

import { query } from "../db.js";
import { authenticateJwt } from "../middlewares/auth.js";
import { normalizeNome, parseAtivo, parseClienteId } from "../utils/clienteValidation.js";

const router = express.Router();
router.use(authenticateJwt);

const MAQUINA_COLUMNS =
  "id, cliente_id, nome, token_comunicacao, ativo, criado_em, atualizado_em";

function generateMachineToken() {
  return crypto.randomBytes(32).toString("hex");
}

function getCreateClienteId(req) {
  const userId = parseClienteId(req.user.sub);
  if (!userId) {
    return null;
  }

  if (req.user.role === "administrador") {
    const clienteId = parseClienteId(req.body?.cliente_id);
    return clienteId;
  }

  return userId;
}

function isAuthorizedForMachine(req, machine) {
  if (req.user.role === "administrador") {
    return true;
  }
  return String(machine.cliente_id) === String(req.user.sub);
}

router.post("/", async (req, res, next) => {
  try {
    const nome = normalizeNome(req.body?.nome);
    const ativo = parseAtivo(req.body?.ativo, true);
    const clienteId = getCreateClienteId(req);

    if (!nome) {
      return res.status(400).json({ error: "O campo 'nome' é obrigatório." });
    }

    if (!clienteId) {
      return res.status(400).json({ error: "O campo 'cliente_id' é obrigatório para administrador." });
    }

    const token = generateMachineToken();
    const result = await query(
      `INSERT INTO maquinas (cliente_id, nome, token_comunicacao, ativo)
       VALUES ($1, $2, $3, $4)
       RETURNING ${MAQUINA_COLUMNS}`,
      [clienteId, nome, token, ativo],
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Falha ao criar máquina. Tente novamente." });
    }
    return next(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const userId = parseClienteId(req.user.sub);
    let sql = `SELECT ${MAQUINA_COLUMNS} FROM maquinas`;
    const values = [];

    if (req.user.role === "cliente") {
      sql += " WHERE cliente_id = $1";
      values.push(userId);
    } else if (req.query.cliente_id) {
      const clienteId = parseClienteId(req.query.cliente_id);
      if (!clienteId) {
        return res.status(400).json({ error: "O parâmetro 'cliente_id' é inválido." });
      }
      sql += " WHERE cliente_id = $1";
      values.push(clienteId);
    }

    sql += " ORDER BY id DESC";
    const result = await query(sql, values);
    return res.status(200).json(result.rows);
  } catch (err) {
    return next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const id = parseClienteId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "ID de máquina inválido." });
    }

    const result = await query(
      `SELECT ${MAQUINA_COLUMNS}
       FROM maquinas
       WHERE id = $1
       LIMIT 1`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Máquina não encontrada." });
    }

    const machine = result.rows[0];
    if (!isAuthorizedForMachine(req, machine)) {
      return res.status(403).json({ error: "Acesso negado." });
    }

    return res.status(200).json(machine);
  } catch (err) {
    return next(err);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const id = parseClienteId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "ID de máquina inválido." });
    }

    const selectResult = await query(
      `SELECT ${MAQUINA_COLUMNS}
       FROM maquinas
       WHERE id = $1
       LIMIT 1`,
      [id],
    );

    if (selectResult.rows.length === 0) {
      return res.status(404).json({ error: "Máquina não encontrada." });
    }

    const machine = selectResult.rows[0];
    if (!isAuthorizedForMachine(req, machine)) {
      return res.status(403).json({ error: "Acesso negado." });
    }

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
      return res.status(400).json({ error: "Informe ao menos um campo para atualizar: nome ou ativo." });
    }

    fields.push("atualizado_em = NOW()");
    values.push(id);

    const updateResult = await query(
      `UPDATE maquinas
       SET ${fields.join(", ")}
       WHERE id = $${values.length}
       RETURNING ${MAQUINA_COLUMNS}`,
      values,
    );

    return res.status(200).json(updateResult.rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const id = parseClienteId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "ID de máquina inválido." });
    }

    const selectResult = await query(
      `SELECT cliente_id
       FROM maquinas
       WHERE id = $1
       LIMIT 1`,
      [id],
    );

    if (selectResult.rows.length === 0) {
      return res.status(404).json({ error: "Máquina não encontrada." });
    }

    const machine = selectResult.rows[0];
    if (!isAuthorizedForMachine(req, machine)) {
      return res.status(403).json({ error: "Acesso negado." });
    }

    await query(
      `DELETE FROM maquinas
       WHERE id = $1`,
      [id],
    );

    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

export default router;

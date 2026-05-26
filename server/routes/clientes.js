import express from "express";
import bcrypt from "bcryptjs";

import { query } from "../db.js";
import { authenticateJwt, requireRole } from "../middlewares/auth.js";
import {
  normalizeEmail,
  normalizeNome,
  parseAtivo,
  parseClienteId,
  validateSenha,
} from "../utils/clienteValidation.js";

const router = express.Router();

const CLIENTE_COLUMNS =
  "id, nome, email, ativo, criado_em, atualizado_em";

router.use(authenticateJwt, requireRole("administrador"));

function invalidIdResponse(res) {
  return res.status(400).json({ error: "ID de cliente inválido." });
}

router.post("/", async (req, res, next) => {
  try {
    const nome = normalizeNome(req.body?.nome);
    const email = normalizeEmail(req.body?.email);
    const senha = validateSenha(req.body?.senha, { required: true });
    const ativo = parseAtivo(req.body?.ativo, true);

    if (!nome || !email || senha === null) {
      return res.status(400).json({
        error:
          "Informe 'nome', 'email' válido e 'senha' com no mínimo 6 caracteres.",
      });
    }

    if (ativo === undefined) {
      return res.status(400).json({ error: "O campo 'ativo' deve ser booleano." });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const result = await query(
      `INSERT INTO clientes (nome, email, senha_hash, ativo)
       VALUES ($1, $2, $3, $4)
       RETURNING ${CLIENTE_COLUMNS}`,
      [nome, email, senhaHash, ativo],
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Já existe cliente com este email." });
    }
    return next(err);
  }
});

router.get("/", async (_req, res, next) => {
  try {
    const result = await query(
      `SELECT ${CLIENTE_COLUMNS}
       FROM clientes
       ORDER BY id DESC`,
    );

    return res.status(200).json(result.rows);
  } catch (err) {
    return next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const id = parseClienteId(req.params.id);
    if (!id) {
      return invalidIdResponse(res);
    }

    const result = await query(
      `SELECT ${CLIENTE_COLUMNS}
       FROM clientes
       WHERE id = $1
       LIMIT 1`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Cliente não encontrado." });
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const id = parseClienteId(req.params.id);
    if (!id) {
      return invalidIdResponse(res);
    }

    const nome = normalizeNome(req.body?.nome);
    const email = normalizeEmail(req.body?.email);
    const senha = validateSenha(req.body?.senha);
    const ativo = parseAtivo(req.body?.ativo);

    if (!nome || !email || ativo === undefined) {
      return res.status(400).json({
        error: "Informe 'nome', 'email' válido e 'ativo' (booleano).",
      });
    }

    if (senha === null) {
      return res.status(400).json({
        error: "A 'senha', quando informada, deve ter no mínimo 6 caracteres.",
      });
    }

    const values = [nome, email, ativo];
    let updateSql = `
      UPDATE clientes
      SET nome = $1, email = $2, ativo = $3, atualizado_em = NOW()
    `;

    if (senha !== undefined) {
      const senhaHash = await bcrypt.hash(senha, 10);
      updateSql += ", senha_hash = $4";
      values.push(senhaHash);
    }

    updateSql += ` WHERE id = $${values.length + 1} RETURNING ${CLIENTE_COLUMNS}`;
    values.push(id);

    const result = await query(updateSql, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Cliente não encontrado." });
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Já existe cliente com este email." });
    }
    return next(err);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const id = parseClienteId(req.params.id);
    if (!id) {
      return invalidIdResponse(res);
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

    if (req.body?.email !== undefined) {
      const email = normalizeEmail(req.body.email);
      if (!email) {
        return res.status(400).json({ error: "O campo 'email' é inválido." });
      }
      fields.push(`email = $${fields.length + 1}`);
      values.push(email);
    }

    if (req.body?.ativo !== undefined) {
      const ativo = parseAtivo(req.body.ativo);
      if (ativo === undefined) {
        return res.status(400).json({ error: "O campo 'ativo' deve ser booleano." });
      }
      fields.push(`ativo = $${fields.length + 1}`);
      values.push(ativo);
    }

    if (req.body?.senha !== undefined) {
      const senha = validateSenha(req.body.senha, { required: true });
      if (senha === null) {
        return res.status(400).json({
          error: "A 'senha' deve ter no mínimo 6 caracteres.",
        });
      }
      const senhaHash = await bcrypt.hash(senha, 10);
      fields.push(`senha_hash = $${fields.length + 1}`);
      values.push(senhaHash);
    }

    if (fields.length === 0) {
      return res.status(400).json({
        error: "Informe ao menos um campo para atualizar: nome, email, senha ou ativo.",
      });
    }

    fields.push("atualizado_em = NOW()");
    values.push(id);

    const result = await query(
      `UPDATE clientes
       SET ${fields.join(", ")}
       WHERE id = $${values.length}
       RETURNING ${CLIENTE_COLUMNS}`,
      values,
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Cliente não encontrado." });
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Já existe cliente com este email." });
    }
    return next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const id = parseClienteId(req.params.id);
    if (!id) {
      return invalidIdResponse(res);
    }

    const result = await query(
      `DELETE FROM clientes
       WHERE id = $1
       RETURNING id`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Cliente não encontrado." });
    }

    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

export default router;

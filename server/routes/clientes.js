import express from "express";
import bcrypt from "bcryptjs";

import { query } from "../db.js";
import { authenticateJwt, requireRole } from "../middlewares/auth.js";

const router = express.Router();

router.use(authenticateJwt, requireRole("administrador"));

router.post("/", async (req, res, next) => {
  try {
    const { nome, email, senha, ativo = true } = req.body ?? {};

    if (!nome || !email || !senha) {
      return res.status(400).json({
        error: "Os campos 'nome', 'email' e 'senha' são obrigatórios.",
      });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const result = await query(
      `INSERT INTO clientes (nome, email, senha_hash, ativo)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nome, email, ativo, criado_em, atualizado_em`,
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
      `SELECT id, nome, email, ativo, criado_em, atualizado_em
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
    const { id } = req.params;
    const result = await query(
      `SELECT id, nome, email, ativo, criado_em, atualizado_em
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
    const { id } = req.params;
    const { nome, email, senha, ativo } = req.body ?? {};

    if (!nome || !email || typeof ativo !== "boolean") {
      return res.status(400).json({
        error: "Os campos 'nome', 'email' e 'ativo' são obrigatórios.",
      });
    }

    let updateQuery = `
      UPDATE clientes
      SET nome = $1, email = $2, ativo = $3, atualizado_em = NOW()
    `;
    const values = [nome, email, ativo];

    if (senha) {
      const senhaHash = await bcrypt.hash(senha, 10);
      updateQuery += ", senha_hash = $4";
      values.push(senhaHash);
    }

    updateQuery += ` WHERE id = $${values.length + 1}
      RETURNING id, nome, email, ativo, criado_em, atualizado_em`;
    values.push(id);

    const result = await query(updateQuery, values);

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
    const { id } = req.params;
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

import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import { query } from "../db.js";

const router = express.Router();

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET não configurado no ambiente");
  }
  return secret;
}

async function findUserByEmail(email) {
  const adminResult = await query(
    "SELECT id, nome, email, senha_hash, ativo FROM administradores WHERE email = $1 LIMIT 1",
    [email],
  );

  if (adminResult.rows.length > 0) {
    return { ...adminResult.rows[0], role: "administrador" };
  }

  const clientResult = await query(
    "SELECT id, nome, email, senha_hash, ativo FROM clientes WHERE email = $1 LIMIT 1",
    [email],
  );

  if (clientResult.rows.length > 0) {
    return { ...clientResult.rows[0], role: "cliente" };
  }

  return null;
}

router.post("/login", async (req, res, next) => {
  try {
    const { email, senha } = req.body ?? {};

    if (!email || !senha) {
      return res.status(400).json({
        error: "Os campos 'email' e 'senha' são obrigatórios.",
      });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ error: "Credenciais inválidas." });
    }

    if (!user.ativo) {
      return res.status(403).json({ error: "Usuário inativo." });
    }

    const passwordMatches = await bcrypt.compare(senha, user.senha_hash);

    if (!passwordMatches) {
      return res.status(401).json({ error: "Credenciais inválidas." });
    }

    const jwtSecret = getJwtSecret();
    const expiresIn = process.env.JWT_EXPIRES_IN || "8h";

    const token = jwt.sign(
      {
        sub: String(user.id),
        role: user.role,
        email: user.email,
      },
      jwtSecret,
      { expiresIn },
    );

    return res.status(200).json({
      token,
      token_type: "Bearer",
      expires_in: expiresIn,
      usuario: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        perfil: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;

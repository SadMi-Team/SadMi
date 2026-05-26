import bcrypt from "bcryptjs";
import pg from "pg";

const { Pool } = pg;

export async function seedLoginUsers() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL não definida. Copie .env.example para .env e configure o PostgreSQL antes dos testes de integração.",
    );
  }

  // Garante criação do banco/tabelas antes do INSERT (mesmo fluxo do servidor)
  await import("../../app.js");

  const pool = new Pool({ connectionString });

  try {
    const senhaHash = await bcrypt.hash("123456", 10);

    await pool.query(
      `INSERT INTO administradores (nome, email, senha_hash, ativo)
       VALUES ($1, $2, $3, true)
       ON CONFLICT (email) DO UPDATE
       SET senha_hash = EXCLUDED.senha_hash, ativo = true`,
      ["Admin Teste", "admin@teste.com", senhaHash],
    );

    await pool.query(
      `INSERT INTO clientes (nome, email, senha_hash, ativo)
       VALUES ($1, $2, $3, true)
       ON CONFLICT (email) DO UPDATE
       SET senha_hash = EXCLUDED.senha_hash, ativo = true`,
      ["Cliente Teste", "cliente@teste.com", senhaHash],
    );
  } finally {
    await pool.end();
  }
}

import "dotenv/config";
import bcrypt from "bcryptjs";
import pg from "pg";

const { Pool } = pg;

async function seedLoginUsers() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const senhaHash = await bcrypt.hash("123456", 10);

    await pool.query(
      "INSERT INTO administradores (nome,email,senha_hash,ativo) VALUES ($1,$2,$3,true) ON CONFLICT (email) DO UPDATE SET senha_hash=EXCLUDED.senha_hash, ativo=true",
      ["Admin Teste", "admin@teste.com", senhaHash],
    );

    await pool.query(
      "INSERT INTO clientes (nome,email,senha_hash,ativo) VALUES ($1,$2,$3,true) ON CONFLICT (email) DO UPDATE SET senha_hash=EXCLUDED.senha_hash, ativo=true",
      ["Cliente Teste", "cliente@teste.com", senhaHash],
    );

    console.log("Seed OK");
  } finally {
    await pool.end();
  }
}

seedLoginUsers().catch((error) => {
  console.error("Seed falhou:", error.message);
  process.exit(1);
});

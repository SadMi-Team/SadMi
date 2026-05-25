import pg from "pg";
import logger from "./logger.js";
import { initializeDatabase } from "./initDb.js";

const { Pool } = pg;

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/gestorDinheiro",
});

pool.on("error", (err) => {
  logger.error(`Erro inesperado no pool do PostgreSQL: ${err.message}`);
});

// Initialize database on startup
await initializeDatabase(pool).catch((err) => {
  logger.error(`Falha ao inicializar banco de dados: ${err.message}`);
  process.exit(1);
});

// Test the connection
try {
  const result = await pool.query("SELECT NOW()");
  logger.info(`✓ Conexão com banco de dados estabelecida com sucesso! Timestamp: ${result.rows[0].now}`);
} catch (err) {
  logger.error(`✗ Falha ao conectar ao banco de dados: ${err.message}`);
  process.exit(1);
}

export async function query(text, params = []) {
  return pool.query(text, params);
}

export default pool;

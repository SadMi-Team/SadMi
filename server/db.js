import pg from "pg";
import logger from "./logger.js";

const { Pool } = pg;

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/gestorDinheiro",
});

pool.on("error", (err) => {
  logger.error(`Erro inesperado no pool do PostgreSQL: ${err.message}`);
});

export async function query(text, params = []) {
  return pool.query(text, params);
}

export default pool;

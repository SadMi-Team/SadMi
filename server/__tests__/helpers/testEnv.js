import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Padrão do projeto: PostgreSQL local, usuário postgres, senha root, banco sadmi. */
export const DEFAULT_DATABASE_URL =
  "postgresql://postgres:root@localhost:5432/sadmi";

const { Pool } = pg;

export function applyTestEnv() {
  const rootDir = path.resolve(__dirname, "../../..");
  const serverDir = path.resolve(__dirname, "../..");

  dotenv.config({ path: path.join(rootDir, ".env"), override: true });
  dotenv.config({ path: path.join(serverDir, ".env"), override: true });
  dotenv.config({ path: path.join(rootDir, ".env.example"), override: true });

  if (!process.env.DATABASE_URL?.trim()) {
    process.env.DATABASE_URL = DEFAULT_DATABASE_URL;
  }

  if (!process.env.JWT_SECRET?.trim()) {
    process.env.JWT_SECRET = "test-jwt-secret";
  }

  process.env.NODE_ENV = "test";
}

function getDatabaseInfo(connectionString) {
  const databaseName = connectionString.split("/").pop().split("?")[0];
  const adminUrl = connectionString.replace(`/${databaseName}`, "/postgres");
  return { databaseName, adminUrl };
}

/** Cria o banco sadmi (ou o nome em DATABASE_URL) se ainda não existir. */
export async function ensureDatabaseExists(connectionString = process.env.DATABASE_URL) {
  const { databaseName, adminUrl } = getDatabaseInfo(connectionString);

  const adminPool = new Pool({ connectionString: adminUrl });

  try {
    const result = await adminPool.query(
      "SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = $1) AS exists",
      [databaseName],
    );

    if (!result.rows[0].exists) {
      await adminPool.query(`CREATE DATABASE "${databaseName}"`);
    }
  } finally {
    await adminPool.end();
  }
}

export async function checkDatabaseReady() {
  const connectionString = process.env.DATABASE_URL?.trim() || DEFAULT_DATABASE_URL;
  process.env.DATABASE_URL = connectionString;

  try {
    await ensureDatabaseExists(connectionString);

    const pool = new Pool({
      connectionString,
      connectionTimeoutMillis: 5_000,
    });

    try {
      await pool.query("SELECT 1");
      return { ready: true, message: "" };
    } finally {
      await pool.end();
    }
  } catch (error) {
    let message = error.message;

    if (error.code === "28P01") {
      message +=
        "\nVerifique se o PostgreSQL está com usuário postgres e senha root.";
    } else if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
      message += "\nVerifique se o PostgreSQL está em execução (localhost:5432).";
    }

    return { ready: false, message };
  }
}

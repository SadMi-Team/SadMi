const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const pg = require("pg");

const stateFile = path.join(__dirname, ".jest-db-state.json");

module.exports = async () => {
  const serverDir = path.resolve(__dirname, "..");
  dotenv.config({ path: path.resolve(serverDir, "../.env"), override: true });
  dotenv.config({ path: path.resolve(serverDir, ".env"), override: true });

  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = "test-jwt-secret";
  }

  const connectionString = process.env.DATABASE_URL?.trim();
  let ready = false;
  let message = "";

  if (!connectionString) {
    message = "DATABASE_URL não definida no .env";
  } else {
    const pool = new pg.Pool({
      connectionString,
      connectionTimeoutMillis: 5_000,
    });

    try {
      await pool.query("SELECT 1");
      ready = true;
    } catch (error) {
      message = error.message;
      if (error.code === "28P01") {
        message +=
          "\nSenha incorreta: edite DATABASE_URL no .env (postgresql://postgres:SUA_SENHA@localhost:5432/sadmi).";
      } else if (error.code === "3D000") {
        message +=
          "\nBanco inexistente: inicie o servidor uma vez (npm run dev) ou crie o banco 'sadmi' no PostgreSQL.";
      }
    } finally {
      await pool.end();
    }
  }

  fs.writeFileSync(stateFile, JSON.stringify({ ready, message }));

  if (!ready) {
    // eslint-disable-next-line no-console
    console.warn(`\n[Testes de integração ignorados] ${message}\n`);
  }
};

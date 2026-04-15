import pg from "pg";
import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function debug() {
  try {
    // Get actual columns from database
    const result = await pool.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position",
      ["ciclos_producao"]
    );
    
    const actualColumns = result.rows.map(r => r.column_name);
    console.log("✅ Colunas no banco de dados:");
    console.log(actualColumns);
    
    // Extract expected columns from schema.sql
    const schemaPath = path.join(__dirname, "db", "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");
    
    // Find the ciclos_producao table definition
    const tableMatch = schema.match(/CREATE TABLE IF NOT EXISTS ciclos_producao\s*\(([\s\S]*?)\);/);
    if (tableMatch) {
      console.log("\n📄 Conteúdo da tabela ciclos_producao no schema.sql:");
      console.log(tableMatch[1]);
    }
    
    await pool.end();
  } catch (err) {
    console.error("Erro:", err.message);
  }
}

debug();

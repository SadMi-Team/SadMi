import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import logger from "./logger.js";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

/**
 * Extracts database name and admin URL from DATABASE_URL
 * @returns {Object} - {databaseName, adminUrl}
 */
function getDatabaseInfo() {
  const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres:root@localhost:5432/gestorDinheiro";
  const databaseName = databaseUrl.split("/").pop().split("?")[0];
  
  // Create admin connection URL (connecting to 'postgres' database instead)
  const adminUrl = databaseUrl.replace(`/${databaseName}`, "/postgres");
  
  return { databaseName, adminUrl };
}

/**
 * Checks if a database exists
 * @param {string} databaseName - The name of the database to check
 * @param {string} adminUrl - The connection URL to the admin database
 * @returns {Promise<boolean>} - Returns true if database exists, false otherwise
 */
async function databaseExists(databaseName, adminUrl) {
  try {
    const tempPool = new Pool({
      connectionString: adminUrl,
    });

    const result = await tempPool.query(
      "SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = $1)",
      [databaseName]
    );

    await tempPool.end();
    return result.rows[0].exists;
  } catch (err) {
    logger.error(`Erro ao verificar existência do banco de dados: ${err.message}`);
    return false;
  }
}

/**
 * Creates the database if it doesn't exist
 * @returns {Promise<void>}
 */
async function createDatabaseIfNotExists() {
  const { databaseName, adminUrl } = getDatabaseInfo();

  const exists = await databaseExists(databaseName, adminUrl);

  if (!exists) {
    try {
      logger.info(`Criando banco de dados "${databaseName}"...`);

      const tempPool = new Pool({
        connectionString: adminUrl,
      });

      await tempPool.query(`CREATE DATABASE "${databaseName}"`);
      await tempPool.end();

      logger.info(`Banco de dados "${databaseName}" criado com sucesso!`);
    } catch (err) {
      logger.error(`Erro ao criar banco de dados: ${err.message}`);
      throw err;
    }
  } else {
    logger.info(`Banco de dados "${databaseName}" já existe.`);
  }
}

/**
 * Checks which tables exist in the database
 * @param {pg.Pool} pool - The database pool
 * @returns {Promise<Object>} - Object with table names and their existence status
 */
async function checkTablesStatus(pool) {
  const requiredTables = ['administradores', 'clientes', 'maquinas', 'ciclos_producao'];
  const tablesStatus = {};

  try {
    for (const tableName of requiredTables) {
      const result = await pool.query(
        `SELECT EXISTS(
          SELECT 1 FROM information_schema.tables 
          WHERE table_name = $1
        )`,
        [tableName]
      );
      tablesStatus[tableName] = result.rows[0].exists;
    }
    return tablesStatus;
  } catch (err) {
    logger.error(`Erro ao verificar status das tabelas: ${err.message}`);
    throw err;
  }
}

/**
 * Checks if all required tables exist
 * @param {pg.Pool} pool - The database pool
 * @returns {Promise<boolean>} - Returns true if all tables exist, false otherwise
 */
async function isDatabaseInstalled(pool) {
  try {
    const tablesStatus = await checkTablesStatus(pool);
    const allTablesExist = Object.values(tablesStatus).every(exists => exists);
    
    if (!allTablesExist) {
      const missingTables = Object.entries(tablesStatus)
        .filter(([_, exists]) => !exists)
        .map(([name, _]) => name);
      logger.warn(`Tabelas faltando: ${missingTables.join(', ')}`);
    }
    
    return allTablesExist;
  } catch (err) {
    logger.error(`Erro ao verificar instalação do banco de dados: ${err.message}`);
    return false;
  }
}

/**
 * Gets the columns of a table
 * @param {pg.Pool} pool - The database pool
 * @param {string} tableName - The table name
 * @returns {Promise<Array>} - Array of column names
 */
async function getTableColumns(pool, tableName) {
  try {
    const result = await pool.query(
      `SELECT column_name FROM information_schema.columns 
       WHERE table_name = $1 
       ORDER BY ordinal_position`,
      [tableName]
    );
    return result.rows.map(row => row.column_name);
  } catch (err) {
    logger.error(`Erro ao obter colunas da tabela ${tableName}: ${err.message}`);
    return [];
  }
}

/**
 * Extracts expected columns from schema.sql
 * @returns {Object} - Object mapping table names to their expected columns
 */
function getExpectedColumnsFromSchema() {
  const schemaPath = path.join(__dirname, "db", "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf8");
  
  const expectedColumns = {
    administradores: [],
    clientes: [],
    maquinas: [],
    ciclos_producao: []
  };

  // Parse CREATE TABLE statements - match everything between CREATE TABLE and the closing );
  const createTableRegex = /CREATE TABLE IF NOT EXISTS (\w+)\s*\(([\s\S]*?)\);\s*(?=CREATE|$)/g;
  let tableMatch;

  while ((tableMatch = createTableRegex.exec(schema)) !== null) {
    const tableName = tableMatch[1];
    const tableContent = tableMatch[2];

    // Split by lines and look for column definitions
    const lines = tableContent.split('\n');
    
    for (const line of lines) {
      // Match the first word in a line that looks like a column name (not a constraint)
      const trimmedLine = line.trim();
      
      // Skip empty lines and constraint lines
      if (!trimmedLine || trimmedLine.startsWith('PRIMARY KEY') || 
          trimmedLine.startsWith('FOREIGN KEY') || trimmedLine.startsWith('CHECK') ||
          trimmedLine.startsWith('UNIQUE') || trimmedLine.startsWith('DEFAULT') ||
          trimmedLine.startsWith('REFERENCES') || trimmedLine.startsWith('ON ')) {
        continue;
      }
      
      // Extract the column name (first word) if it's followed by a data type
      const columnMatch = trimmedLine.match(/^(\w+)\s+(\w+)/);
      if (columnMatch) {
        const columnName = columnMatch[1];
        const dataType = columnMatch[2];
        
        // Verify it's a valid data type (not a keyword like CONSTRAINT, etc)
        const validTypes = ['BIGSERIAL', 'VARCHAR', 'TEXT', 'BOOLEAN', 'NUMERIC', 
                           'INTEGER', 'TIMESTAMPTZ', 'BIGINT'];
        
        if (validTypes.includes(dataType.toUpperCase())) {
          if (expectedColumns.hasOwnProperty(tableName) && !expectedColumns[tableName].includes(columnName)) {
            expectedColumns[tableName].push(columnName);
          }
        }
      }
    }
  }

  return expectedColumns;
}

/**
 * Extracts column definition from schema.sql for a specific column
 * @param {string} tableName - The table name
 * @param {string} columnName - The column name
 * @returns {string|null} - The column definition or null if not found
 */
function getColumnDefinitionFromSchema(tableName, columnName) {
  const schemaPath = path.join(__dirname, "db", "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf8");
  
  // Find the table definition
  const tableRegex = new RegExp(`CREATE TABLE IF NOT EXISTS ${tableName}\\s*\\(([\\s\\S]*?)\\);`, 'g');
  const tableMatch = tableRegex.exec(schema);
  
  if (!tableMatch) return null;
  
  const tableContent = tableMatch[1];
  const lines = tableContent.split('\n');
  
  // Find the line with the column definition
  let columnDefLines = [];
  let foundColumn = false;
  
  for (let i = 0; i < lines.length; i++) {
    const trimmedLine = lines[i].trim();
    
    // Check if this line starts the column definition
    if (trimmedLine.startsWith(columnName + ' ')) {
      foundColumn = true;
      columnDefLines.push(trimmedLine);
    } else if (foundColumn) {
      // If we found the column and this line doesn't continue it, stop
      if (trimmedLine === '' || trimmedLine.startsWith(',') || trimmedLine === ')') {
        break;
      }
      // Check if line continues the column definition (doesn't start a new column)
      if (!/^\w+\s+(?:BIGSERIAL|VARCHAR|TEXT|BOOLEAN|NUMERIC|INTEGER|TIMESTAMPTZ|BIGINT)/i.test(trimmedLine)) {
        columnDefLines.push(trimmedLine);
      } else {
        break;
      }
    }
  }
  
  if (columnDefLines.length === 0) return null;
  
  let columnDef = columnDefLines.join(' ').trim();
  // Remove trailing comma if present
  if (columnDef.endsWith(',')) {
    columnDef = columnDef.slice(0, -1).trim();
  }
  
  return columnDef;
}

/**
 * Adds missing columns to a table
 * @param {pg.Pool} pool - The database pool
 * @param {string} tableName - The table name
 * @param {Array<string>} missingColumns - Array of missing column names
 * @returns {Promise<void>}
 */
async function addMissingColumns(pool, tableName, missingColumns) {
  try {
    logger.info(`\n  📝 Adicionando colunas faltando à tabela '${tableName}'...`);
    
    for (const columnName of missingColumns) {
      const columnDef = getColumnDefinitionFromSchema(tableName, columnName);
      
      if (!columnDef) {
        logger.warn(`    ⚠️  Não foi possível encontrar definição para coluna '${columnName}'`);
        continue;
      }
      
      try {
        // Remove the column name prefix to get just the definition
        const definition = columnDef.substring(columnName.length).trim();
        const alterSQL = `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`;
        
        await pool.query(alterSQL);
        logger.info(`    ✅ Coluna '${columnName}' adicionada com sucesso`);
      } catch (err) {
        logger.warn(`    ⚠️  Erro ao adicionar coluna '${columnName}': ${err.message}`);
      }
    }
  } catch (err) {
    logger.error(`Erro ao adicionar colunas à tabela ${tableName}: ${err.message}`);
    throw err;
  }
}

/**
 * Verifies table structure (columns)
 * @param {pg.Pool} pool - The database pool
 * @returns {Promise<Object>} - Object with table structure verification results
 */
async function verifyTableStructure(pool) {
  const requiredTables = ['administradores', 'clientes', 'maquinas', 'ciclos_producao'];
  const expectedColumns = getExpectedColumnsFromSchema();
  const structureStatus = {};

  logger.info("\n🔍 Verificando estrutura das tabelas...");

  for (const tableName of requiredTables) {
    const actualColumns = await getTableColumns(pool, tableName);
    const expectedCols = expectedColumns[tableName] || [];
    
    const missingColumns = expectedCols.filter(col => !actualColumns.includes(col));
    const extraColumns = actualColumns.filter(col => !expectedCols.includes(col));

    structureStatus[tableName] = {
      exists: actualColumns.length > 0,
      expectedColumns: expectedCols,
      actualColumns: actualColumns,
      missingColumns: missingColumns,
      extraColumns: extraColumns,
      isComplete: missingColumns.length === 0
    };

    if (missingColumns.length > 0) {
      logger.warn(`  ⚠️  Tabela '${tableName}' com colunas faltando: ${missingColumns.join(', ')}`);
    } else if (actualColumns.length > 0) {
      logger.info(`  ✅ Tabela '${tableName}' está completa (${actualColumns.length} colunas)`);
    }
  }

  return structureStatus;
}

/**
 * Checks if all database structure is complete
 * @param {pg.Pool} pool - The database pool
 * @returns {Promise<boolean>} - True if all tables and columns exist
 */
async function isDatabaseStructureComplete(pool) {
  const structureStatus = await verifyTableStructure(pool);
  return Object.values(structureStatus).every(status => status.isComplete);
}

/**
 * Installs the database schema by executing the schema.sql file
 * @param {pg.Pool} pool - The database pool
 * @returns {Promise<void>}
 */
async function installDatabase(pool) {
  try {
    const schemaPath = path.join(__dirname, "db", "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    // Split the schema into individual statements and execute them
    const statements = schema
      .split(";")
      .map((statement) => statement.trim())
      .filter((statement) => statement.length > 0);

    logger.info(`Executando ${statements.length} declarações SQL...`);

    let successCount = 0;
    for (const statement of statements) {
      try {
        await pool.query(statement);
        successCount++;
        logger.debug(`SQL executado com sucesso: ${statement.substring(0, 50)}...`);
      } catch (err) {
        // Log the error but continue with other statements
        logger.warn(`Erro ao executar SQL: ${err.message}`);
        logger.debug(`SQL com erro: ${statement}`);
      }
    }

    logger.info(`Banco de dados instalado com sucesso! (${successCount}/${statements.length} declarações)`);
    
    // Verify all tables were created
    const tablesStatus = await checkTablesStatus(pool);
    const allTablesExist = Object.values(tablesStatus).every(exists => exists);
    
    if (!allTablesExist) {
      const missingTables = Object.entries(tablesStatus)
        .filter(([_, exists]) => !exists)
        .map(([name, _]) => name);
      logger.error(`Atenção: As seguintes tabelas não foram criadas: ${missingTables.join(', ')}`);
      throw new Error(`Falha ao criar tabelas: ${missingTables.join(', ')}`);
    }
    
    logger.info("✓ Todas as tabelas foram criadas com sucesso!");
  } catch (err) {
    logger.error(`Erro ao instalar banco de dados: ${err.message}`);
    throw err;
  }
}

/**
 * Initializes the database: creates the database if needed, checks if tables are installed, and installs if necessary
 * @param {pg.Pool} pool - The database pool
 * @returns {Promise<void>}
 */
export async function initializeDatabase(pool) {
  try {
    logger.info("═══════════════════════════════════════════════════════════════");
    logger.info("Iniciando verificação/instalação do banco de dados...");
    logger.info("═══════════════════════════════════════════════════════════════");

    // First, ensure the database exists
    await createDatabaseIfNotExists();

    // Then check table status
    logger.info("\nVerificando status das tabelas...");
    const tablesStatus = await checkTablesStatus(pool);
    
    logger.info("\n📊 Status das Tabelas:");
    Object.entries(tablesStatus).forEach(([tableName, exists]) => {
      const icon = exists ? "✅" : "❌";
      logger.info(`  ${icon} ${tableName}`);
    });

    const isInstalled = await isDatabaseInstalled(pool);

    if (!isInstalled) {
      logger.info("\n⚠️  Tabelas faltando. Instalando schema...");
      await installDatabase(pool);
    } else {
      logger.info("\n✓ Todas as tabelas existem!");
    }

    // Check and fix structure (add missing columns)
    logger.info("\n📋 Verificando integridade estrutural...");
    const structureStatus = await verifyTableStructure(pool);
    
    const hasStructureIssues = Object.values(structureStatus).some(status => !status.isComplete);
    if (hasStructureIssues) {
      logger.warn("\n⚠️  Detectadas colunas faltando. Adicionando automaticamente...");
      
      for (const [tableName, status] of Object.entries(structureStatus)) {
        if (status.missingColumns.length > 0) {
          await addMissingColumns(pool, tableName, status.missingColumns);
        }
      }
      
      // Verify structure again after adding columns
      logger.info("\n📋 Re-verificando integridade estrutural após adições...");
      const finalStructureStatus = await verifyTableStructure(pool);
      
      const stillHasIssues = Object.values(finalStructureStatus).some(status => !status.isComplete);
      if (stillHasIssues) {
        logger.warn("\n⚠️  Aviso: Algumas colunas não puderam ser adicionadas:");
        Object.entries(finalStructureStatus).forEach(([tableName, status]) => {
          if (!status.isComplete && status.missingColumns.length > 0) {
            logger.warn(`  ⚠️  ${tableName}: ${status.missingColumns.join(', ')}`);
          }
        });
      } else {
        logger.info("✓ Todas as colunas foram adicionadas com sucesso!");
      }
    } else {
      logger.info("✓ Estrutura do banco de dados está completa!");
    }
    
    logger.info("═══════════════════════════════════════════════════════════════");
  } catch (err) {
    logger.error(`Erro durante a inicialização do banco de dados: ${err.message}`);
    throw err;
  }
}

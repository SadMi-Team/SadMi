const fs = require("fs");
const path = require("path");

const stateFile = path.join(__dirname, ".jest-db-state.json");

module.exports = async () => {
  const { applyTestEnv, checkDatabaseReady } = await import("./helpers/testEnv.js");

  applyTestEnv();
  const { ready, message } = await checkDatabaseReady();

  fs.writeFileSync(stateFile, JSON.stringify({ ready, message }));

  if (!ready) {
    // eslint-disable-next-line no-console
    console.warn(`\n[Testes de integração ignorados] ${message}\n`);
  }
};

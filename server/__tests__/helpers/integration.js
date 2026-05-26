import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const stateFile = path.join(__dirname, "../.jest-db-state.json");

function readDbState() {
  try {
    return JSON.parse(fs.readFileSync(stateFile, "utf8"));
  } catch {
    return { ready: false, message: "Estado do banco não verificado (rode npm test)." };
  }
}

const dbState = readDbState();

export const hasDatabase = dbState.ready === true;

export const describeIntegration = hasDatabase ? describe : describe.skip;
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "../..");
const envPath = path.join(rootDir, ".env");
const examplePath = path.join(rootDir, ".env.example");

if (!fs.existsSync(envPath) && fs.existsSync(examplePath)) {
  fs.copyFileSync(examplePath, envPath);
  // eslint-disable-next-line no-console
  console.log("Arquivo .env criado a partir de .env.example");
}

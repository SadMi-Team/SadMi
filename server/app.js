import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";

import logger from "./logger.js";
import "./db.js";
import indexRouter from "./routes/index.js";
import usersRouter from "./routes/users.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const morganFormat =
  ":method :url :status :res[content-length] - :response-time ms";
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }),
);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

app.use((req, res, next) => {
  res.status(404).json({ error: "Rota não encontrada" });
});

app.use((err, req, res, next) => {
  logger.error(err.stack || err.message);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Erro interno no servidor" });
});

export default app;

import crypto from "crypto";

export function parseMaquinaId(rawId) {
  const id = Number.parseInt(String(rawId), 10);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id;
}

export function normalizeNome(nome) {
  if (typeof nome !== "string") {
    return null;
  }
  const trimmed = nome.trim();
  if (!trimmed || trimmed.length > 140) {
    return null;
  }
  return trimmed;
}

export function parseAtivo(ativo, defaultValue = true) {
  if (ativo === undefined || ativo === null) {
    return defaultValue;
  }
  if (typeof ativo !== "boolean") {
    return undefined;
  }
  return ativo;
}

export function generateTokenComunicacao() {
  return crypto.randomBytes(32).toString("hex");
}

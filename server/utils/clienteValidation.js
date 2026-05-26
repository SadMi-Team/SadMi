const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseClienteId(rawId) {
  const id = Number.parseInt(String(rawId), 10);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id;
}

export function normalizeEmail(email) {
  if (typeof email !== "string") {
    return null;
  }
  const trimmed = email.trim().toLowerCase();
  if (!trimmed || !EMAIL_REGEX.test(trimmed)) {
    return null;
  }
  return trimmed;
}

export function normalizeNome(nome) {
  if (typeof nome !== "string") {
    return null;
  }
  const trimmed = nome.trim();
  if (!trimmed) {
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

export function validateSenha(senha, { required = false } = {}) {
  if (senha === undefined || senha === null || senha === "") {
    return required ? null : undefined;
  }
  if (typeof senha !== "string" || senha.length < 6) {
    return null;
  }
  return senha;
}

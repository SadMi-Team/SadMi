CREATE TABLE IF NOT EXISTS administradores (
  id BIGSERIAL PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clientes (
  id BIGSERIAL PRIMARY KEY,
  nome VARCHAR(160) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS maquinas (
  id BIGSERIAL PRIMARY KEY,
  cliente_id BIGINT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  nome VARCHAR(140) NOT NULL,
  token_comunicacao VARCHAR(255) NOT NULL UNIQUE,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ciclos_producao (
  id BIGSERIAL PRIMARY KEY,
  maquina_id BIGINT NOT NULL REFERENCES maquinas(id) ON DELETE CASCADE,
  operador VARCHAR(140),
  tipo_peca VARCHAR(140),
  quantidade_pecas INTEGER NOT NULL CHECK (quantidade_pecas >= 0),
  quantidade_refugo INTEGER NOT NULL DEFAULT 0 CHECK (quantidade_refugo >= 0),
  consumo_materia_prima NUMERIC(12, 3) CHECK (consumo_materia_prima >= 0),
  consumo_energia_kwh NUMERIC(12, 3) CHECK (consumo_energia_kwh >= 0),
  observacoes_anomalias TEXT,
  inicio_ciclo TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fim_ciclo TIMESTAMPTZ,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_maquinas_cliente_id ON maquinas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ciclos_maquina_id ON ciclos_producao(maquina_id);
CREATE INDEX IF NOT EXISTS idx_ciclos_inicio_ciclo ON ciclos_producao(inicio_ciclo);

import {
  generateTokenComunicacao,
  normalizeNome,
  parseAtivo,
  parseMaquinaId,
} from "../utils/maquinaValidation.js";

describe("maquinaValidation", () => {
  describe("parseMaquinaId", () => {
    it("aceita ID inteiro positivo", () => {
      expect(parseMaquinaId("42")).toBe(42);
      expect(parseMaquinaId(10)).toBe(10);
    });

    it("rejeita ID inválido", () => {
      expect(parseMaquinaId("abc")).toBeNull();
      expect(parseMaquinaId("0")).toBeNull();
      expect(parseMaquinaId("-1")).toBeNull();
    });
  });

  describe("normalizeNome", () => {
    it("normaliza nome válido", () => {
      expect(normalizeNome("  Torno CNC  ")).toBe("Torno CNC");
    });

    it("rejeita nome vazio ou longo demais", () => {
      expect(normalizeNome("")).toBeNull();
      expect(normalizeNome("a".repeat(141))).toBeNull();
      expect(normalizeNome(123)).toBeNull();
    });
  });

  describe("parseAtivo", () => {
    it("usa default quando ausente", () => {
      expect(parseAtivo(undefined, true)).toBe(true);
      expect(parseAtivo(null, false)).toBe(false);
    });

    it("aceita booleano", () => {
      expect(parseAtivo(true)).toBe(true);
      expect(parseAtivo(false)).toBe(false);
    });

    it("rejeita tipo inválido", () => {
      expect(parseAtivo("true")).toBeUndefined();
    });
  });

  describe("generateTokenComunicacao", () => {
    it("gera token hexadecimal de 64 caracteres", () => {
      const token = generateTokenComunicacao();
      expect(token).toMatch(/^[a-f0-9]{64}$/);
    });

    it("gera tokens distintos", () => {
      const a = generateTokenComunicacao();
      const b = generateTokenComunicacao();
      expect(a).not.toBe(b);
    });
  });
});

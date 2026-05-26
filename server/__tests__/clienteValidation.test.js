import {
  normalizeEmail,
  normalizeNome,
  parseAtivo,
  parseClienteId,
  validateSenha,
} from "../utils/clienteValidation.js";

describe("clienteValidation", () => {
  describe("parseClienteId", () => {
    it("aceita IDs inteiros positivos", () => {
      expect(parseClienteId("42")).toBe(42);
    });

    it("rejeita IDs inválidos", () => {
      expect(parseClienteId("abc")).toBeNull();
      expect(parseClienteId("0")).toBeNull();
      expect(parseClienteId("-1")).toBeNull();
    });
  });

  describe("normalizeEmail", () => {
    it("normaliza email válido", () => {
      expect(normalizeEmail("  User@Teste.COM ")).toBe("user@teste.com");
    });

    it("rejeita email inválido", () => {
      expect(normalizeEmail("invalido")).toBeNull();
      expect(normalizeEmail("")).toBeNull();
    });
  });

  describe("normalizeNome", () => {
    it("remove espaços extras", () => {
      expect(normalizeNome("  Nome  ")).toBe("Nome");
    });

    it("rejeita nome vazio", () => {
      expect(normalizeNome("   ")).toBeNull();
    });
  });

  describe("parseAtivo", () => {
    it("usa default quando ausente", () => {
      expect(parseAtivo(undefined, true)).toBe(true);
    });

    it("rejeita tipos não booleanos", () => {
      expect(parseAtivo("sim")).toBeUndefined();
    });
  });

  describe("validateSenha", () => {
    it("exige senha quando required", () => {
      expect(validateSenha(undefined, { required: true })).toBeNull();
    });

    it("rejeita senha curta", () => {
      expect(validateSenha("123")).toBeNull();
    });

    it("aceita senha válida", () => {
      expect(validateSenha("123456")).toBe("123456");
    });
  });
});

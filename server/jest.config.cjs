/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  transform: {},
  testMatch: ["**/__tests__/**/*.test.js"],
  setupFiles: ["<rootDir>/__tests__/setup.js"],
  globalSetup: "<rootDir>/__tests__/globalSetup.cjs",
  testTimeout: 30_000,
  maxWorkers: 1,
  forceExit: true,
};

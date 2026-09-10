/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: "..",
  testEnvironment: "node",
  testRegex: "test/.*\\.e2e-spec\\.ts$",
  transform: { "^.+\\.(t|j)s$": "ts-jest" },
  moduleNameMapper: {
    "^@fms/shared$": "<rootDir>/../../packages/shared/src/index.ts",
  },
  setupFiles: ["<rootDir>/test/jest-e2e.setup.js"],
};

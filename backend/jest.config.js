export default {
  testEnvironment: "node",
  transform: {
    "^.+\\.m?js$": ["babel-jest", { presets: ["@babel/preset-env"] }]
  },
  testMatch: ["**/__tests__/**/*.test.js"],
  coveragePathIgnorePatterns: ["/node_modules/"],
  collectCoverageFrom: [
    "src/**/*.js",
    "routes/**/*.js",
    "!**/node_modules/**"
  ]
};

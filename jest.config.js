module.exports = {
  "preset": "ts-jest",
  "testEnvironment": "node",
  "roots": [
    "<rootDir>/src",
    "<rootDir>/test"
  ],
  "transform": {
    "^.+\\.tsx?$": "ts-jest"
  },
  "globals": {
    "ts-jest": {
      "isolatedModules": true
    }
  },
  "moduleFileExtensions": [
    "ts",
    "js",
    "json",
    "node"
  ],
}
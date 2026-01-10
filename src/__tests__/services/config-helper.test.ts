import test, { describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { loadConfig } from "../../services/config-service";

describe("loadConfig", () => {
    const originalEnv = process.env;

    beforeEach(() => {
        process.env = Object.assign({}, originalEnv);
    });

    test("should throw if NODE_ENV is not set", () => {
        assert.throws(() => loadConfig());
    });

    test("should throw if NODE_ENV is invalid", () => {
        process.env["NODE_ENV"] = "invalid";
        assert.throws(() => loadConfig());
    });

    test("should return valid config with expected values", () => {
        process.env["NODE_ENV"] = "development";
        process.env["OUTPUT_DIR"] = "./output";
        const config = loadConfig();
        assert.strictEqual(config.NODE_ENV, "development");
        assert.strictEqual(config.OUT_DIR, "./output");
    });

    test("should not throw if unexpected environment variable is set", () => {
        process.env["NODE_ENV"] = "development";
        process.env["UNEXPECTED_ENV_VAR"] = "value";
        assert.doesNotThrow(() => loadConfig());
    });
});

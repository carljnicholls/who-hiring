import test, { beforeEach, describe } from "node:test";
import { ConsoleLogger, ILogger } from "../../services/console-logger";
import { SerializerFactory } from "../../serializers/serializer-factory";
import assert from "node:assert/strict";

describe("SerializerFactory", () => {
    let factory: SerializerFactory;
    let logger: ILogger;

    beforeEach(() => {
        logger = ConsoleLogger.getInstance();
        factory = new SerializerFactory(logger);
    });

    test("should throw with empty string", () => {
        const errMsg = "Unsupported serialization format: ''";
        assert.throws(() => factory.createSerializer("" as any), {
            message: errMsg,
        });
    });

    test("should throw with unexpected string", () => {
        const errMsg = "Unsupported serialization format: 'Rocket Man'";
        assert.throws(() => factory.createSerializer("Rocket Man" as any), {
            message: errMsg,
        });
    });

    test("should create JsonSerializer", () => {
        const serializer = factory.createSerializer("json");
        assert.strictEqual(serializer.constructor.name, "JsonSerializer");
    });

    test(`should create CsvSerializer`, () => {
        const serializer = factory.createSerializer("csv");
        assert.strictEqual(serializer.constructor.name, "CsvSerializer");
    });

    test(`should create SqlLiteSerializer`, () => {
        const serializer = factory.createSerializer("sqlite");
        assert.strictEqual(serializer.constructor.name, "SqlLiteSerializer");
    });

    test(`should throw with XmlSerializer due to not implemented`, () => {
        const errMsg = "Unsupported serialization format: 'xml'";
        assert.throws(() => factory.createSerializer("xml"), {
            message: errMsg,
        });
    });
});

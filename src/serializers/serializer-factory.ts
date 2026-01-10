import { JsonSerializer } from "./json-serializer.js";
import { Serializer } from "./i-serializer.js";
import { CsvSerializer } from "./cvs-serializer.js";
import { SqlLiteSerializer } from "./sqlite-serializer.js";
import { ILogger, ConsoleLogger } from "../services/console-logger.js";

export class SerializerFactory {
    logger: ILogger;

    constructor(logger: ILogger | null = null) {
        this.logger = logger || ConsoleLogger.getInstance();
    }

    public createSerializer(
        format: "json" | "xml" | "csv" | "sqlite"
    ): Serializer {
        const errMsg = `Unsupported serialization format: '${format}'`;
        switch (format) {
            case "json":
                return new JsonSerializer();
            case "csv":
                return new CsvSerializer();
            case "sqlite":
                return new SqlLiteSerializer();
            case "xml":
            // return new XmlSerializer();
            default: {
                this.logger.error(errMsg);
                throw new Error(errMsg);
            }
        }
    }
}

import { ILogger, ConsoleLogger } from "../services/console-logger.js";
import { Serializer } from "./i-serializer.js";

export abstract class BaseSerializer implements Serializer {
    protected logger: ILogger;

    constructor(logger: ILogger | null = null) {
        this.logger = logger || ConsoleLogger.getInstance();
    }

    abstract serialize<T>(data: T, options?: any): Promise<void>;
}

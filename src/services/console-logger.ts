export interface ILogger {
    log(message: string, ...optionalParams: any[]): void;
    info(message: string, ...optionalParams: any[]): void;
    warn(message: string, ...optionalParams: any[]): void;
    error(message: string, ...optionalParams: any[]): void;
}

export class ConsoleLogger {
    private static instance: ILogger;

    private constructor() {
        // Private constructor to prevent direct instantiation
    }

    public static getInstance(): ILogger {
        if (!ConsoleLogger.instance) {
            ConsoleLogger.instance = new ConsoleLogger();
        }
        return ConsoleLogger.instance;
    }

    log(message: string, ...optionalParams: any[]): void {
        console.log(message, ...optionalParams);
    }
    info(message: string, ...optionalParams: any[]): void {
        console.info(message, ...optionalParams);
    }
    warn(message: string, ...optionalParams: any[]): void {
        console.warn(message, ...optionalParams);
    }
    error(message: string, ...optionalParams: any[]): void {
        console.error(message, ...optionalParams);
    }
}

import { StoryContent } from "../dtos/i-story-content";
import { ILogger, ConsoleLogger } from "./console-logger";
import { SerializerFactory } from "../serializers/serializer-factory";
import fs from "node:fs";

export class IoService {
    private readonly logger: ILogger;
    private readonly factory: SerializerFactory;
    private readonly writeDirectory: string;

    constructor(logger: ILogger | null = null, writeDirectory: string = "./") {
        this.logger = logger || ConsoleLogger.getInstance();
        this.factory = new SerializerFactory(this.logger);

        if (!writeDirectory.endsWith("/")) {
            writeDirectory += "/";
        }
        this.writeDirectory = writeDirectory;
    }

    public async write(jobStoriesWithComments: StoryContent[]) {
        fs.mkdirSync(this.writeDirectory, { recursive: true });
        this.logger.info(`Output directory: ${this.writeDirectory}`);
        await this.writeJson(jobStoriesWithComments);
        await this.writeSqLite(jobStoriesWithComments);
    }

    private async writeSqLite(
        jobStoriesWithComments: StoryContent[]
    ): Promise<void> {
        const serializer = this.factory.createSerializer("sqlite");
        this.logger.log(`Output to be written to SQLite database`);
        await serializer.serialize<StoryContent[]>(jobStoriesWithComments, {
            databasePath: `${this.writeDirectory}output.db`,
        });
        this.logger.log(`Output written to SQLite database`);
    }

    private async writeJson(
        jobStoriesWithComments: StoryContent[]
    ): Promise<void> {
        const outputFilePath = `${this.writeDirectory}output.json`;
        let serializer = this.factory.createSerializer("json");
        this.logger.log(`Output to be written to ${outputFilePath}`);
        await serializer.serialize<StoryContent[]>(
            jobStoriesWithComments,
            outputFilePath
        );
        this.logger.log(`Output JSON written to ${outputFilePath}`);
    }
}

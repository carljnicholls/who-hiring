import { HnService } from "./services/hn-service.js";
import { ConsoleLogger } from "./services/console-logger.js";
import { IoService } from "./services/io-service.js";
import { loadConfig } from "./services/config-service.js";

const logPrefix = `[HM WHO IS HIRING]`;
const logger = ConsoleLogger.getInstance();

const run = async () => {
    const startDate = new Date();
    try {
        logger.log(`${logPrefix} Starting at ${startDate}`);
        process.loadEnvFile(`.env`);
        const config = loadConfig();

        const hnService = new HnService(logger);
        const jobStoriesWithComments =
            await hnService.getJobStoriesWithComments();
        logger.log(`Job Stories with Comments: `, jobStoriesWithComments);

        const io = new IoService(logger, config.OUT_DIR);
        await io.write(jobStoriesWithComments);
    } catch (error) {
        logger.error(`${logPrefix} Error fetching: `, error);
    } finally {
        const finTime = new Date();
        logger.log(`${logPrefix} Finished at ${finTime}`);
        logger.log(
            `${logPrefix} Duration: ${
                finTime.getTime() - startDate.getTime()
            } ms`
        );
    }
};

run()
    .catch((error) => {
        logger.error(`${logPrefix} Unhandled error in run(): `, error);
    })
    .finally(() => {
        process.exit(0);
    });

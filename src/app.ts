import { HnService } from "./services/hn-service.js";
import { Temporal } from "@js-temporal/polyfill";
import { ConsoleLogger } from "./services/console-logger.js";
import { IoService } from "./services/io-service.js";
import { loadConfig } from "./services/config-service.js";

const logPrefix = `[HM WHO IS HIRING]`;
const logger = ConsoleLogger.getInstance();

const run = async () => {
    const startDate = Temporal.Now.instant();

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
        const finTime = Temporal.Now.instant();
        logger.log(`${logPrefix} Finished at ${finTime}`);
        logger.log(
            `${logPrefix} Duration: ${
                finTime.since(startDate)
                    .total({ unit: "second" })
                    .toFixed(1)
            } s`
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

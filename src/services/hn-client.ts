import { ILogger, ConsoleLogger } from "./console-logger";

const API_BASE_URL = "https://hacker-news.firebaseio.com/v0";

/**
 * Example job item:
{
    by: 'MarvinStarter',
    id: 46355932,
    score: 1,
    time: 1766422834,
    title: 'Uplane (YC F25) Is Hiring Founding Engineers (Full-Stack and AI)',
    type: 'job',
    url: 'https://www.useparallel.com/uplane1/careers'
}
 */
export interface HnItem {
    by: string;
    id: number;
    score: number;
    time: number;
    title: string;
    type: string;
    url: string;
}

/**
 * Example user object:
 * {
    "about" : "This is a test",
    "created" : 1173923446,
    "id" : "jl",
    "karma" : 2937,
    "submitted" : [ 8265435, 8168423, 8090946, 8090326, 7699907, 7637962, 7596179, 7596163, 7594569, 7562135, 7562111, 7494708, 7494171, 7488093, 7444860, 7327817, 7280290, 7278694, 7097557, 7097546, 7097254, 7052857, 7039484, 6987273, 6649999, 6649706, 6629560, 6609127, 6327951, 6225810, 6111999, 5580079, 5112008, 4907948, 4901821, 4700469, 4678919, 3779193, 3711380, 3701405, 3627981, 3473004, 3473000, 3457006, 3422158, 3136701, 2943046, 2794646, 2482737, 2425640, 2411925, 2408077, 2407992, 2407940, 2278689, 2220295, 2144918, 2144852, 1875323, 1875295, 1857397, 1839737, 1809010, 1788048, 1780681, 1721745, 1676227, 1654023, 1651449, 1641019, 1631985, 1618759, 1522978, 1499641, 1441290, 1440993, 1436440, 1430510, 1430208, 1385525, 1384917, 1370453, 1346118, 1309968, 1305415, 1305037, 1276771, 1270981, 1233287, 1211456, 1210688, 1210682, 1194189, 1193914, 1191653, 1190766, 1190319, 1189925, 1188455, 1188177, 1185884, 1165649, 1164314, 1160048, 1159156, 1158865, 1150900, 1115326, 933897, 924482, 923918, 922804, 922280, 922168, 920332, 919803, 917871, 912867, 910426, 902506, 891171, 807902, 806254, 796618, 786286, 764412, 764325, 642566, 642564, 587821, 575744, 547504, 532055, 521067, 492164, 491979, 383935, 383933, 383930, 383927, 375462, 263479, 258389, 250751, 245140, 243472, 237445, 229393, 226797, 225536, 225483, 225426, 221084, 213940, 213342, 211238, 210099, 210007, 209913, 209908, 209904, 209903, 170904, 165850, 161566, 158388, 158305, 158294, 156235, 151097, 148566, 146948, 136968, 134656, 133455, 129765, 126740, 122101, 122100, 120867, 120492, 115999, 114492, 114304, 111730, 110980, 110451, 108420, 107165, 105150, 104735, 103188, 103187, 99902, 99282, 99122, 98972, 98417, 98416, 98231, 96007, 96005, 95623, 95487, 95475, 95471, 95467, 95326, 95322, 94952, 94681, 94679, 94678, 94420, 94419, 94393, 94149, 94008, 93490, 93489, 92944, 92247, 91713, 90162, 90091, 89844, 89678, 89498, 86953, 86109, 85244, 85195, 85194, 85193, 85192, 84955, 84629, 83902, 82918, 76393, 68677, 61565, 60542, 47745, 47744, 41098, 39153, 38678, 37741, 33469, 12897, 6746, 5252, 4752, 4586, 4289 ]
}
*/
export interface HnUser {
    about: string;
    created: number;
    id: string;
    karma: number;
    submitted: number[];
}

/**
 * Example story item:
 * {
    "by" : "dhouston",
    "descendants" : 71,
    "id" : 8863,
    "kids" : [ 8952, 9224, 8917, 8884, 8887, 8943, 8869, 8958, 9005, 9671, 8940, 9067, 8908, 9055, 8865, 8881, 8872, 8873, 8955, 10403, 8903, 8928, 9125, 8998, 8901, 8902, 8907, 8894, 8878, 8870, 8980, 8934, 8876 ],
    "score" : 111,
    "time" : 1175714200,
    "title" : "My YC app: Dropbox - Throw away your USB drive",
    "type" : "story",
    "url" : "http://www.getdropbox.com/u/2/screencast.html"
}
 */
export interface HnStory extends HnItem {
    descendants: number;
    kids: number[];
}

/**
 * Example comment item:
 * {
    "by" : "norvig",
    "id" : 2921983,
    "kids" : [ 2922097, 2922429, 2924562, 2922709, 2922573, 2922140, 2922141 ],
    "parent" : 2921506,
    "text" : "Aw shucks, guys ... you make me blush with your compliments.<p>Tell you what, Ill make a deal: I'll keep writing if you keep reading. K?",
    "time" : 1314211127,
    "type" : "comment"
}
 */
export interface HnComment extends HnItem {
    kids?: number[] | undefined;
    parent: number;
    text: string;
    children?: HnComment[];
}

export class HnClient {
    logger: ILogger;

    constructor(logger: ILogger | null = null) {
        this.logger = logger || ConsoleLogger.getInstance();
    }

    /**
     * Get the list of job story IDs from Hacker News.
     * Returns an array of ids or an empty array on error.
     */
    async getJobStories(): Promise<number[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/jobstories.json`);
            const data = (await response.json()) as number[];
            return data;
        } catch (error) {
            this.logger.error("Error fetching job stories:", error);
            return [];
        }
    }

    /**
     * Get a single item by its ID or null if not found/error.
     */
    async getItem<T extends HnItem>(id: number): Promise<T | null> {
        try {
            const response = await fetch(`${API_BASE_URL}/item/${id}.json`);
            const data = (await response.json()) as T;
            return data;
        } catch (error) {
            this.logger.error(`Error fetching item ${id}:`, error);
            return null;
        }
    }

    /**
     * Get multiple items by their IDs, filtering out any that fail to fetch.
     * Reuses getItem method with Promise.all for concurrency.
     */
    async getItems<T extends HnItem>(ids: number[]): Promise<T[]> {
        const items = await Promise.all(ids.map((id) => this.getItem<T>(id)));
        return items.filter((item) => item !== null);
    }

    async getUser(id: string): Promise<HnUser | null> {
        try {
            const response = await fetch(`${API_BASE_URL}/user/${id}.json`);
            const data = (await response.json()) as HnUser;
            return data;
        } catch (error) {
            this.logger.error(`Error fetching user ${id}:`, error);
            return null;
        }
    }

    async getComment(id: number): Promise<HnComment | null> {
        try {
            const response = await fetch(`${API_BASE_URL}/item/${id}.json`);
            const data = (await response.json()) as HnComment;
            return data;
        } catch (error) {
            this.logger.error(`Error fetching comment ${id}:`, error);
            return null;
        }
    }

    async getComments(ids: number[]): Promise<HnComment[]> {
        const comments = await Promise.all(
            ids.map((id) => this.getComment(id))
        );
        return comments.filter((comment) => comment !== null) as HnComment[];
    }
}

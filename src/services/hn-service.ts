import { HnClient, HnComment, HnStory, HnUser } from "./hn-client";
import { ILogger, ConsoleLogger } from "./console-logger";
import { StoryContent } from "../dtos/i-story-content";

interface JobsPostOptions {
    limit: number | null;
}

export class HnService {
    private client: HnClient;
    private logger: ILogger;

    constructor(logger: ILogger | null) {
        this.client = new HnClient();
        this.logger = logger || ConsoleLogger.getInstance();
    }

    public async getJobStoriesWithComments(): Promise<StoryContent[]> {
        const user = await this.getUser();
        // this.logger.log("Fetched user: ", user);
        const submissions = await this.getJobsPosts(user);
        // this.logger.log("Fetched submissions: ", submissions);
        const lookup = await this.getComments(submissions);
        // this.logger.log("Fetched comments: ", lookup);
        await this.cleanIdPropsDuplicatedByEntities(lookup);
        // this.logger.log("Cleaned lookup: ", lookup);
        return Array.from(lookup.values());
    }

    private async getUser() {
        const userName = "whoishiring";
        const user = await this.client.getUser(userName);
        if (!user) {
            const errMsg = `User ${userName} not found`;
            this.logger.error(errMsg);
            throw new Error(errMsg);
        }
        return user;
    }

    private async getComments(
        submissions: HnStory[]
    ): Promise<Map<number, StoryContent>> {
        const lookup = this.initLookup(submissions);
        await this.addCommentsToLookupItems(lookup);
        return lookup;
    }

    /**
     * Get the user's submissions. Defaults to 2 posts if no limit provided.
     */
    private async getJobsPosts(
        user: HnUser,
        options: JobsPostOptions = { limit: 2 }
    ): Promise<HnStory[]> {
        // Create a copy to avoid mutating the cached user object
        let limitedSearch = [...user.submitted].sort((a, b) => b - a);

        if (options.limit) {
            limitedSearch = limitedSearch.slice(0, options.limit);
        }

        return await this.client.getItems<HnStory>(limitedSearch);
    }

    /**
     * Add comments to each StoryContent in the lookup map. Fetch comments recursively if needed.
     */
    private async addCommentsToLookupItems(lookup: Map<number, StoryContent>) {
        for (const [id, storyContent] of lookup) {
            const comment: HnComment[] = [];
            if (storyContent.kids && storyContent.kids.length > 0) {
                await this.fetchCommentsRecursively(
                    storyContent.kids,
                    undefined,
                    comment
                );
            }

            storyContent.comments = comment;
            lookup.set(id, storyContent);
        }
    }

    private initLookup(submissions: HnStory[]): Map<number, StoryContent> {
        const lookup = new Map<number, StoryContent>();

        for (const story of submissions) {
            if (story && story.type === "story") {
                const storyContent: StoryContent = {
                    id: story.id,
                    descendants: story.descendants,
                    kids: story.kids,
                    score: story.score,
                    by: story.by,
                    time: story.time,
                    title: story.title,
                    url: story.url,
                };
                lookup.set(story.id, storyContent);
            }
        }
        return lookup;
    }

    /**
     *  Recursively remove kids props to avoid redundancy
     * @param lookup
     */
    private async cleanIdPropsDuplicatedByEntities(
        lookup: Map<number, StoryContent>
    ) {
        for (const [id, storyContent] of lookup) {
            storyContent.kids = undefined;
            const removeKids = (comments: HnComment[] | undefined) => {
                if (!comments) return;
                for (const comment of comments) {
                    if (comment.children && comment.children.length > 0) {
                        removeKids(comment.children);
                    }
                    comment.kids = undefined;
                }
            };
            removeKids(storyContent.comments);
        }
    }

    private async fetchCommentsRecursively(
        kids: number[],
        parentComment: HnComment | undefined,
        comment: HnComment[]
    ): Promise<void[]> {
        this.logger.log(`Fetching comments for kids: ${kids}`);
        return Promise.all(
            kids.map(
                async (
                    kidId: number,
                    index: number,
                    array: number[] | undefined
                ) => {
                    const child = await this.client.getComment(kidId);
                    this.logger.log(
                        `Fetched comment ${kidId}. Parent: ${
                            parentComment ? parentComment.id : "ROOT (Story)"
                        }`
                    );

                    if (child) {
                        if (child.kids && child.kids.length > 0) {
                            if (!child.children) {
                                child.children = [];
                            }
                            await this.fetchCommentsRecursively(
                                child.kids,
                                child,
                                child.children
                            );
                        }
                        if (parentComment) {
                            child.parent = parentComment.id;
                        }
                        comment.push(child);
                    } else {
                        this.logger.warn(`Comment with ID ${kidId} not found.`);
                    }
                }
            )
        );
    }
}

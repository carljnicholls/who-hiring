import { HnComment } from "../services/hn-client";

export interface StoryContent {
    title: string;
    url: string;
    score: number;
    by: string;
    time: number;
    id: number;
    kids?: number[] | undefined;
    descendants: number;
    comments?: HnComment[];
}

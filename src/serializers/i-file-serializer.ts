import { Serializer } from "./i-serializer";

export interface FileSerializer extends Serializer {
    serialize<T>(data: T, filePath: string, options?: any): Promise<void>;
}

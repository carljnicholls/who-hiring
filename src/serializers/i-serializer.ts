export interface Serializer {
    serialize<T>(data: T, options?: any): Promise<void>;
}

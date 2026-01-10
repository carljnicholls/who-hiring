import fs from "node:fs";
import { BaseSerializer } from "./base-serializer";

export class JsonSerializer extends BaseSerializer {
    async serialize<T>(
        data: T,
        filePath: string,
        options?: fs.WriteFileOptions
    ): Promise<void> {
        const jsonData = JSON.stringify(data, null, 4);
        fs.writeFileSync(filePath, jsonData, options || { encoding: "utf-8" });
    }
}

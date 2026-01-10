import { BaseSerializer } from "./base-serializer";
import fs from "node:fs";

export class CsvSerializer extends BaseSerializer {
    async serialize<T>(
        data: T,
        filePath: string,
        options?: fs.WriteFileOptions
    ): Promise<void> {
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error(
                "CSV serialization requires a non-empty array of objects."
            );
        }

        const headers = Object.keys(data[0]);
        const csvRows = [headers.join(",")];

        for (const item of data) {
            const row = headers
                .map((header) => {
                    const value = item[header as keyof T];
                    // Escape commas and quotes in values
                    if (typeof value === "string" && value.includes(",")) {
                        return `"${value.replace(/"/g, '""')}"`;
                    }
                    if (typeof value === "string" && value.includes('"')) {
                        return `"${value.replace(/"/g, '""')}"`;
                    }

                    return value;
                })
                .join(",");
            csvRows.push(row);
        }
        const csvData = csvRows.join("\n");
        fs.writeFileSync(filePath, csvData, options || { encoding: "utf-8" });
    }
}

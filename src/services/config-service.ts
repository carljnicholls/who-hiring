import Ajv, { JSONSchemaType } from "ajv";
import addFormats from "ajv-formats";

export interface IConfig {
    NODE_ENV: "development" | "production" | "test";
    OUT_DIR: string | undefined;
}

const schema: JSONSchemaType<IConfig> = {
    type: "object",
    properties: {
        NODE_ENV: {
            type: "string",
            enum: ["development", "production", "test"],
        },
        OUT_DIR: { type: "string", nullable: true },
    },
    required: ["NODE_ENV"],
    additionalProperties: true,
};

const ajv = new Ajv({
    coerceTypes: true, // Casts strings to numbers/booleans
    allErrors: true, // Reports all errors at once, not just the first one
    removeAdditional: false,
});
addFormats(ajv);

export const loadConfig = (): IConfig => {
    const validate = ajv.compile(schema);

    // Make copy of object. AJV may MUTATE it.
    const configData = { ...process.env };

    if (!validate(configData)) {
        console.error("Invalid Environment Variables:");
        const errMsg = ajv.errorsText(validate.errors, { separator: "\n" });
        console.error(errMsg);
        throw new Error(errMsg);
    }

    return configData;
};

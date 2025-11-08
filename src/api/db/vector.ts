/**
 * Helper for pgvector type in Drizzle
 * Since drizzle-pgvector might not be available, we'll use a custom approach
 */
import { customType } from "drizzle-orm/pg-core";

export const vector = (name: string, options: { dimensions: number }) =>
    customType<{ data: number[]; driverData: string }>({
        dataType() {
            return `vector(${options.dimensions})`;
        },
        toDriver(value: number[]): string {
            return `[${value.join(",")}]`;
        },
        fromDriver(value: string): number[] {
            // Parse the vector string format from PostgreSQL
            if (typeof value === "string") {
                // Remove brackets and split by comma
                return value
                    .replace(/[\[\]]/g, "")
                    .split(",")
                    .map((v) => parseFloat(v.trim()));
            }
            return value;
        },
    })(name);


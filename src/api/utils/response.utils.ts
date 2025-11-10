import { Context } from "hono";

export class ApiError extends Error {
    constructor(
        public message: string,
        public statusCode: number = 500,
        public details?: string
    ) {
        super(message);
        this.name = "ApiError";
    }
}

export const successResponse = <T>(c: Context, data: T, status = 200) => {
    return c.json(data, status);
};

export const errorResponse = (c: Context, error: string, details?: string, status = 500) => {
    return c.json({ error, details }, status);
};

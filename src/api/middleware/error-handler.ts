import { Context } from "hono";
import { HTTPException } from "hono/http-exception";

export const errorHandler = (err: Error, c: Context) => {
    console.error("Error:", err);

    if (err instanceof HTTPException) {
        return c.json(
            {
                error: err.message,
                details: err.cause,
            },
            err.status
        );
    }

    return c.json(
        {
            error: "Internal Server Error",
            details: err.message,
        },
        500
    );
};

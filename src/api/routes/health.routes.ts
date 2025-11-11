import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { SuccessSchema } from "@/api/schemas/common.schemas.js";

export const healthRoute = new OpenAPIHono();

healthRoute.openapi(
    createRoute({
        method: "get",
        path: "/health",
        tags: ["system"],
        description: "Health check endpoint",
        responses: {
            200: {
                content: { "application/json": { schema: SuccessSchema } },
                description: "Success",
            },
        },
    }),
    (c) => c.json({ message: "Server is running", ok: true })
);

healthRoute.get("/", (c) =>
    c.json({
        message: "Hello from Hono API!",
        docs: "/ui",
        openapi: "/doc",
    })
);

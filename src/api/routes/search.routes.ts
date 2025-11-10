import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { getAuthenticatedUser } from "@/api/middleware/auth.js";
import { SearchService } from "@/api/services/search.service.js";
import { SearchRequestSchema, SearchResponseSchema } from "@/api/schemas/search.schemas.js";
import { ErrorSchema } from "@/api/schemas/common.schemas.js";
import { errorResponse, successResponse } from "@/api/utils/response.utils.js";

export const searchRoutes = new OpenAPIHono();
const searchService = new SearchService();

searchRoutes.openapi(
    createRoute({
        method: "post",
        path: "/search",
        security: [{ Bearer: [] }],
        tags: ["search"],
        description: "Search through documents",
        request: {
            body: {
                content: { "application/json": { schema: SearchRequestSchema } },
            },
        },
        responses: {
            200: {
                description: "Search results",
                content: { "application/json": { schema: SearchResponseSchema } },
            },
            500: {
                description: "Server error",
                content: { "application/json": { schema: ErrorSchema } },
            },
        },
    }),
    async (c) => {
        try {
            const user = await getAuthenticatedUser(c);
            const { query, topK = 5 } = await c.req.json();

            const result = await searchService.search(query, user.id, topK);
            return successResponse(c, result);
        } catch (error: any) {
            return errorResponse(c, "Failed to perform search", error.message);
        }
    }
);

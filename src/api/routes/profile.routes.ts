import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { getAuthenticatedUser } from "@/api/middleware/auth";
import { db } from "@/api/db";
import { users } from "@/api/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { errorResponse, successResponse } from "@/api/utils/response.utils.js";

const UserProfileSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
});

export const profileRoutes = new OpenAPIHono();

// GET /v1/profile
profileRoutes.openapi(
    createRoute({
        method: "get",
        path: "/profile",
        security: [{ Bearer: [] }],
        tags: ["profile"],
        responses: {
            200: {
                description: "OK",
                content: { "application/json": { schema: UserProfileSchema } },
            },
        },
    }),
    async (c) => {
        try {
            const user = await getAuthenticatedUser(c);
            const dbUser = await db.select().from(users).where(eq(users.id, user.id));
            if (!dbUser[0]) return errorResponse(c, "User not found", undefined, 404);
            return c.json(dbUser[0]);
        } catch (error: any) {
            return errorResponse(c, error.message, error.details, error.statusCode || 500);
        }
    }
);

// PATCH /v1/profile
profileRoutes.openapi(
    createRoute({
        method: "patch",
        path: "/profile",
        security: [{ Bearer: [] }],
        tags: ["profile"],
        request: {
            body: {
                content: {
                    "application/json": { schema: z.object({ name: z.string() }) },
                },
            },
        },
        responses: {
            200: {
                description: "OK",
                content: { "application/json": { schema: UserProfileSchema } },
            },
        },
    }),
    async (c) => {
        try {
            const user = await getAuthenticatedUser(c);
            const { name } = await c.req.json();
            await db.update(users).set({ name }).where(eq(users.id, user.id));
            const dbUser = await db.select().from(users).where(eq(users.id, user.id));
            return c.json(dbUser[0]);
        } catch (error: any) {
            return errorResponse(c, error.message, error.details, error.statusCode || 500);
        }
    }
);

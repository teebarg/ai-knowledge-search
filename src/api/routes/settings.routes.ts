import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { SettingsService } from "@/api/services/settings.service";
import { SettingsRepository } from "@/api/repositories/settings.repository";
import { getAuthenticatedUser } from "@/api/middleware/auth";
import { SettingsResponseSchema, UpdateSettingsRequestSchema } from "@/api/schemas/settings.schemas";
import { ErrorSchema } from "@/api/schemas/common.schemas";
import { errorResponse, successResponse } from "@/api/utils/response.utils.js";

const settingsService = new SettingsService(new SettingsRepository());
export const settingsRoutes = new OpenAPIHono();

// Get user settings
settingsRoutes.openapi(
    createRoute({
        method: "get",
        path: "/settings",
        security: [{ Bearer: [] }],
        tags: ["settings"],
        responses: {
            200: {
                description: "OK",
                content: { "application/json": { schema: SettingsResponseSchema } },
            },
            404: {
                description: "Not found",
                content: { "application/json": { schema: ErrorSchema } },
            },
        },
    }),
    async (c) => {
        try {
            const user = await getAuthenticatedUser(c);
            const settings = await settingsService.getSettings(user.id);
            return successResponse(c, { settings: settings || {} });
        } catch (error: any) {
            return errorResponse(c, error.message, error.details, error.statusCode || 500);
        }
    }
);

// Update user settings
settingsRoutes.openapi(
    createRoute({
        method: "patch",
        path: "/settings",
        security: [{ Bearer: [] }],
        tags: ["settings"],
        request: {
            body: {
                content: {
                    "application/json": { schema: UpdateSettingsRequestSchema },
                },
            },
        },
        responses: {
            200: {
                description: "OK",
                content: { "application/json": { schema: SettingsResponseSchema } },
            },
            400: {
                description: "Bad Request",
                content: { "application/json": { schema: ErrorSchema } },
            },
        },
    }),
    async (c) => {
        try {
            const user = await getAuthenticatedUser(c);
            const data = await c.req.json();
            const settings = await settingsService.updateSettings(user.id, data);
            return successResponse(c, { settings });
        } catch (error: any) {
            return errorResponse(c, error.message, error.details, error.statusCode || 500);
        }
    }
);

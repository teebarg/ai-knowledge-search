import { z } from "@hono/zod-openapi";

export const SettingsSchema = z.object({
    apiKey: z.string().optional(),
    useOwnKey: z.boolean().default(false),
    preferredModel: z.string().default("gemini"),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
});


export const UpdateSettingsRequestSchema = z.object({
    apiKey: z.string().optional(),
    useOwnKey: z.boolean().optional(),
    preferredModel: z.string().optional(),
});

export const SettingsResponseSchema = z.object({
    settings: SettingsSchema,
});

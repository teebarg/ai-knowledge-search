import { z } from "@hono/zod-openapi";

export const ErrorSchema = z.object({
    error: z.string(),
    details: z.string().optional(),
});

export const SuccessSchema = z.object({
    ok: z.boolean(),
    message: z.string().optional(),
});

export const IdParamSchema = z.object({
    id: z.string(),
});

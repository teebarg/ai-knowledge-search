import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { getAuthenticatedUser } from "@/api/middleware/auth.js";
import { ConversationService } from "@/api/services/conversation.service.js";
import { ConversationRepository } from "@/api/repositories/conversation.repository.js";
import {
    ConversationSchema,
    ConversationsResponseSchema,
    CreateConversationRequestSchema,
    UpdateConversationRequestSchema,
    MessagesResponseSchema,
    CreateMessageRequestSchema,
    UpdateMessageRequestSchema,
} from "@/api/schemas/conversation.schemas.js";
import { ErrorSchema, IdParamSchema, SuccessSchema } from "@/api/schemas/common.schemas.js";
import { errorResponse, successResponse } from "@/api/utils/response.utils.js";

export const conversationRoutes = new OpenAPIHono();
const conversationService = new ConversationService(new ConversationRepository());

// List conversations
conversationRoutes.openapi(
    createRoute({
        method: "get",
        path: "/conversations",
        security: [{ Bearer: [] }],
        tags: ["conversations"],
        responses: {
            200: {
                description: "OK",
                content: { "application/json": { schema: ConversationsResponseSchema } },
            },
        },
    }),
    async (c) => {
        try {
            const user = await getAuthenticatedUser(c);
            const conversations = await conversationService.list(user.id);
            return successResponse(c, { conversations });
        } catch (error: any) {
            return errorResponse(c, "Failed to fetch conversations", error.message);
        }
    }
);

// Create conversation
conversationRoutes.openapi(
    createRoute({
        method: "post",
        path: "/conversations",
        security: [{ Bearer: [] }],
        tags: ["conversations"],
        request: {
            body: {
                content: {
                    "application/json": { schema: CreateConversationRequestSchema },
                },
            },
        },
        responses: {
            200: {
                description: "OK",
                content: { "application/json": { schema: ConversationSchema } },
            },
        },
    }),
    async (c) => {
        try {
            const user = await getAuthenticatedUser(c);
            const { title } = await c.req.json();
            const conversation = await conversationService.create(user.id, title);
            return successResponse(c, conversation);
        } catch (error: any) {
            return errorResponse(c, "Failed to create conversation", error.message);
        }
    }
);

// Update conversation title
conversationRoutes.openapi(
    createRoute({
        method: "patch",
        path: "/conversations/{id}",
        security: [{ Bearer: [] }],
        tags: ["conversations"],
        request: {
            params: IdParamSchema,
            body: {
                content: {
                    "application/json": { schema: UpdateConversationRequestSchema },
                },
            },
        },
        responses: {
            200: {
                description: "OK",
                content: { "application/json": { schema: ConversationSchema } },
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
            const { id } = c.req.param();
            const { title } = await c.req.json();
            const conversation = await conversationService.update(id, user.id, title);
            return successResponse(c, conversation);
        } catch (error: any) {
            return errorResponse(c, error.message, error.details, error.statusCode || 500);
        }
    }
);

// Generate conversation title
conversationRoutes.openapi(
    createRoute({
        method: "post",
        path: "/conversations/{id}/generate-title",
        security: [{ Bearer: [] }],
        tags: ["conversations"],
        request: { params: IdParamSchema },
        responses: {
            200: {
                description: "OK",
                content: { "application/json": { schema: ConversationSchema } },
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
            const { id } = c.req.param();
            const conversation = await conversationService.generateTitle(id, user.id);
            return successResponse(c, conversation);
        } catch (error: any) {
            return errorResponse(c, error.message, error.details, error.statusCode || 500);
        }
    }
);

// Delete conversation
conversationRoutes.openapi(
    createRoute({
        method: "delete",
        path: "/conversations/{id}",
        security: [{ Bearer: [] }],
        tags: ["conversations"],
        request: { params: IdParamSchema },
        responses: {
            200: {
                description: "OK",
                content: { "application/json": { schema: SuccessSchema } },
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
            const { id } = c.req.param();
            await conversationService.delete(id, user.id);
            return successResponse(c, { message: "Deleted" });
        } catch (error: any) {
            return errorResponse(c, error.message, error.details, error.statusCode || 500);
        }
    }
);

// List messages in a conversation
conversationRoutes.openapi(
    createRoute({
        method: "get",
        path: "/conversations/{id}/messages",
        security: [{ Bearer: [] }],
        tags: ["conversations"],
        request: { params: IdParamSchema },
        responses: {
            200: {
                description: "OK",
                content: { "application/json": { schema: MessagesResponseSchema } },
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
            const { id } = c.req.param();
            const messages = await conversationService.getMessages(id, user.id);
            return successResponse(c, { messages });
        } catch (error: any) {
            return errorResponse(c, error.message, error.details, error.statusCode || 500);
        }
    }
);

// Append a message to a conversation
conversationRoutes.openapi(
    createRoute({
        method: "post",
        path: "/conversations/{id}/messages",
        security: [{ Bearer: [] }],
        tags: ["conversations"],
        request: {
            params: IdParamSchema,
            body: {
                content: {
                    "application/json": { schema: CreateMessageRequestSchema },
                },
            },
        },
        responses: {
            200: {
                description: "OK",
                content: {
                    "application/json": { schema: z.object({ id: z.string() }) },
                },
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
            const { id } = c.req.param();
            const { role, content } = await c.req.json();
            const result = await conversationService.addMessage(id, user.id, role, content);
            return successResponse(c, result);
        } catch (error: any) {
            return errorResponse(c, error.message, error.details, error.statusCode || 500);
        }
    }
);

// Update message content
conversationRoutes.openapi(
    createRoute({
        method: "patch",
        path: "/conversations/{id}/messages/{messageId}",
        security: [{ Bearer: [] }],
        tags: ["conversations"],
        request: {
            params: z.object({ id: z.string(), messageId: z.string() }),
            body: {
                content: {
                    "application/json": { schema: UpdateMessageRequestSchema },
                },
            },
        },
        responses: {
            200: {
                description: "OK",
                content: {
                    "application/json": { schema: z.object({ ok: z.boolean() }) },
                },
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
            const { id, messageId } = c.req.param();
            const { content } = await c.req.json();
            const result = await conversationService.updateMessage(id, messageId, user.id, content);
            return successResponse(c, result);
        } catch (error: any) {
            return errorResponse(c, error.message, error.details, error.statusCode || 500);
        }
    }
);

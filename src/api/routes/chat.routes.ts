import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { getAuthenticatedUser } from "@/api/middleware/auth.js";
import { ChatService } from "@/api/services/chat.service.js";
import { ConversationRepository } from "@/api/repositories/conversation.repository.js";
import { SearchRequestSchema } from "@/api/schemas/search.schemas.js";
import { ErrorSchema } from "@/api/schemas/common.schemas.js";
import { errorResponse } from "@/api/utils/response.utils.js";

export const chatRoutes = new OpenAPIHono();
const chatService = new ChatService(new ConversationRepository());

chatRoutes.openapi(
    createRoute({
        method: "post",
        path: "/chat",
        security: [{ Bearer: [] }],
        tags: ["chat"],
        description: "Chat with AI using knowledge base",
        request: {
            body: {
                content: { "application/json": { schema: SearchRequestSchema } },
            },
        },
        responses: {
            200: {
                description: "Chat stream",
                content: { "text/event-stream": { schema: z.any() } },
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
            const { query, topK = 5, conversationId } = await c.req.json();

            const stream = await chatService.chat(query, user.id, topK, conversationId);

            return new Response(stream, {
                headers: {
                    "Content-Type": "text/event-stream",
                    "Cache-Control": "no-cache",
                    Connection: "keep-alive",
                },
            });
        } catch (error: any) {
            return errorResponse(c, "Failed to process chat", error.message);
        }
    }
);

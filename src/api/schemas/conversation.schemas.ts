import { z } from "@hono/zod-openapi";

export const ConversationSchema = z.object({
    id: z.string(),
    title: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
});

export const ConversationsResponseSchema = z.object({
    conversations: z.array(ConversationSchema),
});

export const CreateConversationRequestSchema = z.object({
    title: z.string().min(1),
});

export const UpdateConversationRequestSchema = z.object({
    title: z.string().min(1),
});

export const MessageSchema = z.object({
    id: z.string(),
    role: z.enum(["user", "assistant"]),
    content: z.string(),
    created_at: z.string(),
});

export const MessagesResponseSchema = z.object({
    messages: z.array(MessageSchema),
});

export const CreateMessageRequestSchema = z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().min(1),
});

export const UpdateMessageRequestSchema = z.object({
    content: z.string().min(0),
});

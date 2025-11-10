import { db } from "@/api/db/index.js";
import { conversations, conversationMessages } from "@/api/db/schema.js";
import { eq, desc, and } from "drizzle-orm";

export class ConversationRepository {
    async findByUserId(userId: string) {
        const results = await db.select().from(conversations).where(eq(conversations.userId, userId)).orderBy(desc(conversations.updatedAt));

        return results.map((c) => ({
            id: c.id,
            title: c.title,
            created_at: c.createdAt.toISOString(),
            updated_at: c.updatedAt.toISOString(),
        }));
    }

    async findById(id: string, userId: string) {
        const results = await db
            .select()
            .from(conversations)
            .where(and(eq(conversations.id, id), eq(conversations.userId, userId)));

        return results[0] || null;
    }

    async create(data: { id: string; userId: string; title: string }) {
        const now = new Date();
        await db.insert(conversations).values({
            ...data,
            createdAt: now,
            updatedAt: now,
        });

        return {
            id: data.id,
            title: data.title,
            created_at: now.toISOString(),
            updated_at: now.toISOString(),
        };
    }

    async update(id: string, data: { title: string }) {
        const now = new Date();
        await db
            .update(conversations)
            .set({ ...data, updatedAt: now })
            .where(eq(conversations.id, id));

        const conversation = await db.select().from(conversations).where(eq(conversations.id, id));

        return {
            id: conversation[0].id,
            title: conversation[0].title,
            created_at: conversation[0].createdAt.toISOString(),
            updated_at: now.toISOString(),
        };
    }

    async delete(id: string) {
        await db.delete(conversations).where(eq(conversations.id, id));
    }

    async getMessages(conversationId: string, userId: string) {
        const results = await db
            .select()
            .from(conversationMessages)
            .where(and(eq(conversationMessages.conversationId, conversationId), eq(conversationMessages.userId, userId)))
            .orderBy(conversationMessages.createdAt);

        return results.map((m) => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            content: m.content,
            created_at: m.createdAt.toISOString(),
        }));
    }

    async addMessage(data: { id: string; conversationId: string; userId: string; role: string; content: string }) {
        await db.insert(conversationMessages).values(data);
        await db.update(conversations).set({ updatedAt: new Date() }).where(eq(conversations.id, data.conversationId));
    }

    async updateMessage(messageId: string, conversationId: string, userId: string, content: string) {
        await db
            .update(conversationMessages)
            .set({ content })
            .where(
                and(
                    eq(conversationMessages.id, messageId),
                    eq(conversationMessages.conversationId, conversationId),
                    eq(conversationMessages.userId, userId)
                )
            );
    }
}

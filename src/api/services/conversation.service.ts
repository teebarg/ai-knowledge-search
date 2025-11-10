import { ConversationRepository } from "@/api/repositories/conversation.repository.js";
import { getGemini } from "@/api/lib/gemini.js";
import { ApiError } from "@/api/utils/response.utils.js";

export class ConversationService {
    constructor(private conversationRepo: ConversationRepository) {}

    async list(userId: string) {
        return this.conversationRepo.findByUserId(userId);
    }

    async create(userId: string, title: string) {
        const id = crypto.randomUUID();
        return this.conversationRepo.create({ id, userId, title });
    }

    async update(id: string, userId: string, title: string) {
        const conversation = await this.conversationRepo.findById(id, userId);
        if (!conversation) {
            throw new ApiError("Conversation not found", 404);
        }
        return this.conversationRepo.update(id, { title });
    }

    async delete(id: string, userId: string) {
        const conversation = await this.conversationRepo.findById(id, userId);
        if (!conversation) {
            throw new ApiError("Conversation not found", 404);
        }
        await this.conversationRepo.delete(id);
    }

    async generateTitle(id: string, userId: string) {
        const conversation = await this.conversationRepo.findById(id, userId);
        if (!conversation) {
            throw new ApiError("Conversation not found", 404);
        }

        const messages = await this.conversationRepo.getMessages(id, userId);
        const title = await this.generateTitleFromMessages(messages);

        return this.conversationRepo.update(id, { title });
    }

    async getMessages(id: string, userId: string) {
        const conversation = await this.conversationRepo.findById(id, userId);
        if (!conversation) {
            throw new ApiError("Conversation not found", 404);
        }
        return this.conversationRepo.getMessages(id, userId);
    }

    async addMessage(id: string, userId: string, role: "user" | "assistant", content: string) {
        const conversation = await this.conversationRepo.findById(id, userId);
        if (!conversation) {
            throw new ApiError("Conversation not found", 404);
        }

        const messageId = crypto.randomUUID();
        await this.conversationRepo.addMessage({
            id: messageId,
            conversationId: id,
            userId,
            role,
            content,
        });

        return { id: messageId };
    }

    async updateMessage(conversationId: string, messageId: string, userId: string, content: string) {
        const conversation = await this.conversationRepo.findById(conversationId, userId);
        if (!conversation) {
            throw new ApiError("Conversation not found", 404);
        }

        await this.conversationRepo.updateMessage(messageId, conversationId, userId, content);
        return { ok: true };
    }

    private async generateTitleFromMessages(messages: Array<{ role: string; content: string }>): Promise<string> {
        const recent = messages.slice(-6);
        const convoText = recent
            .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
            .join("\n")
            .slice(0, 2000);

        const genAI = getGemini();
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `Generate a very concise, human-friendly title (max 6 words) for the conversation below.
        - No trailing punctuation.
        - Title case where appropriate.
        - Do not include quotes.

        Conversation:
        ${convoText}`;

        const result = await model.generateContent(prompt);
        const raw = (result.response.text() || "").trim();

        return (
            raw
                .replace(/^["'""]+|["'""]+$/g, "")
                .replace(/[.?!\s]+$/g, "")
                .slice(0, 80) || "Conversation"
        );
    }
}

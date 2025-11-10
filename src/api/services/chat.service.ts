import { chatWithKnowledge } from "../lib/chat.js";
import { ConversationRepository } from "../repositories/conversation.repository.js";
import type { ConversationMessage } from "../types/index.js";
import { ApiError } from "../utils/response.utils.js";

export class ChatService {
    constructor(private conversationRepo: ConversationRepository) {}

    async chat(query: string, userId: string, topK: number = 5, conversationId?: string): Promise<ReadableStream> {
        let history: ConversationMessage[] | undefined;

        if (conversationId) {
            const conversation = await this.conversationRepo.findById(conversationId, userId);
            if (!conversation) {
                throw new ApiError("Conversation not found", 404);
            }
            history = await this.conversationRepo.getMessages(conversationId, userId);
        }

        return chatWithKnowledge(query, userId, topK, history);
    }
}

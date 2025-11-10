import { getGemini } from "./gemini.js";
import { searchSimilarEmbeddings } from "./embeddings-pgvector.js";
import { embedTexts } from "./embeddings.js";

/**
 * Chat with knowledge base using Gemini
 * Retrieves context from embeddings and streams response
 */
export async function chatWithKnowledge(
    query: string,
    userId: string,
    topK: number = 5,
    history?: Array<{ role: "user" | "assistant"; content: string }>
): Promise<ReadableStream> {
    const queryEmbedding = (await embedTexts([query]))[0];

    const searchResults = await searchSimilarEmbeddings(queryEmbedding, userId, topK);
    const SIMILARITY_THRESHOLD = 0.35;
    const relevant = searchResults.filter((r) => (r.score ?? 0) >= SIMILARITY_THRESHOLD);

    const system = `You are a helpful, conversational AI assistant with access to the user's document knowledge base.

    KEY GUIDELINES:
    1. If the user's query relates to their documents, use the context provided and cite sources.
    2. If no relevant documents are found or the query is general, respond naturally using your general knowledge.
    3. For queries like "hi", "hello", respond in a friendly, conversational way.
    4. Maintain context from previous messages in the conversation.
    5. Be concise but informative.
    6. Format responses in clear Markdown when appropriate.

    Current context state: ${relevant.length > 0 ? `I have found ${relevant.length} relevant document sections to help answer your question.` : "I don't see any directly relevant documents for this query, but I'll help based on my general knowledge."}`;

    const contextText = relevant.length > 0 ? relevant.map((r) => `Title: ${r.payload.title}\nContent: ${r.payload.text_chunk}`).join("\n---\n") : "";

    // Build chat-style contents with optional history
    const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

    contents.push({
        role: "user",
        parts: [
            {
                text: `${system}${contextText ? `\n\nRELEVANT DOCUMENTS:\n${contextText}` : ""}`,
            },
        ],
    });

    if (history && history.length) {
        for (const m of history.slice(-10)) {
            contents.push({
                role: m.role === "user" ? "user" : "model",
                parts: [{ text: m.content }],
            });
        }
    }

    contents.push({
        role: "user",
        parts: [{ text: `Question: ${query}\n\nAnswer:` }],
    });

    const genAI = getGemini();
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const streaming = await model.generateContentStream({ contents });

    // Convert Gemini stream to ReadableStream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            try {
                for await (const chunk of streaming.stream) {
                    const text = chunk.text();
                    if (text) {
                        controller.enqueue(encoder.encode(text));
                    }
                }
                controller.close();
            } catch (error) {
                controller.error(error);
            }
        },
    });

    return stream;
}

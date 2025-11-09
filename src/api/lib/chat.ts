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
    topK: number = 5
): Promise<ReadableStream> {
    // Generate query embedding
    const queryEmbedding = (await embedTexts([query]))[0];

    // Search for relevant context
    const searchResults = await searchSimilarEmbeddings(queryEmbedding, userId, topK);

    // Build context from search results
    const contextText = searchResults
        .map((r) => `Title: ${r.payload.title}\nChunk: ${r.payload.text_chunk}`)
        .join("\n---\n");

    // Create the prompt
    const prompt = `You are a helpful assistant that answers questions based on the provided context from the user's documents. 
Use ONLY the information from the context below to answer the question. 
If the context doesn't contain enough information to answer the question, say so.
Always cite the source document title when providing information.

Format your response using proper Markdown syntax:
- Use headers (##, ###) for sections
- Use bullet points (- or *) for lists, not Unicode characters like ● or ○
- Use proper line breaks between paragraphs
- Use code blocks (\`\`\`) for code examples
- Use **bold** for emphasis

Context:
${contextText}

Question: ${query}

Answer:`;

    // Get Gemini model and stream response
    const genAI = getGemini();
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const streaming = await model.generateContentStream({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

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


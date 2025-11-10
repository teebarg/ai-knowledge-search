import { generateEmbeddings, searchSimilarEmbeddings } from "@/api/lib/embeddings-pgvector.js";
import { getGemini } from "@/api/lib/gemini.js";
import type { SearchResult } from "@/api/types/index.js";

export class SearchService {
    async search(query: string, userId: string, topK: number = 5) {
        const embeddings = await generateEmbeddings([query]);
        const queryEmbedding = embeddings[0];
        const results = await searchSimilarEmbeddings(queryEmbedding, userId, topK);

        const summary = await this.generateSummary(query, results);

        return {
            results,
            summary,
            query,
        };
    }

    private async generateSummary(query: string, results: SearchResult[]) {
        const genAI = getGemini();
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `Based on the following search results, summarize the relevant information about "${query}":\n\n${results
            .map((r) => r.payload.text_chunk)
            .join("\n\n")}

            Please format your response in Markdown with:
            - Use ## for section headers
            - Use * or - for bullet points
            - Use proper indentation for nested lists
            - Use **bold** for emphasis`;

        const result = await model.generateContent(prompt);
        return result.response.text();
    }
}

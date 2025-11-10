import { z } from "@hono/zod-openapi";

export const SearchRequestSchema = z.object({
    query: z.string().min(1).openapi({
        description: "Search query",
        example: "machine learning basics",
    }),
    topK: z.number().optional().default(5).openapi({
        description: "Number of results to return",
        example: 5,
    }),
    conversationId: z.string().optional(),
});


export const SearchResultSchema = z.object({
    id: z.string(),
    score: z.number(),
    payload: z.object({
        user_id: z.string(),
        title: z.string(),
        text_chunk: z.string(),
        document_id: z.string(),
        chunk_index: z.number(),
    }),
});


export const SearchResponseSchema = z.object({
    results: z.array(SearchResultSchema).openapi({
        description: "List of search results",
    }),
    summary: z.string().openapi({
        description: "AI-generated summary of the results",
        example: "The documents discuss various aspects of...",
    }),
    query: z.string().openapi({
        description: "Original search query",
        example: "machine learning basics",
    }),
});

import { z } from "zod";

// Common schemas using Zod
export const ErrorSchema = z.object({
    error: z.string(),
    details: z.string().optional(),
});

export const SuccessSchema = z.object({
    ok: z.boolean(),
    message: z.string().optional(),
});

// Upload schemas
export const UploadRequestSchema = z.object({
    file: z.any().optional().openapi({
        type: "string",
        format: "binary",
        description: "File to upload (PDF, TXT, MD)",
    }),
    text: z.string().optional().openapi({
        description: "Text content to upload",
        example: "This is the content to be processed",
    }),
    title: z.string().optional().openapi({
        description: "Document title",
        example: "My Document",
    }),
});

export const UploadResponseSchema = z.object({
    ok: z.boolean().openapi({
        description: "Whether the upload was successful",
        example: true,
    }),
    documentId: z.string().openapi({
        description: "The ID of the uploaded document",
        example: "doc_123abc",
    }),
    chunks: z.number().openapi({
        description: "Number of chunks the document was split into",
        example: 5,
    }),
});

// Search schemas
export const SearchResultPayloadSchema = z.object({
    user_id: z.string().openapi({
        description: "ID of the user who owns the document",
        example: "user_123",
    }),
    title: z.string().openapi({
        description: "Title of the document",
        example: "Getting Started Guide",
    }),
    text_chunk: z.string().openapi({
        description: "Text content of the chunk",
        example: "This is a section of the document...",
    }),
    document_id: z.string().optional().openapi({
        description: "ID of the document",
        example: "doc_456",
    }),
    chunk_index: z.number().optional().openapi({
        description: "Index of the chunk within the document",
        example: 2,
    }),
});

export const SearchResultSchema = z.object({
    id: z.string().openapi({
        description: "ID of the search result",
        example: "result_789",
    }),
    score: z.number().openapi({
        description: "Similarity score of the result",
        example: 0.95,
    }),
    payload: SearchResultPayloadSchema,
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

export const SearchRequestSchema = z.object({
    query: z.string().min(1).openapi({
        description: "Search query",
        example: "machine learning basics",
    }),
    topK: z.number().optional().default(5).openapi({
        description: "Number of results to return",
        example: 5,
    }),
});

// Chat schemas
export const ChatRequestSchema = z.object({
    query: z.string().min(1),
    topK: z.number().optional().default(5),
});

// Document schemas
export const DocumentSchema = z.object({
    id: z.string(),
    userId: z.string(),
    title: z.string(),
    fileName: z.string().nullable(),
    fileUrl: z.string().nullable(),
    fileType: z.string().nullable(),
    fileSize: z.number().nullable(),
    status: z.enum(["processing", "completed", "failed"]),
    chunks: z.number(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
});

export const DocumentsResponseSchema = z.object({
    documents: z.array(DocumentSchema),
});

// Health response schema
export const HealthResponseSchema = z.object({
    message: z.string().openapi({
        example: "Server is running",
        description: "Status message from the server",
    }),
});

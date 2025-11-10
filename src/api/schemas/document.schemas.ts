import { z } from "@hono/zod-openapi";


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

export const DocumentResponseSchema = z.object({
    id: z.string(),
    user_id: z.string(),
    title: z.string(),
    chunks: z.number(),
    created_at: z.string(),
});

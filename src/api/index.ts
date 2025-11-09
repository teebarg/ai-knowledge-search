import "dotenv/config";
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";
import { extractTextFromPdf } from "./lib/pdf.js";
import { chunkText } from "./lib/text.js";
import { db } from "./db/index.js";
import { documents } from "./db/schema.js";
import { eq, desc } from "drizzle-orm";
import { embedAndStore } from "./lib/embeddings-pgvector.js";
import { searchSimilarEmbeddings, generateEmbeddings } from "./lib/embeddings-pgvector.js";
import { chatWithKnowledge } from "./lib/chat.js";
import { getGemini } from "./lib/gemini.js";
import { authMiddleware, getAuthenticatedUser } from "./middleware/auth.js";

const port = Number(process.env.PORT || 8787);

// Create OpenAPI Hono app
const app = new OpenAPIHono();

app.use("*", cors());
app.use("*", prettyJSON());

// Define schemas
const HealthCheckSchema = z.object({
    message: z.string(),
});

const UploadRequestSchema = z.object({
    file: z.any().optional(),
    text: z.string().optional(),
    title: z.string().optional(),
});

const UploadResponseSchema = z.object({
    ok: z.boolean(),
    documentId: z.string(),
    chunks: z.number(),
});

const UploadErrorSchema = z.object({
    error: z.string(),
    details: z.string().optional(),
});

const SearchRequestSchema = z.object({
    query: z.string(),
    topK: z.number().optional().default(5),
});

const SearchResultSchema = z.object({
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

const SearchResponseSchema = z.object({
    results: z.array(SearchResultSchema),
    summary: z.string(),
    query: z.string(),
});

const DocumentSchema = z.object({
    id: z.string(),
    userId: z.string(),
    title: z.string(),
    fileName: z.string().nullable(),
    fileUrl: z.string().nullable(),
    fileType: z.string().nullable(),
    fileSize: z.number().nullable(),
    status: z.enum(["processing", "completed", "failed"]),
    chunks: z.number(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

const DocumentResponseSchema = z.object({
    id: z.string(),
    user_id: z.string(),
    title: z.string(),
    chunks: z.number(),
    created_at: z.string(),
});

const DocumentsResponseSchema = z.object({
    documents: z.array(DocumentResponseSchema),
});

const ErrorSchema = z.object({
    error: z.string(),
    details: z.string(),
});

// OpenAPI routes
const healthRoute = createRoute({
    method: "get",
    path: "/health",
    tags: ["system"],
    description: "Health check endpoint",
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: HealthCheckSchema,
                },
            },
            description: "Success",
        },
    },
});

app.openapi(healthRoute, (c) => {
    return c.json({
        message: "Server is running",
    });
});

// Swagger UI configuration
app.doc("/doc", {
    openapi: "3.0.0",
    info: {
        title: "AI Knowledge Search API",
        version: "1.0.0",
    },
});

app.get("/ui", swaggerUI({ url: "/doc" }));

app.get("/", (c) => {
    return c.json({
        message: "Hello from Hono API!",
        docs: "/ui",
        openapi: "/doc",
    });
});

// Apply authentication middleware to all /v1 routes
app.use("/v1/*", authMiddleware);

// Upload document endpoint
const uploadRoute = createRoute({
    method: "post",
    path: "/v1/upload",
    security: [{ Bearer: [] }],
    tags: ["documents"],
    description: "Upload a document or text",
    request: {
        body: {
            content: {
                "multipart/form-data": {
                    schema: UploadRequestSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: "Document uploaded successfully",
            content: {
                "application/json": {
                    schema: UploadResponseSchema,
                },
            },
        },
        400: {
            description: "Bad request",
            content: {
                "application/json": {
                    schema: UploadErrorSchema,
                },
            },
        },
        500: {
            description: "Server error",
            content: {
                "application/json": {
                    schema: UploadErrorSchema,
                },
            },
        },
    },
});

app.openapi(uploadRoute, async (c) => {
    const user = await getAuthenticatedUser(c);
    const body = await c.req.parseBody();

    try {
        let text = "";
        let title = body.title as string;

        if (body.file) {
            const file = body.file as File;
            if (!file.name) {
                const errorResponse: z.infer<typeof UploadErrorSchema> = {
                    error: "Invalid file",
                    details: "File must have a name",
                };
                return c.json(errorResponse, 400);
            }

            // Check file type
            if (!file.type || !file.type.includes("pdf")) {
                const errorResponse: z.infer<typeof UploadErrorSchema> = {
                    error: "Invalid file type",
                    details: "Only PDF files are supported",
                };
                return c.json(errorResponse, 400);
            }

            title = title || file.name;

            // Convert file to buffer
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            text = await extractTextFromPdf(buffer);
        } else if (body.text) {
            text = body.text as string;
            title = title || "Untitled Document";
        } else {
            const errorResponse: z.infer<typeof UploadErrorSchema> = {
                error: "No file or text provided",
                details: "Please provide either a file or text content",
            };
            return c.json(errorResponse, 400);
        }

        // Generate chunks from the extracted text
        const textChunks = chunkText(text);
        if (!textChunks || textChunks.length === 0) {
            const errorResponse: z.infer<typeof UploadErrorSchema> = {
                error: "Failed to process document",
                details: "Could not extract any text chunks from the document",
            };
            return c.json(errorResponse, 400);
        }

        const documentId = crypto.randomUUID();
        const now = new Date();

        // Create the document record
        await db.insert(documents).values({
            id: documentId,
            title,
            userId: user.id,
            status: "processing",
            chunks: textChunks.length,
            fileName: body.file ? (body.file as File).name : null,
            fileType: body.file ? (body.file as File).type : null,
            fileSize: body.file ? (body.file as File).size : null,
            createdAt: now,
            updatedAt: now,
        });

        // Store all chunks with their embeddings
        await embedAndStore(documentId, user.id, textChunks);

        // Update document status to completed
        await db.update(documents).set({ status: "completed", updatedAt: new Date() }).where(eq(documents.id, documentId));

        const successResponse: z.infer<typeof UploadResponseSchema> = {
            ok: true,
            documentId,
            chunks: textChunks.length,
        };

        return c.json(successResponse, 200);
    } catch (error) {
        const errorResponse: z.infer<typeof UploadErrorSchema> = {
            error: "Failed to process document",
            details: error instanceof Error ? error.message : String(error),
        };
        return c.json(errorResponse, 500);
    }
});

// Search endpoint
const searchRoute = createRoute({
    method: "post",
    path: "/v1/search",
    security: [{ Bearer: [] }],
    tags: ["search"],
    description: "Search through documents",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: SearchRequestSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: "Search results",
            content: {
                "application/json": {
                    schema: SearchResponseSchema,
                },
            },
        },
        500: {
            description: "Server error",
            content: {
                "application/json": {
                    schema: ErrorSchema,
                },
            },
        },
    },
});

app.openapi(searchRoute, async (c) => {
    const user = await getAuthenticatedUser(c);
    const { query, topK = 5 } = await c.req.json<z.infer<typeof SearchRequestSchema>>();

    try {
        const embeddings = await generateEmbeddings([query]);
        const queryEmbedding = embeddings[0];
        const results = await searchSimilarEmbeddings(queryEmbedding, user.id, topK);
        const genAI = getGemini();
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `Based on the following search results, summarize the relevant information about "${query}":\n\n${results
            .map((r) => r.payload.text_chunk)
            .join("\n\n")}`;
        const result = await model.generateContent(prompt);
        const summary = result.response.text();

        const successResponse: z.infer<typeof SearchResponseSchema> = {
            results,
            summary,
            query,
        };

        return c.json(successResponse, 200);
    } catch (error) {
        const errorResponse: z.infer<typeof ErrorSchema> = {
            error: "Failed to perform search",
            details: error instanceof Error ? error.message : String(error),
        };
        return c.json(errorResponse, 500);
    }
});

// Chat endpoint
const chatRoute = createRoute({
    method: "post",
    path: "/v1/chat",
    security: [{ Bearer: [] }],
    tags: ["chat"],
    description: "Chat with AI using knowledge base",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: SearchRequestSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: "Chat stream",
            content: {
                "text/event-stream": {
                    schema: z.any(),
                },
            },
        },
        500: {
            description: "Server error",
            content: {
                "application/json": {
                    schema: ErrorSchema,
                },
            },
        },
    },
});

app.openapi(chatRoute, async (c) => {
    const user = await getAuthenticatedUser(c);
    const { query, topK = 5 } = await c.req.json<z.infer<typeof SearchRequestSchema>>();

    try {
        const stream = await chatWithKnowledge(query, user.id, topK);
        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
            },
        });
    } catch (error) {
        const errorResponse: z.infer<typeof ErrorSchema> = {
            error: "Failed to process chat",
            details: error instanceof Error ? error.message : String(error),
        };
        return c.json(errorResponse, 500);
    }
});

// Get documents endpoint
const documentsRoute = createRoute({
    method: "get",
    path: "/v1/documents",
    security: [{ Bearer: [] }],
    tags: ["documents"],
    description: "List all documents",
    responses: {
        200: {
            description: "List of documents",
            content: {
                "application/json": {
                    schema: DocumentsResponseSchema,
                },
            },
        },
        500: {
            description: "Server error",
            content: {
                "application/json": {
                    schema: ErrorSchema,
                },
            },
        },
    },
});

app.openapi(documentsRoute, async (c) => {
    const user = await getAuthenticatedUser(c);

    try {
        // Then try to fetch documents
        const userDocuments = await db.select().from(documents).where(eq(documents.userId, user.id)).orderBy(desc(documents.createdAt));

        console.log(`Found ${userDocuments.length} documents for user`);

        // Transform to match frontend expectations (snake_case and wrapped in documents object)
        const formattedDocs = userDocuments.map((doc) => ({
            id: doc.id,
            user_id: doc.userId,
            title: doc.title,
            chunks: doc.chunks,
            created_at: doc.createdAt.toISOString(),
        }));

        return c.json({ documents: formattedDocs }, 200);
    } catch (error) {
        console.error("Error in documents route:", error);
        const errorResponse: z.infer<typeof ErrorSchema> = {
            error: "Failed to fetch documents",
            details: error instanceof Error ? error.message : String(error),
        };
        return c.json(errorResponse, 500);
    }
});

// Start the server in development mode
if (process.env.NODE_ENV !== "production") {
    const { serve } = await import("@hono/node-server");

    serve(
        {
            fetch: app.fetch,
            port,
        },
        (info) => {
            console.log(`Server is running on http://localhost:${info.port}`);
        }
    );
}

export default app;

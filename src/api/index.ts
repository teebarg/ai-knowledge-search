import { Hono } from "hono";
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";
import { extractTextFromPdf } from "./lib/pdf.js";
import { chunkText } from "./lib/text.js";
import { supabaseAdmin } from "./lib/supabase.js";
import { db } from "./db/index.js";
import { documents } from "./db/schema.js";
import { eq, desc } from "drizzle-orm";
import { embedAndStore } from "./lib/embeddings-pgvector.js";
import {
  searchSimilarEmbeddings,
  generateEmbeddings,
} from "./lib/embeddings-pgvector.js";
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
      const file = body.file as any;
      if (!file.name) {
        throw new Error("Invalid file");
      }
      title = title || file.name;
      text = await extractTextFromPdf(file);
    } else if (body.text) {
      text = body.text as string;
      title = title || "Untitled Document";
    } else {
      throw new Error("No file or text provided");
    }

    const chunks = chunkText(text);
    const documentId = crypto.randomUUID();

    await db.insert(documents).values({
      title,
      userId: user.id,
      createdAt: new Date(),
    });

    for (const chunk of chunks) {
      await embedAndStore(chunk, documentId, user.id);
    }

    return c.json({
      ok: true,
      documentId,
      chunks: chunks.length,
    });
  } catch (error) {
    if (
      (error instanceof Error && error.message === "Invalid file") ||
      error.message === "No file or text provided"
    ) {
      return c.json({ error: error.message }, 400);
    }
    throw new Error(
      "Failed to process document: " +
        (error instanceof Error ? error.message : String(error))
    );
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
  const { query, topK = 5 } = await c.req.json();

  try {
    const results = await searchSimilarEmbeddings(query, user.id, topK);
    const genAI = getGemini();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Based on the following search results, summarize the relevant information about "${query}":\n\n${results.map((r) => r.payload.text_chunk).join("\n\n")}`;
    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    const response = {
      results,
      summary,
      query,
    } satisfies z.infer<typeof SearchResponseSchema>;

    return c.json(response);
  } catch (error) {
    throw new Error(
      "Failed to perform search: " +
        (error instanceof Error ? error.message : String(error))
    );
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
  const { query, topK = 5 } = await c.req.json();

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
    throw new Error(
      "Failed to process chat: " +
        (error instanceof Error ? error.message : String(error))
    );
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
          schema: z.array(DocumentSchema),
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
    const userDocuments = await db
      .select()
      .from(documents)
      .where(eq(documents.userId, user.id))
      .orderBy(desc(documents.createdAt));

    return c.json(
      userDocuments.map((doc) => ({
        ...doc,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
      }))
    );
  } catch (error) {
    throw new Error(
      "Failed to fetch documents: " +
        (error instanceof Error ? error.message : String(error))
    );
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

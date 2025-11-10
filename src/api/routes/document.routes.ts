import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { getAuthenticatedUser } from "@/api/middleware/auth.js";
import { DocumentService } from "@/api/services/document.service.js";
import { DocumentRepository } from "@/api/repositories/document.repository.js";
import { UploadRequestSchema, UploadResponseSchema, DocumentsResponseSchema } from "@/api/schemas/document.schemas.js";
import { ErrorSchema } from "@/api/schemas/common.schemas.js";
import { errorResponse, successResponse } from "@/api/utils/response.utils.js";

export const documentRoutes = new OpenAPIHono();
const documentService = new DocumentService(new DocumentRepository());

documentRoutes.openapi(
    createRoute({
        method: "post",
        path: "/upload",
        security: [{ Bearer: [] }],
        tags: ["documents"],
        description: "Upload a document or text",
        request: {
            body: {
                content: { "multipart/form-data": { schema: UploadRequestSchema } },
            },
        },
        responses: {
            200: {
                description: "Document uploaded successfully",
                content: { "application/json": { schema: UploadResponseSchema } },
            },
            400: {
                description: "Bad request",
                content: { "application/json": { schema: ErrorSchema } },
            },
            500: {
                description: "Server error",
                content: { "application/json": { schema: ErrorSchema } },
            },
        },
    }),
    async (c) => {
        try {
            const user = await getAuthenticatedUser(c);
            const body = await c.req.parseBody();

            const result = await documentService.uploadDocument(
                user.id,
                body.file as File | undefined,
                body.text as string | undefined,
                body.title as string | undefined
            );

            return successResponse(c, result);
        } catch (error: any) {
            return errorResponse(c, error.message, error.details, error.statusCode || 500);
        }
    }
);

documentRoutes.openapi(
    createRoute({
        method: "get",
        path: "/documents",
        security: [{ Bearer: [] }],
        tags: ["documents"],
        description: "List all documents",
        responses: {
            200: {
                description: "List of documents",
                content: { "application/json": { schema: DocumentsResponseSchema } },
            },
            500: {
                description: "Server error",
                content: { "application/json": { schema: ErrorSchema } },
            },
        },
    }),
    async (c) => {
        try {
            const user = await getAuthenticatedUser(c);
            const documents = await documentService.getDocuments(user.id);
            return successResponse(c, { documents });
        } catch (error: any) {
            return errorResponse(c, "Failed to fetch documents", error.message);
        }
    }
);

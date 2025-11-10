import { extractTextFromPdf } from "@/api/lib/pdf.js";
import { chunkText } from "@/api/lib/text.js";
import { embedAndStore } from "@/api/lib/embeddings-pgvector.js";
import { DocumentRepository } from "@/api/repositories/document.repository.js";
import { ApiError } from "@/api/utils/response.utils.js";

export class DocumentService {
    constructor(private documentRepo: DocumentRepository) {}

    async uploadDocument(userId: string, file?: File, text?: string, title?: string) {
        let documentText = "";
        let documentTitle = title || "";

        if (file) {
            this.validateFile(file);
            documentTitle = documentTitle || file.name;
            documentText = await this.extractTextFromFile(file);
        } else if (text) {
            documentText = text;
            documentTitle = documentTitle || "Untitled Document";
        } else {
            throw new ApiError("No file or text provided", 400, "Please provide either a file or text content");
        }

        const textChunks = chunkText(documentText);
        if (!textChunks || textChunks.length === 0) {
            throw new ApiError("Failed to process document", 400, "Could not extract any text chunks from the document");
        }

        const documentId = crypto.randomUUID();

        await this.documentRepo.create({
            id: documentId,
            userId,
            title: documentTitle,
            status: "processing",
            chunks: textChunks.length,
            fileName: file?.name || null,
            fileType: file?.type || null,
            fileSize: file?.size || null,
        });

        await embedAndStore(documentId, userId, textChunks);
        await this.documentRepo.updateStatus(documentId, "completed");

        return {
            ok: true,
            documentId,
            chunks: textChunks.length,
        };
    }

    async getDocuments(userId: string) {
        return this.documentRepo.findByUserId(userId);
    }

    private validateFile(file: File) {
        if (!file.name) {
            throw new ApiError("Invalid file", 400, "File must have a name");
        }

        if (!file.type || !file.type.includes("pdf")) {
            throw new ApiError("Invalid file type", 400, "Only PDF files are supported");
        }
    }

    private async extractTextFromFile(file: File): Promise<string> {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        return extractTextFromPdf(buffer);
    }
}

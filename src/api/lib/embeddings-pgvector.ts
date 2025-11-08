import { db } from "../db/index.js";
import { embeddings as embeddingsTable, documents } from "../db/schema.js";
import { eq, sql } from "drizzle-orm";
import { embedTexts, EMBEDDING_DIM } from "./embeddings.js";

// Re-export for consistency
export const generateEmbeddings = embedTexts;

/**
 * Store embeddings in pgvector
 */
export async function storeEmbeddings(
    documentId: string,
    userId: string,
    chunks: string[],
    embeddings: number[][]
): Promise<void> {
    if (chunks.length !== embeddings.length) {
        throw new Error("Chunks and embeddings arrays must have the same length");
    }

    // Insert embeddings
    const embeddingRecords = chunks.map((chunk, index) => ({
        documentId,
        userId,
        chunkIndex: index,
        textChunk: chunk,
        embedding: embeddings[index],
    }));

    // Insert in batches to avoid overwhelming the database
    const batchSize = 50;
    for (let i = 0; i < embeddingRecords.length; i += batchSize) {
        const batch = embeddingRecords.slice(i, i + batchSize);
        await db.insert(embeddingsTable).values(batch);
    }
}

/**
 * Search for similar embeddings using cosine distance
 */
export async function searchSimilarEmbeddings(
    queryEmbedding: number[],
    userId: string,
    topK: number = 5
) {
    // Convert embedding array to PostgreSQL vector format
    const vectorStr = `[${queryEmbedding.join(",")}]`;
    
    // Use pgvector's cosine distance operator (<=>)
    // The query returns results ordered by similarity (lower distance = more similar)
    // Cosine similarity = 1 - cosine distance
    const results = await db
        .select({
            id: embeddingsTable.id,
            documentId: embeddingsTable.documentId,
            chunkIndex: embeddingsTable.chunkIndex,
            textChunk: embeddingsTable.textChunk,
            similarity: sql<number>`1 - (${sql.raw(vectorStr)}::vector <=> ${embeddingsTable.embedding})`.as("similarity"),
            documentTitle: documents.title,
        })
        .from(embeddingsTable)
        .innerJoin(documents, eq(embeddingsTable.documentId, documents.id))
        .where(eq(embeddingsTable.userId, userId))
        .orderBy(sql`${embeddingsTable.embedding} <=> ${sql.raw(vectorStr)}::vector`)
        .limit(topK);

    return results.map((r) => ({
        id: r.id,
        score: r.similarity || 0,
        payload: {
            user_id: userId,
            title: r.documentTitle || "Unknown",
            text_chunk: r.textChunk,
            document_id: r.documentId,
            chunk_index: r.chunkIndex,
        },
    }));
}

/**
 * Generate embeddings and store them
 */
export async function embedAndStore(
    documentId: string,
    userId: string,
    chunks: string[]
): Promise<void> {
    // Generate embeddings using Gemini
    const embeddingVectors = await generateEmbeddings(chunks);
    
    // Store in pgvector
    await storeEmbeddings(documentId, userId, chunks, embeddingVectors);
}



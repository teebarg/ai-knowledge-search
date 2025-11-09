import { db, pool } from "../db/index.js";
import { embeddings as embeddingsTable } from "../db/schema.js";
import { embedTexts } from "./embeddings.js";

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
    // Convert embedding array to PostgreSQL vector format string
    // Format: [0.1,0.2,0.3,...] - pgvector expects this format
    const vectorStr = `[${queryEmbedding.join(",")}]`;
    
    // Use raw SQL query with pgvector cosine distance operator (<=>)
    // We use the pool directly for better control over the query
    // The vector needs to be cast as ::vector type for pgvector to work
    const query = `
        SELECT 
            e.id,
            e.document_id as "documentId",
            e.chunk_index as "chunkIndex",
            e.text_chunk as "textChunk",
            1 - ($1::vector <=> e.embedding) as similarity,
            d.title as "documentTitle"
        FROM embeddings e
        INNER JOIN documents d ON e.document_id = d.id
        WHERE e.user_id = $2
        ORDER BY e.embedding <=> $1::vector
        LIMIT $3
    `;
    
    // Execute the query using the pool directly with parameterized query
    const result = await pool.query(query, [vectorStr, userId, topK]);
    
    return result.rows.map((r: any) => ({
        id: r.id,
        score: parseFloat(r.similarity) || 0,
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



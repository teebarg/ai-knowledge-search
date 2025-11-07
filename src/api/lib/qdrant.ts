import { QdrantClient } from "@qdrant/js-client-rest";
import { EMBEDDING_DIM } from "./embeddings.js";

const getClient = () => {
    const url = process.env.QDRANT_URL;
    const apiKey = process.env.QDRANT_API_KEY;
    if (!url || !apiKey) throw new Error("QDRANT_URL or QDRANT_API_KEY missing");
    return new QdrantClient({ url, apiKey });
};

export async function ensureQdrantCollection(collection: string) {
    const client = getClient();
    const exists = await client.getCollections().then((r) => r.collections?.some((c) => c.name === collection));
    if (!exists) {
        await client.createCollection(collection, {
            vectors: { size: EMBEDDING_DIM, distance: "Cosine" },
        });
    }
}

export async function upsertEmbeddings(vectors: number[][], chunks: string[], userId: string, title: string) {
    const client = getClient();
    const collection = process.env.QDRANT_COLLECTION || "ai_knowledge";
    const points = vectors.map((vec, i) => ({
        id: `${userId}-${Date.now()}-${i}`,
        vector: vec,
        payload: {
            user_id: userId,
            title,
            text_chunk: chunks[i],
        },
    }));
    await client.upsert(collection, { points });
}

export async function searchEmbeddings(queryVec: number[], userId: string, topK: number) {
    const client = getClient();
    const collection = process.env.QDRANT_COLLECTION || "ai_knowledge";
    const results = await client.search(collection, {
        vector: queryVec,
        limit: topK,
        with_payload: true,
        filter: {
            must: [{ key: "user_id", match: { value: userId } }],
        },
    });
    return results.map((r) => ({
        id: r.id,
        score: r.score,
        payload: r.payload as { user_id: string; title: string; text_chunk: string },
    }));
}

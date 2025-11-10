import { db } from "@/api/db/index.js";
import { documents } from "@/api/db/schema.js";
import { eq, desc } from "drizzle-orm";

export class DocumentRepository {
    async create(data: {
        id: string;
        userId: string;
        title: string;
        status: "processing" | "completed" | "failed";
        chunks: number;
        fileName: string | null;
        fileType: string | null;
        fileSize: number | null;
    }) {
        const now = new Date();
        await db.insert(documents).values({
            ...data,
            createdAt: now,
            updatedAt: now,
        });
    }

    async updateStatus(id: string, status: "processing" | "completed" | "failed") {
        await db.update(documents).set({ status, updatedAt: new Date() }).where(eq(documents.id, id));
    }

    async findByUserId(userId: string) {
        const results = await db.select().from(documents).where(eq(documents.userId, userId)).orderBy(desc(documents.createdAt));

        return results.map((doc) => ({
            id: doc.id,
            user_id: doc.userId,
            title: doc.title,
            chunks: doc.chunks,
            created_at: doc.createdAt.toISOString(),
        }));
    }
}

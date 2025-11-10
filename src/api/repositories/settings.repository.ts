import { db } from "@/api/db";
import { userSettings, users } from "@/api/db/schema";
import { eq } from "drizzle-orm";

export class SettingsRepository {
    async getSettings(userId: string) {
        const settings = await db.select().from(userSettings).where(eq(userSettings.userId, userId));
        return settings[0] || null;
    }

    async upsertSettings(userId: string, data: {
        apiKey?: string;
        useOwnKey?: boolean;
        preferredModel?: string;
    }) {
        const now = new Date();

        // Upsert user_settings
        await db
            .insert(userSettings)
            .values({
                userId,
                ...data,
                createdAt: now,
                updatedAt: now,
            })
            .onConflictDoUpdate({
                target: userSettings.userId,
                set: {
                    ...data,
                    updatedAt: now,
                },
            });

        const settings = await this.getSettings(userId);
        return settings;
    }

    async updateUserName(userId: string, name: string) {
        const now = new Date();
        await db.update(users)
            .set({ name, updatedAt: now })
            .where(eq(users.id, userId));
        // Return updated user
        const user = await db.select().from(users).where(eq(users.id, userId));
        return user[0] || null;
    }

    async deleteApiKey(userId: string) {
        await db
            .update(userSettings)
            .set({
                apiKey: null,
                useOwnKey: false,
                updatedAt: new Date(),
            })
            .where(eq(userSettings.userId, userId));

        return this.getSettings(userId);
    }
}

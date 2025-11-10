import { SettingsRepository } from "@/api/repositories/settings.repository";

export class SettingsService {
    constructor(private settingsRepo: SettingsRepository) {}

    async getSettings(userId: string) {
        return this.settingsRepo.getSettings(userId);
    }

    async updateSettings(
        userId: string,
        data: {
            name?: string;
            apiKey?: string;
            useOwnKey?: boolean;
            preferredModel?: string;
        }
    ) {
        // If name is present, update users table
        if (data.name !== undefined) {
            return this.settingsRepo.updateUserName(userId, data.name);
        }

        // Handle special case for API key
        if (data.apiKey === "") {
            data.apiKey = undefined;
            data.useOwnKey = false;
        }

        // If setting an API key, ensure useOwnKey is true
        if (data.apiKey) {
            data.useOwnKey = true;
        }

        return this.settingsRepo.upsertSettings(userId, data);
    }

    async deleteApiKey(userId: string) {
        return this.settingsRepo.deleteApiKey(userId);
    }
}

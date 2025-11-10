import { getAuthHeaders } from "./api";
const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export interface Settings {
    name?: string;
    apiKey?: string;
    useOwnKey: boolean;
    preferredModel: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface SettingsResponse {
    settings: Settings;
}

export async function getSettings(): Promise<Settings> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/v1/settings`, {
        method: "GET",
        headers,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get settings");
    }

    const data = await response.json();
    return data.settings;
}

export async function updateSettings(data: {
    name?: string;
    apiKey?: string;
    useOwnKey?: boolean;
    preferredModel?: string;
}): Promise<Settings> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/v1/settings`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update settings");
    }

    const result = await response.json();
    return result.settings;
}

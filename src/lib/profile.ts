import { getAuthHeaders } from "./api";
const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    createdAt?: string;
    updatedAt?: string;
}

export async function getProfile(): Promise<UserProfile> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/v1/profile`, {
        method: "GET",
        headers,
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get profile");
    }
    return response.json();
}

export async function updateProfile(data: { name: string }): Promise<UserProfile> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/v1/profile`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update profile");
    }
    return response.json();
}

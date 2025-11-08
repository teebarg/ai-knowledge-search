/**
 * API utility functions for communicating with the backend
 */

import { getSupabaseClient } from "./supabase-client";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

/**
 * Get the current session token for authenticated requests
 */
async function getAuthToken(): Promise<string | null> {
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
}

/**
 * Create headers with authentication token
 */
async function getAuthHeaders(): Promise<HeadersInit> {
    const token = await getAuthToken();
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };
    
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    
    return headers;
}

export interface SearchResult {
    id: string;
    score: number;
    payload: {
        user_id: string;
        title: string;
        text_chunk: string;
    };
}

export interface SearchResponse {
    results: SearchResult[];
}

export interface UploadResponse {
    ok: boolean;
    chunks: number;
}

export interface Document {
    id: string;
    user_id: string;
    title: string;
    chunks: number;
    created_at?: string;
}

export interface DocumentsResponse {
    documents: Document[];
}

/**
 * Upload a document (file or text) to the knowledge base
 */
export async function uploadDocument(
    file: File | null,
    text: string | null,
    title: string = "Untitled"
): Promise<UploadResponse> {
    const token = await getAuthToken();
    if (!token) {
        throw new Error("Not authenticated");
    }

    const formData = new FormData();
    if (file) {
        formData.append("file", file);
    }
    if (text) {
        formData.append("text", text);
    }
    formData.append("title", title);

    const response = await fetch(`${API_BASE_URL}/v1/upload`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
    }

    return response.json();
}

/**
 * Search the knowledge base
 */
export async function searchKnowledge(
    query: string,
    topK: number = 5
): Promise<SearchResponse> {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/v1/search`, {
        method: "POST",
        headers,
        body: JSON.stringify({ query, topK }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Search failed");
    }

    return response.json();
}

/**
 * Chat with the knowledge base (streaming response)
 * Handles Gemini streaming format (plain text chunks)
 */
export async function chatWithKnowledge(
    query: string,
    topK: number = 5,
    onChunk: (chunk: string) => void,
    onError?: (error: Error) => void
): Promise<void> {
    try {
        const headers = await getAuthHeaders();
        
        const response = await fetch(`${API_BASE_URL}/v1/chat`, {
            method: "POST",
            headers,
            body: JSON.stringify({ query, topK }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: "Chat failed" }));
            throw new Error(error.error || "Chat failed");
        }

        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error("No response body");
        }

        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            if (chunk) {
                onChunk(chunk);
            }
        }
    } catch (error) {
        if (onError) {
            onError(error instanceof Error ? error : new Error("Unknown error"));
        } else {
            throw error;
        }
    }
}

/**
 * Fetch all documents for a user
 */
export async function fetchDocuments(): Promise<DocumentsResponse> {
    const token = await getAuthToken();
    if (!token) {
        throw new Error("Not authenticated");
    }

    const response = await fetch(`${API_BASE_URL}/v1/documents`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch documents");
    }

    return response.json();
}


export interface User {
    id: string;
    email: string;
}

export interface Document {
    id: string;
    userId: string;
    title: string;
    fileName: string | null;
    fileUrl: string | null;
    fileType: string | null;
    fileSize: number | null;
    status: "processing" | "completed" | "failed";
    chunks: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface SearchResult {
    id: string;
    score: number;
    payload: {
        user_id: string;
        title: string;
        text_chunk: string;
        document_id: string;
        chunk_index: number;
    };
}

export interface ConversationMessage {
    role: "user" | "assistant";
    content: string;
}

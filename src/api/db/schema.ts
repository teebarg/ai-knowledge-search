import { pgTable, serial, text, timestamp, varchar, integer, uuid, pgEnum, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { vector } from "./vector";

// Enum for document status
export const documentStatusEnum = pgEnum("document_status", ["processing", "completed", "failed"]);

// Documents table - stores metadata about uploaded documents
export const documents = pgTable("documents", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    fileName: text("file_name"),
    fileUrl: text("file_url"), // Supabase Storage URL
    fileType: text("file_type"), // pdf, txt, md, etc.
    fileSize: integer("file_size"), // in bytes
    status: documentStatusEnum("status").default("processing").notNull(),
    chunks: integer("chunks").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Embeddings table - stores vector embeddings for document chunks
// Using pgvector extension for similarity search
export const embeddings = pgTable("embeddings", {
    id: uuid("id").defaultRandom().primaryKey(),
    documentId: uuid("document_id")
        .notNull()
        .references(() => documents.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    chunkIndex: integer("chunk_index").notNull(),
    textChunk: text("text_chunk").notNull(),
    embedding: vector("embedding", { dimensions: 768 }), // 768 for Gemini text-embedding-004
    metadata: text("metadata"), // JSON string for additional metadata
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Conversations table
export const conversations = pgTable("conversations", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Conversation messages table
export const conversationMessages = pgTable("conversation_messages", {
    id: uuid("id").defaultRandom().primaryKey(),
    conversationId: uuid("conversation_id")
        .notNull()
        .references(() => conversations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull(), // "user" | "assistant"
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const documentsRelations = relations(documents, ({ many }) => ({
    embeddings: many(embeddings),
}));

export const embeddingsRelations = relations(embeddings, ({ one }) => ({
    document: one(documents, {
        fields: [embeddings.documentId],
        references: [documents.id],
    }),
}));

export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: text("email").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userSettings = pgTable("user_settings", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    apiKey: text("api_key"),
    useOwnKey: boolean("use_own_key").default(false),
    preferredModel: text("preferred_model").default("gemini"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

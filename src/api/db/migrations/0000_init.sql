-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create document_status enum
CREATE TYPE document_status AS ENUM ('processing', 'completed', 'failed');

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    file_name TEXT,
    file_url TEXT,
    file_type TEXT,
    file_size INTEGER,
    status document_status DEFAULT 'processing' NOT NULL,
    chunks INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create embeddings table with pgvector
CREATE TABLE IF NOT EXISTS embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    text_chunk TEXT NOT NULL,
    embedding vector(768), -- 768 dimensions for Gemini text-embedding-004
    metadata TEXT,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_embeddings_user_id ON embeddings(user_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_document_id ON embeddings(document_id);

-- Create vector similarity search index (HNSW for fast approximate nearest neighbor search)
CREATE INDEX IF NOT EXISTS idx_embeddings_vector ON embeddings 
USING hnsw (embedding vector_cosine_ops);

-- Create users table (if needed)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);


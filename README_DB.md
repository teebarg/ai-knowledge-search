# Database Setup and Migrations

This project uses Drizzle ORM with PostgreSQL and pgvector for vector similarity search.

## Prerequisites

1. PostgreSQL database with pgvector extension enabled
2. Supabase (recommended) or self-hosted PostgreSQL

## Setup

### 1. Enable pgvector Extension

Connect to your PostgreSQL database and run:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 2. Environment Variables

Make sure you have the following environment variables set:

```env
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_BUCKET=documents
```

### 3. Run Migrations

#### Option A: Using Drizzle Kit (Recommended)

```bash
# Generate migration files from schema
npm run db:generate

# Push schema to database (for development)
npm run db:push

# Or run migrations (for production)
npm run db:migrate
```

#### Option B: Manual SQL Migration

Run the SQL file directly:

```bash
psql $DATABASE_URL -f src/api/db/migrations/0000_init.sql
```

### 4. Verify Installation

Check that tables were created:

```sql
\dt
SELECT * FROM documents LIMIT 1;
SELECT * FROM embeddings LIMIT 1;
```

## Schema Overview

### Documents Table
- Stores metadata about uploaded documents
- Tracks processing status
- Links to Supabase Storage files

### Embeddings Table
- Stores vector embeddings for document chunks
- Uses pgvector for similarity search
- Indexed with HNSW for fast approximate nearest neighbor search

## Vector Dimensions

The default embedding model is `text-embedding-004` (Gemini) which produces 768-dimensional vectors.

Update the `dimensions` parameter in:
- `src/api/db/schema.ts` (vector type definition)
- `src/api/db/migrations/0000_init.sql` (SQL migration)
- `src/api/lib/embeddings.ts` (EMBEDDING_DIM constant)

## Troubleshooting

### pgvector extension not found
```sql
-- Install pgvector extension
CREATE EXTENSION vector;
```

### Vector dimension mismatch
Make sure the vector dimensions in your schema match your embedding model dimensions.

### Migration errors
If migrations fail, you may need to drop and recreate tables:
```sql
DROP TABLE IF EXISTS embeddings CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TYPE IF EXISTS document_status;
```

Then run migrations again.


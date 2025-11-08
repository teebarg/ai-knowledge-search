# Migration Guide: Qdrant to pgvector

This guide explains the changes made to migrate from Qdrant to pgvector and integrate Drizzle ORM.

## Overview of Changes

### 1. Database Layer
- **Before**: Direct Supabase queries + Qdrant for vector storage
- **After**: Drizzle ORM + pgvector in PostgreSQL

### 2. Vector Storage
- **Before**: Qdrant (separate vector database)
- **After**: pgvector extension in PostgreSQL

### 3. Chat Interface
- **Before**: Custom Gemini streaming
- **After**: Vercel AI SDK with OpenAI

## Key Files Changed

### New Files
- `src/api/db/schema.ts` - Drizzle schema definitions
- `src/api/db/vector.ts` - Custom pgvector type for Drizzle
- `src/api/db/migrations/0000_init.sql` - Initial migration
- `src/api/lib/embeddings-pgvector.ts` - pgvector operations
- `src/api/lib/openai.ts` - OpenAI client and embeddings
- `src/api/lib/chat.ts` - Vercel AI SDK chat handler
- `README_DB.md` - Database setup documentation

### Modified Files
- `src/api/index.ts` - Updated all endpoints to use Drizzle
- `src/api/lib/pdf.ts` - Added OpenAI extraction option
- `package.json` - Added new dependencies
- `src/lib/api.ts` - Updated chat streaming parser

## Dependencies Added

```json
{
  "@ai-sdk/openai": "^1.0.0",
  "ai": "^4.0.0",
  "openai": "^4.67.0",
  "drizzle-pgvector": "^0.1.0"
}
```

## Environment Variables

Add these to your `.env`:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require

# OpenAI (required for embeddings and chat)
OPENAI_API_KEY=sk-...

# Supabase (for file storage)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_BUCKET=documents
```

## Migration Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Enable pgvector Extension

Connect to your PostgreSQL database:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 3. Run Database Migrations

```bash
# Option A: Generate and push (development)
npm run db:generate
npm run db:push

# Option B: Run SQL migration directly
psql $DATABASE_URL -f src/api/db/migrations/0000_init.sql
```

### 4. Migrate Existing Data (if any)

If you have existing data in Qdrant, you'll need to:
1. Export embeddings from Qdrant
2. Re-embed documents using OpenAI (if using different model)
3. Import into pgvector

Or simply re-upload documents through the new API.

### 5. Update Environment Variables

Make sure all required environment variables are set.

### 6. Test the API

```bash
npm run dev:api
```

Test endpoints:
- `POST /v1/upload` - Upload a document
- `POST /v1/search` - Search documents
- `POST /v1/chat` - Chat with documents
- `GET /v1/documents` - List documents

## Breaking Changes

### API Response Formats

1. **Search Endpoint**: Now includes `summary` field with AI-generated summary
2. **Chat Endpoint**: Uses Vercel AI SDK streaming format (Server-Sent Events)
3. **Documents Endpoint**: Returns Drizzle schema format (different field names)

### Field Name Changes

- `user_id` → `userId` (camelCase in Drizzle)
- `created_at` → `createdAt`
- `file_name` → `fileName`
- `file_url` → `fileUrl`

## Features Added

1. **AI-Generated Summaries**: Search results now include AI-generated summaries
2. **Better Error Handling**: Document processing status tracking
3. **File Type Support**: Better handling of different file types
4. **OpenAI Embeddings**: Using `text-embedding-3-small` (1536 dimensions)

## Performance Considerations

- pgvector HNSW index provides fast approximate nearest neighbor search
- Batch embedding generation for better throughput
- Indexed queries for faster document retrieval

## Troubleshooting

### pgvector extension not found
```sql
CREATE EXTENSION vector;
```

### Vector dimension mismatch
Update `EMBEDDING_DIM` in `src/api/lib/embeddings-pgvector.ts` to match your model.

### Migration errors
Drop and recreate tables if needed:
```sql
DROP TABLE IF EXISTS embeddings CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TYPE IF EXISTS document_status;
```

Then run migrations again.

## Next Steps

1. Monitor embedding generation costs (OpenAI API)
2. Consider caching frequently accessed embeddings
3. Optimize chunk sizes based on your use case
4. Set up database backups for production


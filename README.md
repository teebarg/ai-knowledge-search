# AI Knowledge Search

Monorepo with:
- apps/web: TanStack Start (React + TanStack Router + TanStack Query) + Tailwind + shadcn/ui
- apps/api: Hono.js (Node.js) API for upload/embedding, semantic search, and chat

## Features
- Upload PDFs or paste text → extract, chunk, embed with Gemini
- Store vectors in Qdrant Cloud with metadata in Supabase
- Semantic search and context-aware chat over your knowledge
- Supabase Auth (email/Google)

## Prerequisites
- Node >= 18.17
- Supabase project (Auth + Storage)
- Qdrant Cloud cluster
- Gemini API key

## Environment
Create a `.env` at project root and in each app from `.env.example` files.

## Scripts
```bash
npm install
npm run dev        # runs web and api in dev (from each workspace)
npm run build
npm run start      # starts API
```

## High-level Flow
1. Users upload PDF or text
2. API extracts text (pdf-parse for PDFs)
3. Chunk into ~500–1000 tokens
4. Gemini embeddings created (text-embedding-004)
5. Upsert to Qdrant (cosine)
6. Metadata and file info saved to Supabase
7. Search → embed query → Qdrant top-k
8. Chat → augment prompt with retrieved chunks → stream Gemini response

## Notes
- Default embedding dimension is set to 768 for `text-embedding-004`
- Collection will be created on first use if missing


import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { prettyJSON } from 'hono/pretty-json';
import { env } from 'hono/adapter';
import { z } from 'zod';
import { streamTextFromGemini } from './lib/gemini.js';
import { ensureQdrantCollection, upsertEmbeddings, searchEmbeddings } from './lib/qdrant.js';
import { extractTextFromPdf } from './lib/pdf.js';
import { chunkText } from './lib/text.js';
import { embedTexts } from './lib/embeddings.js';
import { supabaseAdmin } from './lib/supabase.js';

const app = new Hono();
app.use('*', cors());
app.use('*', prettyJSON());

app.get('/health', (c) => c.json({ ok: true }));

app.post('/v1/upload', async (c) => {
  const { QDRANT_COLLECTION } = env(c);
  await ensureQdrantCollection(QDRANT_COLLECTION ?? 'ai_knowledge');

  const formData = await c.req.formData();
  const file = formData.get('file');
  const text = formData.get('text');
  const userId = formData.get('user_id');
  const title = formData.get('title') || 'Untitled';

  if (!userId || typeof userId !== 'string') {
    return c.json({ error: 'user_id required' }, 400);
  }

  let fullText = '';
  if (file && file instanceof File) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fullText = await extractTextFromPdf(buffer);

    // Upload raw file to Supabase storage
    await supabaseAdmin().storage
      .from(process.env.SUPABASE_BUCKET!)
      .upload(`${userId}/${Date.now()}-${typeof title === 'string' ? title : 'file'}.pdf`, buffer, {
        contentType: 'application/pdf',
        upsert: true,
      });
  } else if (text && typeof text === 'string') {
    fullText = text;
  } else {
    return c.json({ error: 'Provide file or text' }, 400);
  }

  const chunks = chunkText(fullText, 1600, 200);
  const embeddings = await embedTexts(chunks);
  await upsertEmbeddings(embeddings, chunks, userId, typeof title === 'string' ? title : 'Untitled');

  // Save metadata record
  await supabaseAdmin()
    .from('documents')
    .insert({ user_id: userId, title: typeof title === 'string' ? title : 'Untitled', chunks: chunks.length });

  return c.json({ ok: true, chunks: chunks.length });
});

app.post('/v1/search', async (c) => {
  const body = await c.req.json();
  const schema = z.object({ query: z.string(), user_id: z.string(), topK: z.number().optional() });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
  const { query, user_id, topK = 5 } = parsed.data;

  const queryVec = (await embedTexts([query]))[0];
  const results = await searchEmbeddings(queryVec, user_id, topK);
  return c.json({ results });
});

app.post('/v1/chat', async (c) => {
  const body = await c.req.json();
  const schema = z.object({ query: z.string(), user_id: z.string(), topK: z.number().optional() });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
  const { query, user_id, topK = 5 } = parsed.data;

  const queryVec = (await embedTexts([query]))[0];
  const context = await searchEmbeddings(queryVec, user_id, topK);

  const contextText = context
    .map((r) => `Title: ${r.payload.title}\nChunk: ${r.payload.text_chunk}`)
    .join('\n---\n');

  const prompt = `You are a helpful assistant. Use ONLY the context below to answer.\n\nContext:\n${contextText}\n\nQuestion: ${query}`;

  return streamTextFromGemini(c, prompt);
});

const port = Number(process.env.PORT || 8787);
export default {
  port,
  fetch: app.fetch,
};

if (process.env.NODE_ENV !== 'production') {
  // Node dev server
  const { serve } = await import('@hono/node-server');
  serve({ fetch: app.fetch, port });
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${port}`);
}


import { getGemini } from './gemini.js';

const EMBEDDING_MODEL = 'text-embedding-004';
export const EMBEDDING_DIM = 768; // as of text-embedding-004

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const genAI = getGemini();
  // @google/generative-ai embeddings API
  const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
  const vectors: number[][] = [];
  for (const text of texts) {
    const res = await model.embedContent({ content: { parts: [{ text }] } });
    const vec = res.embedding?.values as number[] | undefined;
    if (!vec) throw new Error('Embedding generation failed');
    vectors.push(vec);
  }
  return vectors;
}


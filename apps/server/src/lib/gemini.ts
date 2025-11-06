import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Context } from 'hono';

export const getGemini = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY missing');
  return new GoogleGenerativeAI(key);
};

export async function streamTextFromGemini(c: Context, prompt: string) {
  const genAI = getGemini();
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const streaming = await model.generateContentStream({ contents: [{ role: 'user', parts: [{ text: prompt }] }] });

  return c.stream(async (stream) => {
    for await (const chunk of streaming.stream) {
      const part = chunk.text();
      if (part) {
        await stream.write(part);
      }
    }
  }, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    },
  });
}


import { Hono } from "hono";
import { z } from "zod";

const schema = z.object({
  query: z.string().min(1),
});

export const searchRoute = new Hono();

searchRoute.post("/", async (c) => {
  const body = await c.req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const { query } = parsed.data;
  return c.json({ query, answer: `AI answer for: ${query}` });
});

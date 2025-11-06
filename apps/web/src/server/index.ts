import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { createRouterHandler } from "@tanstack/start/server";
import { router } from "../src/router"; // your TanStack router

const app = new Hono();

// ✅ API routes
app.get("/api/hello", (c) => {
  return c.json({ message: "Hello from Hono API 🚀" });
});

// ✅ Example AI route (for your knowledge search)
app.post("/api/search", async (c) => {
  const { query } = await c.req.json();
  // You could later connect this to a vector DB (like Qdrant, Pinecone, or Supabase Vector)
  return c.json({ results: [`Result for "${query}"`] });
});

// ✅ Attach TanStack Start SSR
app.all("*", async (c) => {
  const handler = createRouterHandler(router);
  return handler(c.req.raw);
});

// ✅ Run locally
const port = process.env.PORT || 3000;
serve({
  fetch: app.fetch,
  port: Number(port),
});

console.log(`🚀 Server running on http://localhost:${port}`);

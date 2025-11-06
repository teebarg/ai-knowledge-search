import { createStartServer } from "@tanstack/start/server";
import { Hono } from "hono";
import { handle } from "@hono/node-server";
import { logger } from "hono/logger";
import { cors } from "hono/cors";

import { healthRoute } from "./server/routes/health";
import { searchRoute } from "./server/routes/search";

export default createStartServer({
  async createApp() {
    const hono = new Hono();

    hono.use("*", logger());
    hono.use("*", cors());

    // Mount your API routes
    hono.route("/api/health", healthRoute);
    hono.route("/api/search", searchRoute);

    return {
      fetch: hono.fetch, // Hono handles all server requests
    };
  },
});

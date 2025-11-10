import "dotenv/config";
import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";

import { authMiddleware } from "@/api/middleware/auth.js";
import { errorHandler } from "@/api/middleware/error-handler.js";
import { documentRoutes } from "@/api/routes/document.routes";
import { searchRoutes } from "@/api/routes/search.routes";
import { chatRoutes } from "@/api/routes/chat.routes";
import { conversationRoutes } from "@/api/routes/conversation.routes";
import { settingsRoutes } from "@/api/routes/settings.routes";
import { profileRoutes } from "@/api/routes/profile.routes";

const port = Number(process.env.PORT || 8787);

const app = new OpenAPIHono();

// Apply middleware 
app.use("*", cors());
app.use("*", prettyJSON());
app.onError(errorHandler);

app.use("/v1/*", authMiddleware);


app.route("/v1", documentRoutes);
app.route("/v1", searchRoutes);
app.route("/v1", chatRoutes);
app.route("/v1", conversationRoutes);
app.route("/v1", settingsRoutes);
app.route("/v1", profileRoutes);

// OpenAPI documentation
app.doc("/doc", {
    openapi: "3.0.0",
    info: {
        title: "AI Knowledge Search API",
        version: "1.0.0",
    },
});

app.get("/ui", swaggerUI({ url: "/doc" }));

app.get("/", (c) => {
    return c.json({
        message: "Hello from Hono API!",
        docs: "/ui",
        openapi: "/doc",
    });
});

if (process.env.NODE_ENV !== "production") {
    const startDevServer = async () => {
        const { serve } = await import("@hono/node-server");
        serve(
            {
                fetch: app.fetch,
                port,
            },
            (info) => {
                console.log(`Server is running on http://localhost:${info.port}`);
            }
        );
    };

    startDevServer().catch(console.error);
}

export default app;

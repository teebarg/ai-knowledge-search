// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
// import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

// export default defineConfig({
//     plugins: [TanStackRouterVite(), react()],
//     server: {
//         port: 3000,
//         proxy: {
//             "/api": {
//                 target: "http://localhost:3001",
//                 changeOrigin: true,
//             },
//         },
//     },
// });

import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import viteReact from "@vitejs/plugin-react";

export default defineConfig({
    server: {
        port: 5173,
        proxy: {
            "/v1": {
                target: process.env.VITE_API_URL || "http://localhost:8787",
                changeOrigin: true,
            },
            "/health": {
                target: process.env.VITE_API_URL || "http://localhost:8787",
                changeOrigin: true,
            },
        },
    },
    plugins: [
        tsConfigPaths({
            projects: ["./tsconfig.json"],
        }),
        tanstackStart(),
        viteReact(),
    ],
});

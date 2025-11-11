/// <reference types="vite/client" />
import { HeadContent, Outlet, ScriptOnce, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import * as React from "react";
import type { QueryClient } from "@tanstack/react-query";
import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary";
import { NotFound } from "@/components/NotFound";
import appCss from "@/styles.css?url";
import { seo } from "@/utils/seo";
import { Toaster } from "sonner";
import { getStoredTheme, ThemeProvider } from "~/lib/ThemeProvider";

export const Route = createRootRouteWithContext<{
    queryClient: QueryClient;
}>()({
    head: () => ({
        meta: [
            {
                charSet: "utf-8",
            },
            {
                name: "viewport",
                content: "width=device-width, initial-scale=1",
            },
            ...seo({
                title: "AI Knowledge Search",
                description: `AI Knowledge Search is a type-safe, client-first, full-stack React framework. `,
            }),
        ],
        links: [
            { rel: "stylesheet", href: appCss },
            {
                rel: "apple-touch-icon",
                sizes: "180x180",
                href: "/apple-touch-icon.png",
            },
            {
                rel: "icon",
                type: "image/png",
                sizes: "32x32",
                href: "/favicon-32x32.png",
            },
            {
                rel: "icon",
                type: "image/png",
                sizes: "16x16",
                href: "/favicon-16x16.png",
            },
            { rel: "manifest", href: "/site.webmanifest", color: "#fffff" },
            { rel: "icon", href: "/favicon.ico" },
        ],
    }),
    loader: async () => ({ _storedTheme: await getStoredTheme() }),
    errorComponent: (props) => {
        return (
            <RootDocument>
                <DefaultCatchBoundary {...props} />
            </RootDocument>
        );
    },
    notFoundComponent: () => <NotFound />,
    component: RootComponent,
});

function RootComponent() {
    return (
        <RootDocument>
            <Outlet />
        </RootDocument>
    );
}

function RootDocument({ children }: { children: React.ReactNode }) {
    const { _storedTheme } = Route.useLoaderData();
    return (
        <html suppressHydrationWarning className="antialiased">
            <head>
                <HeadContent />
                <ScriptOnce
                    children={`
                    (function() {
                        const storedTheme = ${JSON.stringify(_storedTheme)};
                        if (storedTheme === 'system') {
                        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                        document.documentElement.className = systemTheme;
                        } else {
                        document.documentElement.className = storedTheme;
                        }
                    })();
                    `}
                />
            </head>
            <body className="min-h-screen bg-background text-foreground">
                <ThemeProvider initialTheme={_storedTheme}>
                    {children}
                    <TanStackRouterDevtools position="bottom-right" />
                    <ReactQueryDevtools buttonPosition="bottom-left" />
                    <Toaster closeButton richColors duration={3000} expand={false} position="top-right" />
                    <Scripts />
                </ThemeProvider>
            </body>
        </html>
    );
}

import { getSupabaseServerClient } from "~/lib/supabase/supabase";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

export const Route = createFileRoute("/auth/oauth")({
    preload: false,
    loader: (opts) => confirmFn({ data: opts.location.search }),
});

const confirmFn = createServerFn({ method: "GET" })
    .inputValidator((searchParams: unknown) => {
        if (searchParams && typeof searchParams === "object" && "code" in searchParams && "next" in searchParams) {
            return searchParams;
        }
        throw new Error("Invalid search params");
    })
    .handler(async (ctx: any) => {
        const request = getRequest();

        if (!request) {
            throw redirect({ to: `/auth/error`, search: { error: "No request" } });
        }

        const searchParams = ctx.data;
        const code = searchParams["code"] as string;
        const _next = (searchParams["next"] ?? "/") as string;
        const next = _next?.startsWith("/") ? _next : "/";

        if (code) {
            const supabase = getSupabaseServerClient();

            const { error } = await supabase.auth.exchangeCodeForSession(code);
            if (!error) {
                const { checkOnboardingStatus } = await import("~/lib/onboarding-utils");
                const { onboardingCompleted } = await checkOnboardingStatus();

                if (!onboardingCompleted) {
                    throw redirect({ to: "/onboarding" });
                }

                // redirect user to specified redirect URL or root of app
                throw redirect({ href: next });
            } else {
                // redirect the user to an error page with some instructions
                throw redirect({
                    to: `/auth/error`,
                    search: { error: error?.message },
                });
            }
        }

        // redirect the user to an error page with some instructions
        throw redirect({
            to: `/auth/error`,
            search: { error: "No code found" },
        });
    });

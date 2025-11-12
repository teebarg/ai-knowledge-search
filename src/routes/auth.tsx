import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { fetchUser } from "~/lib/supabase/fetch-user-server-fn";
import { checkOnboardingStatus } from "~/lib/onboarding-utils";

export const Route = createFileRoute("/auth")({
    component: RouteComponent,
    beforeLoad: async ({ context }) => {
        const user = await fetchUser();
        if (user) {
            const { onboardingCompleted } = await checkOnboardingStatus();
            if (!onboardingCompleted) {
                throw redirect({ to: "/onboarding" });
            }
            throw redirect({ to: "/account" });
        }
    },
});

function RouteComponent() {
    return <Outlet />;
}

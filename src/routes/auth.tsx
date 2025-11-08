import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { fetchUser } from "~/lib/supabase/fetch-user-server-fn";

export const Route = createFileRoute("/auth")({
    component: RouteComponent,
    beforeLoad: async ({ context }) => {
        const user = await fetchUser();
        if (user) {
            throw redirect({ to: "/account" });
        }
    },
});

function RouteComponent() {
    return <Outlet />;
}

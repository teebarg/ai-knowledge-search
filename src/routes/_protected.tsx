import { createFileRoute, Outlet } from "@tanstack/react-router";
import Auth from "~/components/Auth";
import { fetchUser } from "~/lib/supabase/fetch-user-server-fn";

export const Route = createFileRoute("/_protected")({
    component: ProtectedLayoutComponent,
    beforeLoad: async ({ context }) => {
        const user = await fetchUser();
        if (!user) {
            throw new Error("Not authenticated");
        }
        return {
            user,
        };
    },
    errorComponent: ({ error }) => {
        if (error.message === "Not authenticated") {
            return <Auth />;
        }

        throw error;
    },
});

function ProtectedLayoutComponent() {
    return <Outlet />;
}

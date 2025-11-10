import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "~/components/DashboardSidebar";
import { DashboardHeader } from "~/components/DashboardHeader";
import Auth from "~/components/Auth";
import { fetchUser } from "~/lib/supabase/fetch-user-server-fn";

export const Route = createFileRoute("/_protected")({
    component: PathlessLayoutComponent,
    beforeLoad: async ({ context }) => {
        const user = await fetchUser();
        console.log("🚀 ~ file: _protected.tsx:15 ~ user:", user?.id)
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

function PathlessLayoutComponent() {
    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full bg-gradient-subtle">
                <DashboardSidebar />
                <div className="flex-1 flex flex-col">
                    <DashboardHeader />
                    <main className="flex-1 p-4">
                        <Outlet />
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}

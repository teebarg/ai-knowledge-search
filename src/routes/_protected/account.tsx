import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "~/components/DashboardSidebar";
import { DashboardHeader } from "~/components/DashboardHeader";

export const Route = createFileRoute("/_protected/account")({
    component: RouteComponent,
    beforeLoad: async ({ context }) => {
        const onboardingCompleted = true;
        // const onboardingCompleted = localStorage.getItem("onboarding-completed");
        if (!onboardingCompleted) {
            throw redirect({ to: "/onboarding" });
        }
        return {
            meta: {
                beaf: 1,
            },
        };
    },
});

function RouteComponent() {
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

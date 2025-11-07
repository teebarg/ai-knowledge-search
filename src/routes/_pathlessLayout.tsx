import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "~/components/DashboardSidebar";
import { DashboardHeader } from "~/components/DashboardHeader";
import Auth from "~/components/Auth";

export const Route = createFileRoute("/_pathlessLayout")({
  component: PathlessLayoutComponent,
  beforeLoad: ({ context }) => {
    console.log("🚀 ~ file: _pathlessLayout.tsx:10 ~ context:", context)
    if (!context.user) {
      throw new Error("Not authenticated");
    }
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
          <main className="flex-1 p-6 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

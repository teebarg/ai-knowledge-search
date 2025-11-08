import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/auth")({
    component: RouteComponent,
    beforeLoad: ({ context }) => {
        if (context.user) {
            throw redirect({ to: "/account" });
        }
    },
});

function RouteComponent() {
    return <Outlet />;
}

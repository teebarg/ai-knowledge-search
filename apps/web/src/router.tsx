// import { createRouter } from "@tanstack/react-router";
// import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
// import * as TanstackQuery from "./integrations/tanstack-query/root-provider";

// import * as Sentry from "@sentry/tanstackstart-react";

// // Import the generated route tree
// import { routeTree } from "./routeTree.gen";

// // Create a new router instance
// export const getRouter = () => {
//   const rqContext = TanstackQuery.getContext();

//   const router = createRouter({
//     routeTree,
//     context: { ...rqContext },
//     defaultPreload: "intent",
//     Wrap: (props: { children: React.ReactNode }) => {
//       return (
//         <TanstackQuery.Provider {...rqContext}>
//           {props.children}
//         </TanstackQuery.Provider>
//       );
//     },
//   });

//   setupRouterSsrQueryIntegration({
//     router,
//     queryClient: rqContext.queryClient,
//   });

//   if (!router.isServer) {
//     Sentry.init({
//       dsn: import.meta.env.VITE_SENTRY_DSN,
//       integrations: [],
//     });
//   }

//   return router;
// };

import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { routeTree } from "./routeTree.gen";
import { DefaultCatchBoundary } from "./components/DefaultCatchBoundary";
import { NotFound } from "./components/NotFound";

export function getRouter() {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    defaultPreload: "intent",
    defaultErrorComponent: DefaultCatchBoundary,
    defaultNotFoundComponent: () => <NotFound />,
  });
  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}

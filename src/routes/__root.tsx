import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { AppProvider } from "@/lib/store";
import { EmergencyOverlay } from "@/components/EmergencyOverlay";

import appCss from "../styles.css?url";
import logoUrl from "../assets/logo.png";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Smart Campus Automation System" },
      { name: "description", content: "IoT-based smart campus management: RFID attendance, food optimization, rain detection." },
      { name: "author", content: "Smart Campus" },
      { property: "og:title", content: "Smart Campus Automation System" },
      { property: "og:description", content: "Smarter Campus • Better Future" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: logoUrl },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-6xl font-bold">404</h1>
        <p className="text-muted-foreground mt-2">Page not found</p>
        <a href="/" className="inline-block mt-4 px-4 py-2 rounded-md bg-primary text-primary-foreground">Go home</a>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => {
    console.error(error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="text-center max-w-md">
          <h1 className="text-xl font-semibold">Something went wrong</h1>
          <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
          <a href="/" className="inline-block mt-4 px-4 py-2 rounded-md bg-primary text-primary-foreground">Go home</a>
        </div>
      </div>
    );
  },
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <Outlet />
        <EmergencyOverlay />
        <Toaster position="top-right" richColors />
      </AppProvider>
    </QueryClientProvider>
  );
}

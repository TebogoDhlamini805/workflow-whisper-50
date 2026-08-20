import { Outlet, createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useSession } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { session, loading } = useSession();
  const navigate = useNavigate();
  const href = useRouterState({ select: (state) => state.location.href });

  useEffect(() => {
    if (!loading && !session) {
      navigate({ to: "/auth", search: { redirect: href }, replace: true });
    }
  }, [loading, session, navigate, href]);

  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-5 animate-spin text-muted-foreground" aria-label="Loading" />
      </div>
    );
  }

  return <Outlet />;
}

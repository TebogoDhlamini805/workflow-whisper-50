import { Outlet, createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { useSession } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { session, loading } = useSession();
  const navigate = useNavigate();
  const initialHref = useRouterState({ select: (state) => state.location.href });
  const target = useRef(initialHref);
  const sentRef = useRef(false);

  useEffect(() => {
    if (loading || session || sentRef.current) return;
    sentRef.current = true;
    const to = target.current.startsWith("/auth") ? "/" : target.current;
    navigate({ to: "/auth", search: { redirect: to }, replace: true });
  }, [loading, session, navigate]);

  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-5 animate-spin text-muted-foreground" aria-label="Loading" />
      </div>
    );
  }

  return <Outlet />;
}


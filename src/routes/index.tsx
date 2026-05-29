import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const { isAuthed, role } = useApp();
  useEffect(() => {
    if (!isAuthed) navigate({ to: "/login" });
    else if (role === "student") navigate({ to: "/student-dashboard" });
    else navigate({ to: "/dashboard" });
  }, [isAuthed, role, navigate]);
  return null;
}

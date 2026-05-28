import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const { isAuthed } = useApp();
  useEffect(() => {
    navigate({ to: isAuthed ? "/dashboard" : "/login" });
  }, [isAuthed, navigate]);
  return null;
}

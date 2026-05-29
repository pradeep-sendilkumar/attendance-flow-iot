import { useApp } from "@/lib/store";
import { Bell, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function NotificationBell({ className }: { className?: string }) {
  const {
    notifications,
    markNotificationRead,
    dismissNotification,
    markAllNotificationsRead,
  } = useApp();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className={cn("relative", className)}>
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-3 py-2 border-b">
          <span className="font-semibold text-sm">Notifications</span>
          {unread > 0 && (
            <button
              type="button"
              onClick={markAllNotificationsRead}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <Check className="h-3 w-3" /> Mark all read
            </button>
          )}
        </div>
        <div className="max-h-72 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No notifications</p>
          ) : (
            notifications.slice(0, 20).map((n) => (
              <div
                key={n.id}
                className={cn(
                  "px-3 py-2.5 border-b last:border-0 text-sm",
                  !n.read && "bg-primary/5",
                )}
              >
                <div className="flex justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{n.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2">{n.message}</div>
                    <div className="text-[10px] text-muted-foreground mt-1">
                      {new Date(n.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    {!n.read && (
                      <button
                        type="button"
                        onClick={() => markNotificationRead(n.id)}
                        className="p-1 rounded hover:bg-muted"
                        title="Mark read"
                      >
                        <Check className="h-3 w-3" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => dismissNotification(n.id)}
                      className="p-1 rounded hover:bg-muted"
                      title="Dismiss"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

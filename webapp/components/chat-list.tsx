"use client";

import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface ChatListProps {
  sessions: { session_id: string; created_at: string }[];
  isLoading: boolean;
}

export function ChatList({ sessions, isLoading }: ChatListProps) {
  const pathname = usePathname();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  // Ensure sessions is an array
  const sessionArray = Array.isArray(sessions) ? sessions : [];

  if (sessionArray.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
        <MessageSquare className="mb-2 h-8 w-8" />
        <p>No chats yet</p>
        <p className="text-sm">Start a new chat to begin</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 py-2">
      {sessionArray.map((session) => {
        const isActive = pathname === `/chats/${session.session_id}`;
        const timeAgo = formatDistanceToNow(new Date(session.created_at), {
          addSuffix: true,
        });

        return (
          <Link key={session.session_id} href={`/chats/${session.session_id}`}>
            <Button
              variant={isActive ? "secondary" : "ghost"}
              className="w-full justify-start text-left"
            >
              <div className="flex w-full flex-col overflow-hidden">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <span className="truncate">
                    Chat {session.session_id.slice(0, 8)}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">{timeAgo}</span>
              </div>
            </Button>
          </Link>
        );
      })}
    </div>
  );
}

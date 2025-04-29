import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageSquare, PlusCircle } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <MessageSquare className="h-10 w-10 text-muted-foreground" />
      </div>
      <h2 className="mt-6 text-2xl font-semibold">No chat selected</h2>
      <p className="mt-2 text-muted-foreground">
        Select an existing chat from the sidebar or start a new one
      </p>
      <div className="mt-8 flex items-center gap-4">
        <Link href="/chats">
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            New Chat
          </Button>
        </Link>
      </div>
    </div>
  );
}

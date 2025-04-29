"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, Menu, X } from "lucide-react";
import { ChatList } from "@/components/chat-list";
import { useMobile } from "@/hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";
import { API_URL } from "@/lib/utils";

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isMobile = useMobile();

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/chats`);
      if (!response.ok) throw new Error("Failed to fetch sessions");
      return response.json();
    },
  });

  // Close sidebar on mobile when navigating
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [pathname, isMobile]);

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between p-4">
        <h1 className="text-xl font-bold">Document Chat</h1>
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
      <div className="px-4 py-2">
        <Link href="/chats">
          <Button className="w-full justify-start gap-2">
            <PlusCircle className="h-4 w-4" />
            New Chat
          </Button>
        </Link>
      </div>
      <ScrollArea className="flex-1 px-4">
        <ChatList sessions={sessions} isLoading={isLoading} />
      </ScrollArea>
    </>
  );

  // Mobile sidebar with overlay
  if (isMobile) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          className="fixed left-4 top-4 z-40 md:hidden"
          onClick={() => setIsOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        {isOpen && (
          <div
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <div
              className="fixed left-0 top-0 h-full w-64 bg-background shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              {sidebarContent}
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop sidebar
  return (
    <div className="hidden w-64 flex-col border-r md:flex">
      {sidebarContent}
    </div>
  );
}

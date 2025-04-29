"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, FileText } from "lucide-react";
import { API_URL } from "@/lib/utils";

interface Message {
  question: string;
  answer: string;
}

interface SessionData {
  session_id: string;
  files: string[];
  messages: Message[];
}

export function ChatInterface({ sessionId }: { sessionId: string }) {
  const [question, setQuestion] = useState("");
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { data: sessionData, isLoading } = useQuery<SessionData>({
    queryKey: ["sessionData", sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      const response = await fetch(`${API_URL}/chats/${sessionId}`);
      if (!response.ok) throw new Error("Failed to fetch session data");
      return response.json();
    },
    enabled: !!sessionId,
  });

  const { isPending: isSending, mutate } = useMutation({
    mutationFn: async () => {
      if (!sessionId) throw new Error("Session ID is required");
      if (!question.trim()) throw new Error("Invalid input");

      const formData = new FormData();
      formData.append("question", question);

      const response = await fetch(`${API_URL}/chats/${sessionId}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to send message");

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["sessionData", sessionId],
      });
      setQuestion("");
    },
    onError: (error) => {
      console.error("Error sending message:", error);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessionData?.messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isSending) return;
    mutate();
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-semibold">Session not found</h2>
        <p className="mt-2 text-muted-foreground">
          The requested chat session could not be found
        </p>
        <Button className="mt-6" onClick={() => router.push("/chat")}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-medium">
            Chat Session {sessionData.session_id}
          </h2>
        </div>
        <ul className="mt-2 text-sm text-muted-foreground">
          {sessionData.files.map((file, index) => (
            <li key={index}>{file}</li>
          ))}
        </ul>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {sessionData.messages.map((message, index) => (
            <div key={index} className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  U
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p>{message.question}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                  AI
                </div>
                <div className="rounded-lg bg-secondary p-3">
                  <p className="whitespace-pre-wrap">{message.answer}</p>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question..."
            disabled={isSending}
            className="flex-1"
          />
          <Button type="submit" disabled={isSending || !question.trim()}>
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

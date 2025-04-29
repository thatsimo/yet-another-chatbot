"use client";

import type React from "react";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Loader2 } from "lucide-react";
import { API_URL } from "@/lib/utils";

export function NewChatForm() {
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createChatMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Invalid input");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/chats`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to create chat");

      return response.json();
    },
    onSuccess: (data) => {
      router.push(`/chats/${data.session_id}`);
    },
    onError: (error) => {
      console.error("Error creating chat:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || createChatMutation.isPending) return;
    createChatMutation.mutate();
  };

  return (
    <div className="flex h-full flex-col items-center justify-center p-6">
      <Card className="w-full max-w-md p-6">
        <h2 className="mb-6 text-center text-2xl font-bold">
          Start a New Chat
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Upload Document</label>
            <div
              className="flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed p-6 text-center"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileText className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">
                {file ? file.name : "Click to upload a document"}
              </p>
              <p className="text-xs text-muted-foreground">
                Supports PDF, Excel, and XML files
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.xls,.xlsx,.xml"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFile(e.target.files[0]);
                  }
                }}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!file || createChatMutation.isPending}
          >
            {createChatMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Start Chat
          </Button>
        </form>
      </Card>
    </div>
  );
}

import { ChatInterface } from "@/components/chat-interface";

export default function ChatSessionPage({
  params,
}: {
  params: { sessionId: string };
}) {
  return <ChatInterface sessionId={params.sessionId} />;
}

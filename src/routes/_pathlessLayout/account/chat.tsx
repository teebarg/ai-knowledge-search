import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Bot, User, FileText } from "lucide-react";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

export const Route = createFileRoute("/_pathlessLayout/account/chat")({
  component: RouteComponent,
});

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: string[];
}

function RouteComponent() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hi! I'm your AI assistant. Ask me anything about your documents and I'll help you find answers with citations from your knowledge base.",
    },
  ]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content:
        "Based on your documents, I found relevant information in the Q4 Business Report. The data shows significant growth in customer acquisition and retention metrics.",
      citations: [
        "Q4 Business Report.pdf - Page 12",
        "Product Roadmap.docx - Section 3",
      ],
    };

    setMessages([...messages, userMessage, assistantMessage]);
    setInput("");
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col max-w-5xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Chat with Your Knowledge</h1>
        <p className="text-muted-foreground">
          Have a conversation about your documents with AI-powered insights
        </p>
      </div>

      <Card className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${
                  message.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback
                    className={
                      message.role === "assistant" ? "bg-gradient-primary" : ""
                    }
                  >
                    {message.role === "assistant" ? (
                      <Bot className="h-5 w-5 text-primary-foreground" />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </AvatarFallback>
                </Avatar>

                <div
                  className={`flex-1 space-y-2 ${message.role === "user" ? "text-right" : ""}`}
                >
                  <Card
                    className={`inline-block p-4 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </Card>

                  {message.citations && (
                    <div className="inline-flex flex-col gap-2 items-start">
                      {message.citations.map((citation, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 px-3 py-2 bg-accent rounded-lg text-xs"
                        >
                          <FileText className="h-3 w-3 text-accent-foreground" />
                          <span className="text-accent-foreground">
                            {citation}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-6 border-t border-border">
          <div className="flex gap-2">
            <Input
              placeholder="Ask a question about your documents..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={!input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

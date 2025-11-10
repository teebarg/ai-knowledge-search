import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Bot, User, FileText, Loader2, Plus, MessageSquare, Trash2 } from "lucide-react";
import { useState, useEffect, useLayoutEffect, useRef } from "react";
import {
    chatWithKnowledge,
    listConversations,
    createConversation,
    deleteConversationApi,
    listConversationMessages,
    appendConversationMessage,
    updateConversationMessage,
    generateConversationTitle,
    type Conversation,
} from "@/lib/api";
import { toast } from "sonner";
import MarkdownUI from "~/components/ui/markdown";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Skeleton } from "~/components/ui/skeleton";

export const Route = createFileRoute("/_protected/account/chat")({
    component: RouteComponent,
});

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    citations?: string[];
}

function RouteComponent() {
    const { user } = useRouteContext({ from: "/_protected" });
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "assistant",
            content:
                "Hi! I'm your AI assistant. Ask me anything about your documents and I'll help you find answers with citations from your knowledge base.",
        },
    ]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentConversationId, setCurrentConversationId] = useState("");
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottomInstant = () => {
        const container = messagesContainerRef.current;
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    };

    const scrollToBottom = () => {
        requestAnimationFrame(() => {
            scrollToBottomInstant();
        });
    };

    useLayoutEffect(() => {
        scrollToBottomInstant();
    }, [messages]);

    useEffect(() => {
        scrollToBottom();
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const res = await listConversations();
                setConversations(res.conversations);
                if (res.conversations.length > 0) {
                    const first = res.conversations[0];
                    setCurrentConversationId(first.id);
                    const m = await listConversationMessages(first.id);
                    if (m.messages.length) {
                        setMessages(m.messages.map((mm) => ({ id: mm.id, role: mm.role, content: mm.content })));
                    }
                }
            } catch {
                // ignore
            }
        })();
    }, []);

    useEffect(() => {
        (async () => {
            if (!currentConversationId) return;
            try {
                const m = await listConversationMessages(currentConversationId);
                if (m.messages.length) {
                    setMessages(m.messages.map((mm) => ({ id: mm.id, role: mm.role, content: mm.content })));
                } else {
                    setMessages([
                        {
                            id: "welcome",
                            role: "assistant",
                            content:
                                "This conversation has no messages yet. Ask me anything about your documents and I'll help you find answers with citations from your knowledge base.",
                        },
                    ]);
                }
                requestAnimationFrame(() => {
                    requestAnimationFrame(scrollToBottomInstant);
                });
            } catch {
                // ignore
            }
        })();
    }, [currentConversationId]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const query = input.trim();
        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: query,
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        requestAnimationFrame(() => {
            requestAnimationFrame(scrollToBottomInstant);
        });

        const assistantMessageId = (Date.now() + 1).toString();
        const assistantMessage: Message = {
            id: assistantMessageId,
            role: "assistant",
            content: "",
        };
        setMessages((prev) => [...prev, assistantMessage]);

        let convId = currentConversationId;
        try {
            if (!convId) {
                const conv = await createConversation("New conversation");
                setConversations((prev) => [conv, ...prev]);
                setCurrentConversationId(conv.id);
                convId = conv.id;
            }
            await appendConversationMessage(convId, "user", query);
        } catch {
            // ignore
        }

        try {
            let fullResponse = "";
            let assistantSavedId: string | null = null;
            try {
                if (convId) {
                    const saved = await appendConversationMessage(convId, "assistant", "");
                    assistantSavedId = saved.id;
                }
            } catch {}

            // Throttle updates to every 500ms
            let lastFlush = 0;
            const flush = async (force = false) => {
                if (!assistantSavedId || !convId) return;
                const now = Date.now();
                if (!force && now - lastFlush < 500) return;
                lastFlush = now;
                try {
                    await updateConversationMessage(convId, assistantSavedId, fullResponse);
                } catch {}
            };

            await chatWithKnowledge(
                query,
                5,
                (chunk) => {
                    fullResponse += chunk;
                    setMessages((prev) => prev.map((msg) => (msg.id === assistantMessageId ? { ...msg, content: fullResponse } : msg)));
                    requestAnimationFrame(() => {
                        requestAnimationFrame(scrollToBottomInstant);
                    });
                    flush();
                },
                (error) => {
                    toast.error("Failed to get response: " + error.message);
                    setMessages((prev) =>
                        prev.map((msg) =>
                            msg.id === assistantMessageId
                                ? {
                                      ...msg,
                                      content: "Sorry, I encountered an error. Please try again.",
                                  }
                                : msg
                        )
                    );
                },
                convId || undefined
            );

            if (convId) {
                try {
                    if (assistantSavedId) {
                        await updateConversationMessage(convId, assistantSavedId, fullResponse);
                    } else {
                        await appendConversationMessage(convId, "assistant", fullResponse);
                    }
                    const current = conversations.find((c) => c.id === convId);
                    if (current && /^new conversation$/i.test(current.title)) {
                        const updated = await generateConversationTitle(convId);
                        setConversations((prev) => prev.map((c) => (c.id === convId ? updated : c)));
                    }
                } catch {}
            }
        } catch (error) {
            toast.error("Failed to send message: " + (error instanceof Error ? error.message : "Unknown error"));
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === assistantMessageId
                        ? {
                              ...msg,
                              content: "Sorry, I encountered an error. Please try again.",
                          }
                        : msg
                )
            );
        } finally {
            setIsLoading(false);
        }
    };

    const createNewConversation = async () => {
        try {
            const conv = await createConversation("New conversation");
            setConversations((prev) => [conv, ...prev]);
            setCurrentConversationId(conv.id);
            setMessages([
                {
                    id: "welcome",
                    role: "assistant",
                    content:
                        "New conversation started. Ask me anything about your documents and I'll help you find answers with citations from your knowledge base.",
                },
            ]);
        } catch {
            toast.error("Failed to create conversation");
        }
    };

    const deleteConversation = async (id: string) => {
        try {
            await deleteConversationApi(id);
            setConversations((prev) => prev.filter((c) => c.id !== id));
            if (currentConversationId === id) {
                const next = conversations.find((c) => c.id !== id);
                if (next) {
                    setCurrentConversationId(next.id);
                    const m = await listConversationMessages(next.id);
                    setMessages(m.messages.map((mm) => ({ id: mm.id, role: mm.role, content: mm.content })));
                } else {
                    setCurrentConversationId("");
                    setMessages([
                        {
                            id: "1",
                            role: "assistant",
                            content:
                                "Hi! I'm your AI assistant. Ask me anything about your documents and I'll help you find answers with citations from your knowledge base.",
                        },
                    ]);
                }
            }
        } catch {
            toast.error("Failed to delete conversation");
        }
    };

    return (
        <div className="h-[calc(100vh-7rem)] flex gap-6 max-w-7xl mx-auto animate-fade-in">
            <Card className="w-80 flex flex-col p-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-lg">Conversations</h2>
                    <Button size="sm" onClick={createNewConversation}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                <ScrollArea className="flex-1">
                    <div className="space-y-2">
                        {conversations.map((conv) => (
                            <div
                                key={conv.id}
                                className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${
                                    currentConversationId === conv.id ? "bg-primary/10 border border-primary/20" : "hover:bg-accent"
                                }`}
                                onClick={() => setCurrentConversationId(conv.id)}
                            >
                                <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{conv.title}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(conv.updated_at).toLocaleString()}</p>
                                </div>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 shrink-0"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteConversation(conv.id);
                                    }}
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </Card>
            <div className="flex-1 flex flex-col">
                <div className="mb-4">
                    <h1 className="text-2xl font-bold mb-1">Chat with Your Knowledge</h1>
                    <p className="text-muted-foreground">Have a conversation about your documents with AI-powered insights</p>
                </div>

                <Card className="flex-1 flex flex-col p-0 overflow-hidden min-h-0">
                    <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 min-h-0">
                        <div className="space-y-6">
                            {messages.map((message) => (
                                <div key={message.id} className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                                    <Avatar className="h-10 w-10 shrink-0">
                                        <AvatarFallback className={message.role === "assistant" ? "bg-gradient-primary" : ""}>
                                            {message.role === "assistant" ? (
                                                <Bot className="h-5 w-5 text-primary-foreground" />
                                            ) : (
                                                <User className="h-5 w-5" />
                                            )}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className={`flex-1 space-y-2 ${message.role === "user" ? "text-right" : ""}`}>
                                        <Card
                                            className={`inline-block p-4 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                                        >
                                            {message.role === "assistant" ? (
                                                message.content === "" ? (
                                                    <div className="space-y-2">
                                                        <Skeleton className="h-4 w-[250px]" />
                                                        <Skeleton className="h-4 w-[200px]" />
                                                    </div>
                                                ) : (
                                                    <MarkdownUI>{message.content}</MarkdownUI>
                                                )
                                            ) : (
                                                <p className="text-sm leading-relaxed">{message.content}</p>
                                            )}
                                        </Card>

                                        {message.citations && (
                                            <div className="inline-flex flex-col gap-2 items-start">
                                                {message.citations.map((citation, i) => (
                                                    <div key={i} className="flex items-center gap-2 px-3 py-2 bg-accent rounded-lg text-xs">
                                                        <FileText className="h-3 w-3 text-accent-foreground" />
                                                        <span className="text-accent-foreground">{citation}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 border-t border-border">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Ask a question about your documents..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                                className="flex-1"
                            />
                            <Button onClick={handleSend} disabled={!input.trim() || isLoading}>
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

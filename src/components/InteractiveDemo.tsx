import { MessageSquare, Send, Sparkles } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Badge } from "~/components/ui/badge";

export default function InteractiveDemo() {
    const [query, setQuery] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [messages, setMessages] = useState<Array<{ type: "user" | "ai"; text: string; sources?: string[] }>>([]);
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
        };
    }, []);

    const exampleQueries = ["What are our Q4 sales targets?", "Explain our security policy", "Show me the latest product roadmap"];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setMessages([...messages, { type: "user", text: query }]);
        setQuery("");
        setIsTyping(true);

        setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                {
                    type: "ai",
                    text: "Based on your knowledge base, Q4 sales targets are set at $2.5M with a focus on enterprise clients. The strategy includes expanding into the healthcare and finance sectors.",
                    sources: ["Q4-Strategy.pdf", "Sales-Plan-2024.docx", "Team-Meeting-Notes.txt"],
                },
            ]);
            setIsTyping(false);
        }, 1500);
    };

    const handleExampleClick = (example: string) => {
        setQuery(example);
    };

    return (
        <section ref={sectionRef} className="py-24">
            <div className="max-w-5xl mx-auto px-6">
                <div className="text-center mb-12">
                    <Badge variant="secondary" className="mb-4">
                        <MessageSquare className="h-3 w-3 mr-2" />
                        Interactive Demo
                    </Badge>
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">See it in action</h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Try asking a question to see how our AI instantly finds answers from your knowledge base.
                    </p>
                </div>

                <div
                    className={`bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transition-all duration-1000 ${
                        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
                    }`}
                >
                    <div className="bg-linear-to-r from-slate-900 to-slate-800 px-6 py-4 flex items-center gap-2">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <span className="ml-4 text-sm font-medium text-slate-300">AI Knowledge Search</span>
                    </div>

                    <div className="h-96 overflow-y-auto p-6 space-y-4 bg-background">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center">
                                <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                                    <Sparkles className="w-8 h-8" />
                                </div>
                                <p className="text-muted-foreground mb-6 text-center">Ask a question to get started</p>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {exampleQueries.map((example) => (
                                        <button
                                            key={example}
                                            onClick={() => handleExampleClick(example)}
                                            className="px-4 py-2 bg-white text-slate-700 rounded-lg text-sm border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                                        >
                                            {example}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <>
                                {messages.map((message, index) => (
                                    <div key={index} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                                        {message.type === "ai" && (
                                            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center mr-3 shrink-0">
                                                <Sparkles className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                        <div
                                            className={`max-w-lg rounded-2xl px-4 py-3 ${
                                                message.type === "user" ? "bg-slate-900 text-white" : "bg-white border border-slate-200"
                                            }`}
                                        >
                                            <p className={message.type === "user" ? "text-white" : "text-slate-800"}>{message.text}</p>
                                            {message.sources && (
                                                <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap gap-2">
                                                    {message.sources.map((source) => (
                                                        <span
                                                            key={source}
                                                            className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium"
                                                        >
                                                            {source}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {isTyping && (
                                    <div className="flex justify-start">
                                        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center mr-3">
                                            <Sparkles className="w-4 h-4" />
                                        </div>
                                        <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3">
                                            <div className="flex gap-1">
                                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                                <div
                                                    className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                                                    style={{ animationDelay: "0.1s" }}
                                                ></div>
                                                <div
                                                    className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                                                    style={{ animationDelay: "0.2s" }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="border-t border-slate-200 p-4 bg-white">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Ask anything about your knowledge base..."
                                className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                                type="submit"
                                className="px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors duration-200 flex items-center gap-2 font-medium"
                            >
                                <Send className="w-5 h-5" />
                                Send
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
}

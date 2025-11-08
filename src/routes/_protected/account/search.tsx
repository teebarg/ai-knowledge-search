import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Sparkles, FileText, ExternalLink } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_protected/account/search")({
    component: RouteComponent,
});

function RouteComponent() {
    const [query, setQuery] = useState("");
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = () => {
        if (query.trim()) {
            setHasSearched(true);
        }
    };

    const mockAnswer = `Based on your documents, the Q4 business report shows strong growth in the AI integration sector.
  The key findings indicate a 47% increase in user adoption and significant improvements in customer satisfaction metrics.`;

    const citations = [
        { title: "Q4 Business Report.pdf", page: "Page 12" },
        { title: "Product Roadmap.docx", page: "Section 3" },
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">AI-Powered Search</h1>
                <p className="text-muted-foreground">Ask anything about your documents in natural language</p>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Ask anything about your docs... e.g., `What were the main findings in Q4 report?`"
                    className="pl-12 pr-24 h-14 text-lg"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button className="absolute right-2 top-1/2 -translate-y-1/2" onClick={handleSearch} disabled={!query.trim()}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Search
                </Button>
            </div>

            {hasSearched && (
                <div className="grid lg:grid-cols-3 gap-6 animate-fade-up">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="p-8 border-2">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center shrink-0">
                                    <Sparkles className="h-4 w-4 text-primary-foreground" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-semibold mb-3">AI Answer</h2>
                                    <p className="text-foreground leading-relaxed">{mockAnswer}</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h3 className="font-semibold mb-4">Related Questions</h3>
                            <div className="space-y-2">
                                {["What contributed to the growth?", "How does this compare to Q3?", "What are the future projections?"].map(
                                    (q, i) => (
                                        <Button key={i} variant="ghost" className="w-full justify-start text-left" onClick={() => setQuery(q)}>
                                            <Search className="h-4 w-4 mr-2 shrink-0" />
                                            {q}
                                        </Button>
                                    )
                                )}
                            </div>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="p-6">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Sources & Citations
                            </h3>
                            <div className="space-y-3">
                                {citations.map((citation, i) => (
                                    <div key={i} className="p-3 rounded-lg bg-muted hover:bg-accent cursor-pointer transition-colors">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="font-medium text-sm mb-1">{citation.title}</p>
                                                <p className="text-xs text-muted-foreground">{citation.page}</p>
                                            </div>
                                            <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {!hasSearched && (
                <div className="grid md:grid-cols-2 gap-4 pt-8">
                    {[
                        "What are the key findings in the Q4 report?",
                        "Summarize the product roadmap",
                        "What were the main challenges mentioned?",
                        "Compare Q3 and Q4 performance",
                    ].map((example, i) => (
                        <Card
                            key={i}
                            className="p-4 cursor-pointer hover:shadow-md hover:border-primary/50 transition-all"
                            onClick={() => {
                                setQuery(example);
                                setHasSearched(true);
                            }}
                        >
                            <p className="text-sm text-muted-foreground">Try asking:</p>
                            <p className="font-medium mt-1">{example}</p>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

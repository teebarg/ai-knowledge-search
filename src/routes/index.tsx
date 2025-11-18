import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Upload, Sparkles, Zap, Shield, Brain, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import Features from "~/components/Features";
import InteractiveDemo from "~/components/InteractiveDemo";
import Pricing from "~/components/Pricing";
import Footer from "~/components/Footer";
import { Card } from "~/components/ui/card";
import TrustedBy from "~/components/TrustedBy";

export const Route = createFileRoute("/")({
    component: RouteComponent,
});

function RouteComponent() {
    const benefits = [
        { icon: Zap, text: "Lightning fast search" },
        { icon: Shield, text: "Secure & private" },
        { icon: Sparkles, text: "AI-powered insights" },
    ];

    const steps = [
        {
            icon: Upload,
            title: "Upload your knowledge base",
            description: "Connect Google Drive, Notion, or upload PDFs directly. All your data, one place.",
        },
        {
            icon: Brain,
            title: "Ask questions in natural language",
            description: "No complex queries needed. Just ask like you're talking to a colleague.",
        },
        {
            icon: CheckCircle2,
            title: "Get instant, cited answers",
            description: "Receive accurate responses with direct citations to source documents.",
        },
    ];

    const navigate = useNavigate();

    const handleGetStarted = () => {
        navigate({ to: "/auth" });
    };

    return (
        <div className="min-h-screen bg-gradient-subtle">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-6 w-6 text-primary" />
                        <span className="text-xl font-semibold">KnowledgeAI</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={handleGetStarted}>
                            Sign In
                        </Button>
                        <Button className="animate-scale-in cursor-pointer" onClick={handleGetStarted}>
                            Get Started
                        </Button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="container mx-auto px-4 pt-20 pb-32">
                <div className="max-w-4xl mx-auto text-center animate-fade-up">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/50 text-accent-foreground mb-8 animate-scale-in">
                        <Sparkles className="h-4 w-4" />
                        <span className="text-sm font-medium">Your knowledge, searchable by AI</span>
                    </div>

                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
                        Search Your Documents
                        <br />
                        <span className="bg-gradient-primary bg-clip-text text-transparent">With AI Power</span>
                    </h1>

                    <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                        Upload your documents and let AI understand them. Search naturally, get instant answers, and discover insights you never knew
                        existed.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                        <Button size="lg" className="text-lg" onClick={handleGetStarted}>
                            Try for Free
                        </Button>
                        <Button size="lg" variant="outline" className="text-lg">
                            Watch Demo
                        </Button>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                        {benefits.map((benefit, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <benefit.icon className="h-4 w-4 text-primary" />
                                <span>{benefit.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <TrustedBy />

            {/* How It Works Section */}
            <section className="container mx-auto px-4 py-32">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-20">
                        <Badge variant="secondary" className="mb-4">
                            <Clock className="h-3 w-3 mr-2" />
                            Get started in minutes
                        </Badge>
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">How it works</h2>
                        <p className="text-xl text-muted-foreground">Three simple steps to transform your knowledge management</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {steps.map((step, i) => (
                            <div key={i} className="relative animate-fade-in" style={{ animationDelay: `${i * 0.15}s` }}>
                                <div className="text-center">
                                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-primary mb-6 shadow-lg">
                                        <step.icon className="h-8 w-8 text-primary-foreground" />
                                    </div>
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                                        {i + 1}
                                    </div>
                                    <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                                    <p className="text-muted-foreground">{step.description}</p>
                                </div>
                                {i < steps.length - 1 && <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-border" />}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Features />

            <InteractiveDemo />

            <Pricing />

            <section className="container mx-auto px-4 pt-14 pb-32">
                <Card className="max-w-4xl mx-auto p-12 text-center bg-gradient-hero border-2 shadow-2xl animate-fade-up">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Ready to unlock your
                        <br />
                        <span className="bg-gradient-primary bg-clip-text text-transparent">knowledge potential?</span>
                    </h2>
                    <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Join thousands of teams who have transformed how they access and use their knowledge
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" className="text-lg h-14 px-8" onClick={() => navigate({ to: "/auth" })}>
                            Get Started — It's Free
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                        <Button size="lg" variant="outline" className="text-lg h-14 px-8">
                            View Demo
                        </Button>
                    </div>
                </Card>
            </section>

            <Footer />
        </div>
    );
}

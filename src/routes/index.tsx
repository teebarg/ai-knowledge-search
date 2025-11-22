import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Upload, Sparkles, Zap, Shield, Brain, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import Features from "~/components/Features";
import InteractiveDemo from "~/components/InteractiveDemo";
import Pricing from "~/components/Pricing";
import Footer from "~/components/Footer";
import TrustedBy from "~/components/TrustedBy";
import HeroNetworkGraph from "~/components/landing/HeroNetworkGraph";
import { motion } from "framer-motion";
import { fetchUser } from "~/lib/supabase/fetch-user-server-fn";

export const Route = createFileRoute("/")({
    component: RouteComponent,
    loader: async () => {
        const user = await fetchUser();
        const isAuthenticated = user !== null;
        return { isAuthenticated };
    },
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

    const { isAuthenticated } = Route.useLoaderData();

    const navigate = useNavigate();

    const handleGetStarted = () => {
        navigate({ to: "/auth" });
    };

    return (
        <div className="min-h-screen bg-gradient-subtle">
            <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-6 w-6 text-primary" />
                        <span className="text-xl font-semibold">KnowledgeAI</span>
                    </div>
                    {isAuthenticated ? (
                        <Button onClick={() => navigate({ to: "/account" })}>Dashboard</Button>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" onClick={handleGetStarted}>
                                Sign In
                            </Button>
                            <Button className="animate-scale-in cursor-pointer" onClick={handleGetStarted}>
                                Get Started
                            </Button>
                        </div>
                    )}
                </div>
            </header>

            <section className="relative container mx-auto px-4 pt-24 pb-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-hero opacity-50 blur-3xl" />
                <div className="relative max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left Column - Text Content */}
                        <div className="text-center lg:text-left animate-fade-up">
                            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium animate-scale-in">
                                <Sparkles className="h-3 w-3 mr-2" />
                                Trusted by 10,000+ teams worldwide
                            </Badge>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-6 leading-tight">
                                Search smarter.
                                <br />
                                <span className="bg-gradient-primary bg-clip-text text-transparent">Discover insights</span>
                                <br />
                                from your data.
                            </h1>

                            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
                                Connect your knowledge sources and let AI surface answers instantly. No more endless document hunting.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <Button size="lg" className="text-lg h-14 px-8 animate-fade-up" onClick={handleGetStarted}>
                                    Get Started Free
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                                <Button size="lg" variant="outline" className="text-lg h-14 px-8 animate-fade-up" style={{ animationDelay: "0.1s" }}>
                                    View Demo
                                </Button>
                            </div>
                        </div>

                        {/* Right Column - Network Graph */}
                        <div className="relative animate-fade-up" style={{ animationDelay: "0.2s" }}>
                            <HeroNetworkGraph />
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground mt-12">
                        {benefits.map((benefit, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <benefit.icon className="h-4 w-4 text-primary" />
                                <span>{benefit.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <motion.div
                    className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <div className="w-6 h-10 border-2 border-slate-400 rounded-full flex items-start justify-center p-2">
                        <motion.div
                            className="w-1 h-2 bg-slate-400 rounded-full"
                            animate={{ y: [0, 6, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    </div>
                </motion.div>
            </section>

            <TrustedBy />

            <section className="px-4 py-32 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-20">
                        <Badge variant="secondary" className="mb-4">
                            <Clock className="h-3 w-3 mr-2" />
                            Get started in minutes
                        </Badge>
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">How it works</h2>
                        <p className="text-xl text-slate-600">Three simple steps to transform your knowledge management</p>
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
                                    <h3 className="text-xl font-semibold mb-3 text-slate-900">{step.title}</h3>
                                    <p className="text-slate-600">{step.description}</p>
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

            <Footer />
        </div>
    );
}

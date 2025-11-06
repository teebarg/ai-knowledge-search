import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Upload,
  Search,
  MessageSquare,
  Sparkles,
  Zap,
  Shield,
} from "lucide-react";

export const Route = createFileRoute("/landing")({
  component: RouteComponent,
});

function RouteComponent() {
  const features = [
    {
      icon: Upload,
      title: "Upload Documents",
      description:
        "Drag and drop PDFs, docs, and more. Your knowledge base in seconds.",
    },
    {
      icon: Search,
      title: "Semantic AI Search",
      description:
        "Find exactly what you need with natural language queries powered by AI.",
    },
    {
      icon: MessageSquare,
      title: "Chat with Your Knowledge",
      description:
        "Have conversations with your documents. Get instant answers with citations.",
    },
  ];

  const benefits = [
    { icon: Zap, text: "Lightning fast search" },
    { icon: Shield, text: "Secure & private" },
    { icon: Sparkles, text: "AI-powered insights" },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold">AI Knowledge Search</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              // onClick={() => navigate("/auth")}
            >
              Sign In
            </Button>
            <Button
            // onClick={() => navigate("/auth")}
            >
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
            <span className="text-sm font-medium">
              Your knowledge, searchable by AI
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            Search Your Documents
            <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              With AI Power
            </span>
          </h1>

          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Upload your documents and let AI understand them. Search naturally,
            get instant answers, and discover insights you never knew existed.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              className="text-lg"
              // onClick={() => navigate("/auth")}
            >
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

      {/* Features Section */}
      <section className="container mx-auto px-4 pb-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to unlock your knowledge
            </h2>
            <p className="text-lg text-muted-foreground">
              Powerful features that make document search effortless
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <Card
                key={i}
                className="p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 animate-fade-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 pb-32">
        <Card className="max-w-4xl mx-auto p-12 text-center bg-gradient-hero border-2">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to transform your knowledge search?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of users who are already discovering insights faster
          </p>
          <Button
            size="lg"
            className="text-lg"
            // onClick={() => navigate("/auth")}
          >
            Start Free Trial
          </Button>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-semibold">AI Knowledge Search</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 AI Knowledge Search. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

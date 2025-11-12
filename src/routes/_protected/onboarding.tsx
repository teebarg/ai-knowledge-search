import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, Database, MessageSquare, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { getOnboardingStatusFn, updateOnboardingStepFn, completeOnboardingFn } from "~/lib/onboarding-server";
import { toast } from "sonner";

export const Route = createFileRoute("/_protected/onboarding")({
    component: RouteComponent,
});

interface OnboardingStep {
    title: string;
    description: string;
    icon: React.ReactNode;
    content: React.ReactNode;
}

function RouteComponent() {
    const navigate = useNavigate();
    const [direction, setDirection] = useState<"forward" | "backward">("forward");
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        const loadOnboardingStatus = async () => {
            try {
                const status = await getOnboardingStatusFn();
                setCurrentStep(status.onboardingStep);
            } catch (error) {
                console.error("Failed to load onboarding status:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadOnboardingStatus();
    }, []);

    const steps: OnboardingStep[] = [
        {
            title: "Welcome to Your AI Knowledge Hub",
            description: "Discover insights from your connected data sources with AI-powered intelligence",
            icon: <Brain className="h-10 w-10" />,
            content: (
                <div className="space-y-6">
                    <p className="text-lg text-foreground/80 leading-relaxed">
                        Transform how you interact with your documents. Our AI understands context, connects ideas, and delivers precise answers
                        instantly.
                    </p>
                    <div className="grid gap-4">
                        <div className="group flex items-start gap-4 p-4 rounded-xl bg-linear-to-br from-primary/10 to-primary/5 border border-primary/20 transition-all hover:border-primary/40">
                            <Sparkles className="h-6 w-6 text-primary mt-1 shrink-0" />
                            <div>
                                <p className="font-semibold text-foreground mb-1">Intelligent Understanding</p>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    AI that comprehends context and nuance, not just keywords
                                </p>
                            </div>
                        </div>
                        <div className="group flex items-start gap-4 p-4 rounded-xl bg-linear-to-br from-accent/10 to-accent/5 border border-accent/20 transition-all hover:border-accent/40">
                            <Database className="h-6 w-6 text-accent mt-1 shrink-0" />
                            <div>
                                <p className="font-semibold text-foreground mb-1">Unified Knowledge Base</p>
                                <p className="text-sm text-muted-foreground leading-relaxed">All your documents connected in one searchable hub</p>
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: "Connect Your Data Sources",
            description: "Build your intelligent knowledge base",
            icon: <Database className="h-10 w-10" />,
            content: (
                <div className="space-y-6">
                    <p className="text-lg text-foreground/80 leading-relaxed">
                        Import documents from multiple sources. Our AI will index and understand them, making every piece of information instantly
                        searchable.
                    </p>
                    <div className="space-y-3">
                        {[
                            { icon: "📄", title: "Documents", desc: "PDF, Word, Excel, PowerPoint" },
                            { icon: "🔗", title: "Integrations", desc: "Google Drive, Notion, Confluence" },
                            { icon: "📊", title: "Databases", desc: "SQL, NoSQL, APIs" },
                        ].map((source, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm hover:bg-card/80 transition-all"
                            >
                                <div className="text-3xl">{source.icon}</div>
                                <div className="flex-1">
                                    <p className="font-semibold text-foreground">{source.title}</p>
                                    <p className="text-sm text-muted-foreground">{source.desc}</p>
                                </div>
                                <CheckCircle2 className="h-5 w-5 text-primary/40" />
                            </div>
                        ))}
                    </div>
                </div>
            ),
        },
        {
            title: "AI-Powered Conversations",
            description: "Chat naturally with your knowledge base",
            icon: <MessageSquare className="h-10 w-10" />,
            content: (
                <div className="space-y-6">
                    <p className="text-lg text-foreground/80 leading-relaxed">
                        Ask questions in plain English. The AI understands intent, synthesizes information from multiple sources, and provides
                        detailed answers with sources.
                    </p>
                    <div className="space-y-4 p-5 rounded-2xl bg-linear-to-br from-card/80 to-muted/30 backdrop-blur-sm border border-border/50">
                        <div className="flex gap-4 items-start">
                            <div className="shrink-0 h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-xs font-medium text-muted-foreground">You</p>
                                <p className="text-sm text-foreground leading-relaxed">What are the main insights from our Q4 performance reports?</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="shrink-0 h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                <Brain className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-xs font-medium text-primary">AI Assistant</p>
                                <p className="text-sm text-foreground/90 leading-relaxed">
                                    Based on Q4 reports, revenue increased 23% YoY with strong growth in cloud services...
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: "You're All Set!",
            description: "Start discovering insights with AI",
            icon: <Sparkles className="h-10 w-10" />,
            content: (
                <div className="space-y-6">
                    <p className="text-lg text-foreground/80 leading-relaxed">
                        Your AI Knowledge Hub is ready. Upload your first documents and experience the power of intelligent search.
                    </p>
                    <div className="grid gap-3">
                        {[
                            { label: "Smart search enabled", gradient: "from-primary/20 to-primary/5" },
                            { label: "AI chat ready", gradient: "from-accent/20 to-accent/5" },
                            { label: "Data sources connected", gradient: "from-primary/20 to-primary/5" },
                        ].map((item, idx) => (
                            <div
                                key={idx}
                                className={`flex items-center gap-3 p-4 rounded-xl bg-linear-to-r ${item.gradient} border border-primary/20`}
                            >
                                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                                <p className="font-medium text-foreground">{item.label}</p>
                            </div>
                        ))}
                    </div>
                    <div className="p-5 rounded-xl bg-linear-to-br from-primary/10 via-accent/5 to-primary/10 border border-primary/20 text-center">
                        <p className="text-sm text-foreground/80 leading-relaxed">
                            💡 <span className="font-semibold">Pro tip:</span> Start with a few key documents to see how AI transforms your workflow
                        </p>
                    </div>
                </div>
            ),
        },
    ];

    const totalSteps = steps.length;
    const progress = ((currentStep + 1) / totalSteps) * 100;

    const handleNext = async () => {
        if (currentStep < totalSteps - 1) {
            const nextStep = currentStep + 1;
            setDirection("forward");
            setIsTransitioning(true);

            try {
                await updateOnboardingStepFn({ data: { step: nextStep } });
            } catch (error) {
                console.error("Failed to save onboarding step:", error);
                toast.error("Failed to save progress");
            }

            setTimeout(() => {
                setCurrentStep(nextStep);
                setIsTransitioning(false);
            }, 150);
        } else {
            handleComplete();
        }
    };

    const handleBack = async () => {
        if (currentStep > 0) {
            const prevStep = currentStep - 1;
            setDirection("backward");
            setIsTransitioning(true);

            try {
                await updateOnboardingStepFn({ data: { step: prevStep } });
            } catch (error) {
                console.error("Failed to save onboarding step:", error);
            }

            setTimeout(() => {
                setCurrentStep(prevStep);
                setIsTransitioning(false);
            }, 150);
        }
    };

    const handleComplete = async () => {
        try {
            await completeOnboardingFn({ data: { completed: true } });
            navigate({ to: "/account/documents" });
        } catch (error) {
            console.error("Failed to complete onboarding:", error);
            toast.error("Failed to complete onboarding. Please try again.");
        }
    };

    const handleSkip = () => {
        handleComplete();
    };

    if (isLoading) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center p-4 bg-linear-to-br from-background via-muted/10 to-background">
                <div className="text-muted-foreground">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-linear-to-br from-background via-muted/10 to-background relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
                <div
                    className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse"
                    style={{ animationDelay: "1s" }}
                />
            </div>
            <div className="w-full max-w-4xl relative z-10 animate-fade-in">
                <Card className="shadow-2xl border-border/50 backdrop-blur-sm bg-card/95">
                    <div className="space-y-6 p-8 md:p-12">
                        {/* Header with icon and title */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div
                                    key={`icon-${currentStep}`}
                                    className="p-3 rounded-2xl bg-linear-to-br from-primary/20 to-primary/10 border border-primary/20 animate-fade-in"
                                >
                                    {steps[currentStep].icon}
                                </div>
                                <div>
                                    <h2
                                        key={`title-${currentStep}`}
                                        className="text-3xl font-bold bg-linear-to-r from-foreground to-foreground/70 bg-clip-text animate-fade-in"
                                    >
                                        {steps[currentStep].title}
                                    </h2>
                                    <p
                                        key={`desc-${currentStep}`}
                                        className="text-base mt-2 text-muted-foreground animate-fade-in"
                                        style={{ animationDelay: "0.1s" }}
                                    >
                                        {steps[currentStep].description}
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleSkip}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Skip
                            </Button>
                        </div>

                        {/* Progress bar */}
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm font-medium">
                                <span className="text-muted-foreground">
                                    Step {currentStep + 1} of {totalSteps}
                                </span>
                                <span className="text-primary">{Math.round(progress)}% Complete</span>
                            </div>
                            <Progress value={progress} className="h-2.5 transition-all duration-500 ease-out" />
                        </div>

                        {/* Content area with slide animation */}
                        <div className="min-h-[340px] relative overflow-hidden">
                            <div
                                key={currentStep}
                                className={`
                  ${
                      isTransitioning
                          ? direction === "forward"
                              ? "animate-slide-out-left"
                              : "animate-slide-out-right"
                          : direction === "forward"
                            ? "animate-slide-in-right"
                            : "animate-slide-in-left"
                  }
                `}
                            >
                                {steps[currentStep].content}
                            </div>
                        </div>

                        {/* Navigation buttons */}
                        <div className="flex justify-between pt-6 border-t border-border/50">
                            <Button
                                variant="outline"
                                onClick={handleBack}
                                disabled={currentStep === 0}
                                size="lg"
                                className="min-w-[100px] transition-all hover:scale-105 disabled:hover:scale-100"
                            >
                                Back
                            </Button>
                            <Button onClick={handleNext} size="lg" className="min-w-[140px] gap-2 transition-all hover:scale-105">
                                {currentStep === totalSteps - 1 ? (
                                    <>
                                        Get Started
                                        <Sparkles className="h-4 w-4" />
                                    </>
                                ) : (
                                    <>
                                        Next
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

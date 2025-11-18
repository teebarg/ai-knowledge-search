import { Database, MessageCircle, Settings, BarChart3, Shield, Zap, Sparkles } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Badge } from "~/components/ui/badge";

export default function Features() {
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

    const features = [
        {
            icon: Database,
            title: "Multi-source indexing",
            description: "Connect unlimited data sources. Automatic syncing keeps everything up to date.",
            gradient: "from-blue-500 to-cyan-500",
        },
        {
            icon: MessageCircle,
            title: "Smart search & chat",
            description: "Natural language queries with conversational AI. Get contextual answers instantly.",
            gradient: "from-cyan-500 to-teal-500",
        },
        {
            icon: Settings,
            title: "Model preference",
            description: "Choose from OpenAI, Claude, or Gemini. Switch models based on your needs.",
            gradient: "from-teal-500 to-emerald-500",
        },
        {
            icon: Shield,
            title: "Secure workspaces",
            description: "Enterprise-grade security with SOC 2 compliance. Your data never leaves your control.",
            gradient: "from-emerald-500 to-green-500",
        },
        {
            icon: BarChart3,
            title: "Analytics dashboard",
            description: "Track usage patterns, popular queries, and team productivity metrics.",
            gradient: "from-green-500 to-blue-500",
        },
        {
            icon: Zap,
            title: "Lightning fast",
            description: "Sub-second response times with intelligent caching and vector search optimization.",
            gradient: "from-blue-500 to-violet-500",
        },
    ];

    return (
        <section ref={sectionRef} className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <Badge variant="secondary" className="mb-4">
                        <Sparkles className="h-3 w-3 mr-2" />
                        Powerful features
                    </Badge>
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Everything you need to search smarter</h2>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Powerful features designed for modern teams who value speed and accuracy.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={feature.title}
                                className={`group relative bg-white rounded-2xl p-8 border border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all duration-500 ${
                                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                                }`}
                                style={{ transitionDelay: `${index * 100}ms` }}
                            >
                                <div
                                    className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-4 transform group-hover:scale-110 transition-transform duration-300`}
                                >
                                    <Icon className="w-6 h-6 text-white" />
                                </div>

                                <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{feature.description}</p>

                                <div
                                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 -z-10`}
                                ></div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

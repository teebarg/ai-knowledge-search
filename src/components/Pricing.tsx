import { useNavigate } from "@tanstack/react-router";
import { Check, Sparkles, Zap } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Badge } from "~/components/ui/badge";

export default function Pricing() {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

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

    const plans = [
        {
            name: "Free",
            price: "0",
            description: "Perfect for trying out AI search",
            features: ["Up to 100 documents", "50 queries per month", "Basic search", "Email support", "1 data source"],
            cta: "Get Started",
            popular: false,
        },
        {
            name: "Pro",
            price: "29",
            description: "For individuals and small teams",
            features: [
                "Unlimited documents",
                "Unlimited queries",
                "Advanced AI search",
                "Priority support",
                "All data sources",
                "Custom models",
                "Analytics dashboard",
            ],
            cta: "Start Free Trial",
            popular: true,
        },
        {
            name: "Team",
            price: "99",
            description: "For growing organizations",
            features: [
                "Everything in Pro",
                "Unlimited team members",
                "Shared workspaces",
                "SSO & SAML",
                "Advanced security",
                "Custom integrations",
                "Dedicated support",
                "SLA guarantee",
            ],
            cta: "Contact Sales",
            popular: false,
        },
    ];

    const handleGetStarted = () => {
        navigate({ to: "/auth" });
    };

    return (
        <section ref={sectionRef} className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <Badge variant="secondary" className="mb-4">
                        <Zap className="h-3 w-3 mr-2" />
                        Simple pricing
                    </Badge>
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Simple, transparent pricing</h2>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">Start free and scale as you grow. No hidden fees, cancel anytime.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {plans.map((plan, index) => (
                        <div
                            key={plan.name}
                            className={`relative rounded-2xl p-8 transition-all duration-700 ${
                                plan.popular
                                    ? "bg-slate-900 text-white shadow-2xl scale-105 border-4 border-slate-900"
                                    : "bg-white border-2 border-slate-200 hover:border-slate-300 hover:shadow-lg"
                            } ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                            style={{ transitionDelay: `${index * 150}ms` }}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                    <div className="flex items-center gap-1 px-4 py-1 bg-linear-to-r from-blue-500 to-cyan-500 rounded-full text-white text-sm font-semibold shadow-lg">
                                        <Sparkles className="w-4 h-4" />
                                        Most Popular
                                    </div>
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? "text-white" : "text-slate-900"}`}>{plan.name}</h3>
                                <p className={`text-sm ${plan.popular ? "text-slate-300" : "text-slate-600"}`}>{plan.description}</p>
                            </div>

                            <div className="mb-6">
                                <div className="flex items-baseline gap-1">
                                    <span className={`text-5xl font-bold ${plan.popular ? "text-white" : "text-slate-900"}`}>${plan.price}</span>
                                    <span className={`text-lg ${plan.popular ? "text-slate-300" : "text-slate-600"}`}>/month</span>
                                </div>
                            </div>

                            <button
                                className={`w-full py-3 px-6 rounded-xl font-semibold mb-8 transition-all duration-200 cursor-pointer ${
                                    plan.popular
                                        ? "bg-white text-slate-900 hover:bg-slate-100 shadow-lg"
                                        : "bg-slate-900 text-white hover:bg-slate-800"
                                }`}
                                onClick={handleGetStarted}
                            >
                                {plan.cta}
                            </button>

                            <ul className="space-y-3">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3">
                                        <div className={`rounded-full p-1 ${plan.popular ? "bg-green-500/20" : "bg-green-100"} shrink-0`}>
                                            <Check className={`w-4 h-4 ${plan.popular ? "text-green-400" : "text-green-600"}`} />
                                        </div>
                                        <span className={`text-sm ${plan.popular ? "text-slate-200" : "text-slate-600"}`}>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <p className="text-slate-600 mb-6">All plans include 14-day free trial. No credit card required.</p>
                    <div className="flex flex-wrap justify-center gap-8 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            <span>SOC 2 Compliant</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            <span>GDPR Ready</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            <span>99.9% Uptime SLA</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

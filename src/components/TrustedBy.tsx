import LogosCarousel from "./LogosCarousel";

export default function TrustedBy() {
    const logos = ["OpenAI", "Google", "Vercel", "Anthropic", "Stripe"];

    const infiniteLogos = Array(6)
        .fill(null)
        .flatMap(() => logos);

    return (
        <section className="max-w-5xl mx-auto py-16">
            <div className="px-6 mb-8">
                <p className="text-center text-sm font-medium uppercase tracking-wider">Trusted by teams using</p>
            </div>

            <LogosCarousel logos={infiniteLogos} />

            {/* <div className="overflow-hidden">
                <div
                    className="flex gap-12 md:gap-6 whitespace-nowrap"
                    style={{
                        animation: "scroll-infinite 60s linear infinite",
                    }}
                >
                    {infiniteLogos.map((logo, index) => (
                        <div key={index} className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity flex-shrink-0">
                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                <span className="text-xl font-bold text-slate-700">{logo.icon}</span>
                            </div>
                            <span className="text-lg font-semibold text-slate-700">{logo.name}</span>
                        </div>
                    ))}
                </div>
            </div> */}
        </section>
    );
}

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

            <div className="overflow-hidden whitespace-nowrap fade-mask relative">
                <div className="inline-flex gap-6 animate-marquee">
                    {infiniteLogos.map((logo: string, idx: number) => (
                        <span key={idx} className="text-2xl font-semibold">
                            {logo}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
}

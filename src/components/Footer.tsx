import { Search, Github, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
    const links = {
        product: [
            { name: "Features", href: "#features" },
            { name: "Pricing", href: "#pricing" },
            { name: "Demo", href: "#demo" },
            { name: "Security", href: "#" },
        ],
        company: [
            { name: "About", href: "#" },
            { name: "Blog", href: "#" },
            { name: "Careers", href: "#" },
            { name: "Contact", href: "#" },
        ],
        resources: [
            { name: "Documentation", href: "#" },
            { name: "API Reference", href: "#" },
            { name: "Community", href: "#" },
            { name: "Support", href: "#" },
        ],
        legal: [
            { name: "Privacy", href: "#" },
            { name: "Terms", href: "#" },
            { name: "Cookie Policy", href: "#" },
        ],
    };

    return (
        <footer className="bg-slate-900 text-slate-300 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-12 mb-12">
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-linear-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
                                <Search className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white">KnowledgeAI</span>
                        </div>
                        <p className="text-slate-400 mb-6 leading-relaxed">
                            Transform your knowledge into instant, intelligent answers. Built for modern teams who need information at the speed of
                            thought.
                        </p>
                        <div className="flex gap-4">
                            <a
                                href="#"
                                className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors"
                            >
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors"
                            >
                                <Github className="w-5 h-5" />
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors"
                            >
                                <Linkedin className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4">Product</h4>
                        <ul className="space-y-3">
                            {links.product.map((link) => (
                                <li key={link.name}>
                                    <a href={link.href} className="hover:text-white transition-colors">
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4">Company</h4>
                        <ul className="space-y-3">
                            {links.company.map((link) => (
                                <li key={link.name}>
                                    <a href={link.href} className="hover:text-white transition-colors">
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4">Resources</h4>
                        <ul className="space-y-3">
                            {links.resources.map((link) => (
                                <li key={link.name}>
                                    <a href={link.href} className="hover:text-white transition-colors">
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4">Legal</h4>
                        <ul className="space-y-3">
                            {links.legal.map((link) => (
                                <li key={link.name}>
                                    <a href={link.href} className="hover:text-white transition-colors">
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-slate-400 text-sm">© 2025 KnowledgeAI. All rights reserved.</p>
                        <p className="text-slate-400 text-sm">Built with AI-first technology for the future of work</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

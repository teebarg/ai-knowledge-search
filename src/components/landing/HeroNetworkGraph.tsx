import { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3-force";
import { Database, FileText, Users, Cloud, Brain, Sparkles } from "lucide-react";

// Utility to convert HSL CSS variable to canvas-compatible color
const getCSSColor = (variableName: string, alpha: number = 1): string => {
    const root = document.documentElement;
    const hslValue = getComputedStyle(root).getPropertyValue(variableName).trim();

    if (!hslValue) return `rgba(99, 102, 241, ${alpha})`; // fallback

    // Parse HSL values (format: "243 75% 59%")
    const [h, s, l] = hslValue.split(" ").map((v) => parseFloat(v.replace("%", "")));

    // Convert HSL to RGB for canvas
    const hue = h / 360;
    const sat = s / 100;
    const light = l / 100;

    const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    };

    let r, g, b;
    if (sat === 0) {
        r = g = b = light;
    } else {
        const q = light < 0.5 ? light * (1 + sat) : light + sat - light * sat;
        const p = 2 * light - q;
        r = hue2rgb(p, q, hue + 1 / 3);
        g = hue2rgb(p, q, hue);
        b = hue2rgb(p, q, hue - 1 / 3);
    }

    return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${alpha})`;
};

interface Node {
    id: string;
    x: number;
    y: number;
    vx?: number;
    vy?: number;
    icon: typeof Database;
    label: string;
    type: "source" | "ai" | "output";
}

interface Link {
    source: string | Node;
    target: string | Node;
}

const HeroNetworkGraph = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
    const animationRef = useRef<number>(0);
    const simulationRef = useRef<d3.Simulation<Node, Link>>(null);

    const [colors, setColors] = useState({
        primary: "rgba(99,102,241,1)",
        primaryLight: "rgba(99,102,241,0.7)",
        primaryGlow: "rgba(99,102,241,0.4)",
        linkStart: "rgba(99,102,241,0.3)",
        linkEnd: "rgba(99,102,241,0.3)",
        foreground: "white",
    });

    useEffect(() => {
        setColors({
            primary: getCSSColor("--primary", 1),
            primaryLight: getCSSColor("--primary", 0.7),
            primaryGlow: getCSSColor("--primary", 0.4),
            linkStart: getCSSColor("--primary", 0.3),
            linkEnd: getCSSColor("--primary", 0.3),
            foreground: getCSSColor("--foreground", 1),
        });
    }, []);

    useEffect(() => {
        const updateDimensions = () => {
            // More responsive sizing for mobile
            const isMobile = window.innerWidth < 768;
            const width = isMobile ? Math.min(window.innerWidth * 0.9, 400) : Math.min(window.innerWidth * 0.45, 600);
            const height = isMobile ? width * 0.8 : width * 0.9;
            setDimensions({ width, height });
        };

        updateDimensions();
        window.addEventListener("resize", updateDimensions);
        return () => window.removeEventListener("resize", updateDimensions);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const { width, height } = dimensions;
        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        // Define nodes
        const nodes: Node[] = [
            { id: "drive", x: width * 0.2, y: height * 0.3, icon: Database, label: "Google Drive", type: "source" },
            { id: "notion", x: width * 0.2, y: height * 0.7, icon: FileText, label: "Notion", type: "source" },
            { id: "files", x: width * 0.3, y: height * 0.5, icon: Cloud, label: "Files", type: "source" },
            { id: "ai", x: width * 0.5, y: height * 0.5, icon: Brain, label: "AI Engine", type: "ai" },
            { id: "insights", x: width * 0.7, y: height * 0.3, icon: Sparkles, label: "Insights", type: "output" },
            { id: "answers", x: width * 0.7, y: height * 0.7, icon: Users, label: "Answers", type: "output" },
        ];

        // Define links
        const links: Link[] = [
            { source: "drive", target: "ai" },
            { source: "notion", target: "ai" },
            { source: "files", target: "ai" },
            { source: "ai", target: "insights" },
            { source: "ai", target: "answers" },
        ];

        // Create force simulation
        const simulation = d3
            .forceSimulation(nodes)
            .force(
                "link",
                d3
                    .forceLink(links)
                    .id((d: any) => d.id)
                    .distance(150)
                    .strength(0.5)
            )
            .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collision", d3.forceCollide().radius(60));

        simulationRef.current = simulation;

        const getNodeColor = (type: string) => {
            switch (type) {
                case "source":
                    return colors.primary;
                case "ai":
                    return colors.primary;
                case "output":
                    return colors.primaryLight;
                default:
                    return colors.primary;
            }
        };

        const drawNode = (node: Node) => {
            const radius = node.type === "ai" ? 35 : 28;

            // Outer glow
            const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius * 1.5);
            gradient.addColorStop(0, colors.primaryGlow);
            gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(node.x, node.y, radius * 1.5, 0, 2 * Math.PI);
            ctx.fill();

            // Node circle
            ctx.fillStyle = getNodeColor(node.type);
            ctx.beginPath();
            ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
            ctx.fill();

            // Inner circle
            ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
            ctx.beginPath();
            ctx.arc(node.x, node.y, radius * 0.7, 0, 2 * Math.PI);
            ctx.fill();

            // Label
            ctx.fillStyle = colors.foreground;
            ctx.font = "12px system-ui, -apple-system, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(node.label, node.x, node.y + radius + 18);
        };

        const drawLink = (link: Link) => {
            const source = link.source as Node;
            const target = link.target as Node;

            // Animated gradient
            const gradient = ctx.createLinearGradient(source.x, source.y, target.x, target.y);
            const offset = (Date.now() % 2000) / 2000;

            gradient.addColorStop(0, colors.linkStart);
            gradient.addColorStop(offset, colors.primary);
            gradient.addColorStop(1, colors.linkEnd);

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(source.x, source.y);
            ctx.lineTo(target.x, target.y);
            ctx.stroke();

            // Particles
            const particlePos = offset;
            const px = source.x + (target.x - source.x) * particlePos;
            const py = source.y + (target.y - source.y) * particlePos;

            ctx.fillStyle = colors.primary;
            ctx.beginPath();
            ctx.arc(px, py, 3, 0, 2 * Math.PI);
            ctx.fill();
        };

        const render = () => {
            ctx.clearRect(0, 0, width, height);

            // Draw links
            links.forEach(drawLink);

            // Draw nodes
            nodes.forEach(drawNode);

            animationRef.current = requestAnimationFrame(render);
        };

        simulation.on("tick", render);
        render();

        return () => {
            simulation.stop();
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [dimensions, colors]);

    return (
        <div className="relative w-full flex items-center justify-center">
            <canvas
                ref={canvasRef}
                className="rounded-2xl bg-linear-to-br from-background via-background to-primary/5 border-2 border-border/50 shadow-2xl backdrop-blur"
                style={{
                    maxWidth: "100%",
                    height: "auto",
                }}
            />
        </div>
    );
};

export default HeroNetworkGraph;

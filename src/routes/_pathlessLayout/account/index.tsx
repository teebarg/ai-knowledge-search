import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { FileText, Search, MessageSquare, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/_pathlessLayout/account/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate({ from: "/account" });
  const stats = [
    {
      label: "Total Documents",
      value: "24",
      icon: FileText,
      color: "text-primary",
    },
    {
      label: "Searches Today",
      value: "47",
      icon: Search,
      color: "text-secondary",
    },
    {
      label: "Chat Sessions",
      value: "12",
      icon: MessageSquare,
      color: "text-accent-foreground",
    },
    {
      label: "Insights Found",
      value: "156",
      icon: TrendingUp,
      color: "text-primary",
    },
  ];

  const quickActions = [
    {
      title: "Upload Documents",
      description: "Add new files to your knowledge base",
      path: "/account/documents",
    },
    {
      title: "Start Searching",
      description: "Find information instantly with AI",
      path: "/account/search",
    },
    {
      title: "Chat with AI",
      description: "Have a conversation about your docs",
      path: "/account/chat",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome Back!</h1>
        <p className="text-muted-foreground">
          Here's what's happening with your knowledge base today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card
            key={i}
            className="p-6 hover:shadow-md transition-all animate-scale-in"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {quickActions.map((action, i) => (
            <Card
              key={i}
              className="p-6 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all"
              onClick={() => navigate({ to: action.path, params: { id: 2 } })}
            >
              <h3 className="text-lg font-semibold mb-2">{action.title}</h3>
              <p className="text-sm text-muted-foreground">
                {action.description}
              </p>
            </Card>
          ))}
        </div>
      </div>

      <Card className="p-8 bg-gradient-hero border-2">
        <h2 className="text-2xl font-bold mb-2">Pro Tip</h2>
        <p className="text-muted-foreground">
          Try using natural language questions in search. Instead of keywords,
          ask "What were the main findings in last quarter's report?" for better
          results.
        </p>
      </Card>
    </div>
  );
}

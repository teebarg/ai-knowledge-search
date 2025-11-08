import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Key, Brain, LogOut } from "lucide-react";
import { logoutFn } from "~/lib/auth-server";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/_protected/account/settings")({
    component: RouteComponent,
});

function RouteComponent() {
    const navigate = useNavigate();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logoutFn();
            toast.success("Signed out");
            navigate({ to: "/" });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to sign out";
            toast.error(message);
        } finally {
            setIsLoggingOut(false);
        }
    };
    return (
        <div className="max-w-3xl space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold mb-2">Settings</h1>
                <p className="text-muted-foreground">Manage your account and AI preferences</p>
            </div>

            <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                    <User className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">Profile</h2>
                </div>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="you@example.com" />
                    </div>
                    <Button>Save Changes</Button>
                </div>
            </Card>

            <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                    <Key className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">API Keys</h2>
                </div>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="api-key">API Key</Label>
                        <div className="flex gap-2">
                            <Input id="api-key" type="password" placeholder="sk-••••••••••••••••" className="flex-1" />
                            <Button variant="outline">Regenerate</Button>
                        </div>
                        <p className="text-xs text-muted-foreground">Use this key to access your knowledge base via API</p>
                    </div>
                </div>
            </Card>

            <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                    <Brain className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">AI Model Preferences</h2>
                </div>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="model">Preferred AI Model</Label>
                        <Select defaultValue="gemini">
                            <SelectTrigger id="model">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="gemini">Google Gemini</SelectItem>
                                <SelectItem value="claude">Anthropic Claude</SelectItem>
                                <SelectItem value="gpt">OpenAI GPT</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">Choose the AI model for search and chat responses</p>
                    </div>
                </div>
            </Card>

            <Separator />

            <Card className="p-6 border-destructive/50">
                <div className="flex items-center gap-2 mb-4">
                    <LogOut className="h-5 w-5 text-destructive" />
                    <h2 className="text-xl font-semibold">Account Actions</h2>
                </div>
                <Button variant="destructive" onClick={handleLogout} disabled={isLoggingOut}>
                    {isLoggingOut ? "Signing out..." : "Log Out"}
                </Button>
            </Card>
        </div>
    );
}

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
import { useState, useEffect } from "react";
import { Switch } from "~/components/ui/switch";
import { getSettings, updateSettings, type Settings } from "~/lib/settings";
import { getProfile, updateProfile, type UserProfile } from "~/lib/profile";

export const Route = createFileRoute("/_protected/account/settings")({
    component: RouteComponent,
});

function RouteComponent() {
    const navigate = useNavigate();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [settings, setSettings] = useState<Settings>({
        useOwnKey: false,
        preferredModel: "gemini",
    });
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [apiKey, setApiKey] = useState("");

    // Load settings on mount
    useEffect(() => {
        const loadAll = async () => {
            try {
                const [settingsData, profileData] = await Promise.all([getSettings(), getProfile()]);
                setSettings(settingsData);
                setProfile(profileData);
                if (settingsData.apiKey) {
                    setApiKey("********");
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : "Failed to load settings";
                toast.error(message);
            } finally {
                setIsLoading(false);
            }
        };
        loadAll();
    }, []);

    const handleSaveProfile = async () => {
        if (!profile) return;
        try {
            const updatedProfile = await updateProfile({ name: profile.name });
            setProfile(updatedProfile);
            toast.success("Profile saved");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to save profile";
            toast.error(message);
        }
    };

    const handleApiKeyChange = (value: boolean) => {
        setSettings((prev) => ({ ...prev, useOwnKey: value }));
        if (!value) {
            setApiKey("");
            handleSaveApiKey("");
        }
    };

    const handleSaveApiKey = async (key: string = apiKey) => {
        try {
            const updatedSettings = await updateSettings({
                apiKey: key,
                useOwnKey: Boolean(key),
            });
            setSettings(updatedSettings);
            if (key) {
                toast.success("API key saved");
            } else {
                toast.success("API key removed");
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to save API key";
            toast.error(message);
        }
    };

    const handleModelChange = async (model: string) => {
        try {
            const updatedSettings = await updateSettings({ preferredModel: model });
            setSettings(updatedSettings);
            toast.success("Model preference saved");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to save model preference";
            toast.error(message);
        }
    };

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

    if (isLoading) {
        return <div>Loading...</div>;
    }

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
                        <Input
                            id="name"
                            placeholder="John Doe"
                            value={profile?.name || ""}
                            onChange={(e) => setProfile((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="you@example.com" readOnly value={profile?.email || ""} />
                    </div>
                    <Button onClick={handleSaveProfile}>Save Changes</Button>
                </div>
            </Card>

            <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                    <Key className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">API Keys</h2>
                </div>
                <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-0.5">
                            <Label htmlFor="use-own-key" className="text-base">
                                Use Your Own API Key
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                {settings.useOwnKey
                                    ? "Using your personal API key with no throttling"
                                    : "Using default key (rate limited to 10 requests/hour)"}
                            </p>
                        </div>
                        <Switch id="use-own-key" checked={settings.useOwnKey} onCheckedChange={handleApiKeyChange} />
                    </div>

                    {settings.useOwnKey && (
                        <div className="space-y-2 animate-fade-in">
                            <Label htmlFor="api-key">Your API Key</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="api-key"
                                    type="password"
                                    placeholder="sk-••••••••••••••••"
                                    className="flex-1"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                />
                                <Button variant="outline" onClick={() => handleSaveApiKey()}>
                                    Save
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">Your API key is encrypted and stored securely</p>
                        </div>
                    )}
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
                        <Select value={settings.preferredModel} onValueChange={handleModelChange}>
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

import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles } from "lucide-react";
import { loginGoogleFn } from "~/lib/auth-server";
import { LoginForm } from "./auth/LoginForm";
import { SignupForm } from "./auth/SignupForm";
import { MagicLinkForm } from "./auth/MagicLinkForm";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const GoogleButton = ({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled: boolean;
}) => (
  <Button
    type="button"
    variant="outline"
    className="w-full"
    onClick={onClick}
    disabled={disabled}
  >
    <GoogleIcon />
    Continue with Google
  </Button>
);

const Divider = () => (
  <div className="relative">
    <div className="absolute inset-0 flex items-center">
      <span className="w-full border-t" />
    </div>
    <div className="relative flex justify-center text-xs uppercase">
      <span className="bg-background px-2 text-muted-foreground">
        Or continue with
      </span>
    </div>
  </div>
);

export default function Auth() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback`
        : undefined;

    setIsLoading(true);
    toast.loading("Redirecting to Google...", { id: "google" });
    try {
      const result = await loginGoogleFn({
        data: {
          redirectTo,
        },
      });
      if (result?.url) {
        toast.success("Redirecting to Google sign-in...", { id: "google" });
        // Small delay to show success message before redirect
        setTimeout(() => {
          window.location.href = result.url;
        }, 300);
      } else {
        throw new Error("No redirect URL received");
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to start Google sign-in";
      toast.error(message || "Failed to connect to Google. Please try again.", {
        id: "google",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">AI Knowledge Search</span>
          </div>
          <p className="text-muted-foreground">
            Access your intelligent knowledge base
          </p>
        </div>

        <Card className="p-8 animate-scale-in">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
              <TabsTrigger value="magic">Magic Link</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <div className="space-y-4">
                <GoogleButton
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                />
                <Divider />
                <LoginForm
                  onGoogleSignIn={handleGoogleSignIn}
                  isLoading={isLoading}
                />
              </div>
            </TabsContent>

            <TabsContent value="signup">
              <div className="space-y-4">
                <GoogleButton
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                />
                <Divider />
                <SignupForm
                  onGoogleSignIn={handleGoogleSignIn}
                  isLoading={isLoading}
                />
              </div>
            </TabsContent>

            <TabsContent value="magic">
              <MagicLinkForm />
            </TabsContent>
          </Tabs>
        </Card>

        <div className="text-center mt-6">
          <Button variant="ghost" onClick={() => navigate({ to: "/" })}>
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}

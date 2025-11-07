import { redirect, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { getSupabaseServerClient } from "~/lib/supabase";
import { createServerFn } from "@tanstack/react-start";
import { getSupabaseClient } from "~/lib/supabase-client";

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

export const loginFn = createServerFn({ method: "POST" })
  .inputValidator(
    ({ email, password }: { email: string; password: string }) => ({
      email,
      password,
    })
  )
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      return {
        error: true,
        message: error.message,
      };
    }
  });

export const signupFn = createServerFn({ method: "POST" })
  .inputValidator(
    (d: { email: string; password: string; redirectUrl?: string }) => d
  )
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });
    if (error) {
      return {
        error: true,
        message: error.message,
      };
    }

    // Redirect to the prev page stored in the "redirect" search param
    throw redirect({
      href: data.redirectUrl || "/",
    });
  });

export const loginGoogleFn = createServerFn({ method: "POST" }).handler(
  async () => {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    if (error) {
      return {
        error: true,
        message: error.message,
      };
    }
  }
);

export const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    return {
      error: true,
      message: error.message,
    };
  }
});

export default function Auth() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const supabase = getSupabaseClient();

  const socialLoginMutation = useMutation({
    mutationFn: loginGoogleFn,
    onSuccess: () => {
      navigate({ to: "/account" });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const emailLoginMutation = useMutation({
    mutationFn: loginFn,
    onSuccess: () => {
      navigate({ to: "/account" });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const signupMutation = useMutation({
    mutationFn: signupFn,
    onSuccess: () => {
      navigate({ to: "/account" });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleAuth = async (type: "login" | "signup") => {
    setIsLoading(true);
    if (type === "login") {
      emailLoginMutation.mutate({
        data: { email: "you@example.com", password: "••••••••" },
      });
    }
    if (type === "signup") {
      signupMutation.mutate({
        data: { email: "you@example.com", password: "••••••••" },
      });
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    socialLoginMutation.mutate({});
  };

  const handleMagicLink = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithOtp({
      email: "teebarg01@gmail.com",
      options: {
        shouldCreateUser: true,
        emailRedirectTo: "http://localhost:5173/magic-link-callback",
      },
    });
    console.log(data, error);
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
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <GoogleIcon />
                  Continue with Google
                </Button>

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

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAuth("login");
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="signup">
              <div className="space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <GoogleIcon />
                  Continue with Google
                </Button>

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

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAuth("signup");
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="magic">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Enter your email and we'll send you a magic link to sign in
                  instantly.
                </p>
                <form onSubmit={handleMagicLink} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="magic-email">Email</Label>
                    <Input
                      id="magic-email"
                      name="magic-email"
                      type="email"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Sending link..." : "Send Magic Link"}
                  </Button>
                </form>
              </div>
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

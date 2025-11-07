import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getSupabaseClient } from "~/lib/supabase-client";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/auth/callback")({
  component: MagicLinkCallback,
});

function MagicLinkCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const supabase = getSupabaseClient();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check URL for tokens/code - check both hash fragments and query parameters
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const searchParams = new URLSearchParams(window.location.search);

        // Extract all possible parameters
        const tokenHash =
          hashParams.get("token_hash") || searchParams.get("token_hash");
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const code = searchParams.get("code");
        const hashError = hashParams.get("error");
        const queryError = searchParams.get("error");
        const errorDescription =
          hashParams.get("error_description") ||
          searchParams.get("error_description");

        // Check for errors first
        if (hashError || queryError) {
          setErrorMessage(
            errorDescription ||
              hashError ||
              queryError ||
              "Authentication failed"
          );
          setStatus("error");
          toast.error(
            errorDescription ||
              hashError ||
              queryError ||
              "Authentication failed"
          );
          return;
        }

        if (tokenHash) {
          const { data, error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: "email",
          });

          console.log("data", data);

          if (verifyError) {
            throw verifyError;
          }

          if (data.session) {
            await supabase.auth.setSession(data.session);
          }

          // Get the user to verify the session
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();

          console.log("user============================================================", user);

          if (userError || !user) {
            throw new Error("Failed to verify user session");
          }

          setStatus("success");
          toast.success("Successfully signed in! Redirecting...");

          // Clear URL to prevent re-processing
          // window.history.replaceState(null, "", window.location.pathname);

          // setTimeout(() => {
          //   navigate({ to: "/account" });
          // }, 1500);
          navigate({ to: "/account" });
          return;
        }

        // Check if already authenticated
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setStatus("success");
          toast.success("Already signed in! Redirecting...");
          setTimeout(() => {
            navigate({ to: "/account" });
          }, 1500);
        } else {
          setErrorMessage("No authentication data found in URL");
          setStatus("error");
          toast.error("Invalid callback. Please try signing in again.");
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "An error occurred during authentication";
        setErrorMessage(message);
        setStatus("error");
        toast.error(message);
      }
    };

    handleCallback();
  }, [navigate, supabase]);

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="p-8 max-w-md w-full text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">AI Knowledge Search</span>
        </div>

        {status === "loading" && (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">
              Verifying your authentication...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center mx-auto">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <p className="text-lg font-semibold">Authentication successful!</p>
            <p className="text-muted-foreground">
              Redirecting to your account...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-full bg-red-500 flex items-center justify-center mx-auto">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <p className="text-lg font-semibold text-destructive">
              Authentication failed
            </p>
            {errorMessage && (
              <p className="text-muted-foreground">{errorMessage}</p>
            )}
            <button
              onClick={() => navigate({ to: "/auth" })}
              className="text-primary hover:underline"
            >
              Return to sign in
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}

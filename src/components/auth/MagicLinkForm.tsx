import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseClient } from "~/lib/supabase/supabase-client";
import { credentialsSchema } from "~/lib/auth-server";
import { z } from "zod";
import { useLocation } from "@tanstack/react-router";

const magicLinkSchema = z.object({
    email: credentialsSchema.shape.email,
});

type MagicLinkFormData = z.infer<typeof magicLinkSchema>;

export function MagicLinkForm() {
    const location = useLocation();
    const supabase = getSupabaseClient();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<MagicLinkFormData>({
        resolver: zodResolver(magicLinkSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = async (data: MagicLinkFormData) => {
        const emailRedirectTo = typeof window !== "undefined" ? `${import.meta.env.VITE_SITE_URL}/auth/oauth?next=${location.pathname}` : undefined;

        toast.loading("Sending magic link...", { id: "magic" });
        try {
            const { error } = await supabase.auth.signInWithOtp({
                email: data.email,
                options: {
                    shouldCreateUser: true,
                    emailRedirectTo,
                },
            });

            if (error) {
                throw error;
            }

            toast.success("Magic link sent! Please check your inbox and click the link to sign in.", { id: "magic", duration: 6000 });
            reset();
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to send magic link";
            toast.error(message || "Unable to send magic link. Please try again.", { id: "magic" });
        }
    };

    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center mb-4">Enter your email and we'll send you a magic link to sign in instantly.</p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="magic-email">Email</Label>
                    <Input
                        id="magic-email"
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        disabled={isSubmitting}
                        {...register("email")}
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Sending link..." : "Send Magic Link"}
                </Button>
            </form>
        </div>
    );
}

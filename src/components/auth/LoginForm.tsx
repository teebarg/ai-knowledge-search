import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginFn, credentialsSchema } from "~/lib/auth-server";

interface LoginFormProps {
    isLoading: boolean;
}

type LoginFormData = {
    email: string;
    password: string;
};

export function LoginForm({ isLoading }: LoginFormProps) {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<LoginFormData>({
        resolver: zodResolver(credentialsSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (data: LoginFormData) => {
        toast.loading("Signing in...", { id: "login" });
        try {
            await loginFn({
                data: {
                    email: data.email,
                    password: data.password,
                },
            });
            toast.success("Welcome back! Redirecting...", { id: "login" });
            reset();

            const { getOnboardingStatusFn } = await import("~/lib/onboarding-server");
            try {
                const status = await getOnboardingStatusFn();
                setTimeout(() => {
                    if (!status.onboardingCompleted) {
                        navigate({ to: "/onboarding" });
                    } else {
                        navigate({ to: "/account" });
                    }
                }, 500);
            } catch {
                setTimeout(() => {
                    navigate({ to: "/onboarding" });
                }, 500);
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to sign in";
            toast.error(message || "Invalid email or password. Please try again.", {
                id: "login",
            });
        }
    };

    return (
        <div className="space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        disabled={isSubmitting || isLoading}
                        {...register("email")}
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        disabled={isSubmitting || isLoading}
                        {...register("password")}
                    />
                    {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting || isLoading}>
                    {isSubmitting ? "Signing in..." : "Sign In"}
                </Button>
            </form>
        </div>
    );
}

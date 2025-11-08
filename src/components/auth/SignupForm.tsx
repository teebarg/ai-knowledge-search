import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signupFn, credentialsSchema } from "~/lib/auth-server";
import { z } from "zod";

interface SignupFormProps {
    isLoading: boolean;
}

// Form schema requires fullName, but server accepts it as optional
const signupFormSchema = credentialsSchema.extend({
    fullName: z.string().min(1, "Please enter your full name"),
});

type SignupFormData = z.infer<typeof signupFormSchema>;

export function SignupForm({ isLoading }: SignupFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<SignupFormData>({
        resolver: zodResolver(signupFormSchema),
        defaultValues: {
            email: "",
            password: "",
            fullName: "",
        },
    });

    const onSubmit = async (data: SignupFormData) => {
        toast.loading("Creating your account...", { id: "signup" });
        try {
            const redirectUrl = typeof window !== "undefined" ? `${window.location.origin}/auth` : undefined;

            await signupFn({
                data: {
                    email: data.email,
                    password: data.password,
                    redirectUrl,
                    fullName: data.fullName?.trim() || undefined,
                },
            });

            toast.success("Account created! Please check your email to confirm your account.", { id: "signup", duration: 5000 });
            reset();
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to create account";
            toast.error(message || "Something went wrong. Please try again later.", { id: "signup" });
        }
    };

    return (
        <div className="space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                        id="signup-name"
                        type="text"
                        placeholder="John Doe"
                        autoComplete="name"
                        disabled={isSubmitting || isLoading}
                        {...register("fullName")}
                    />
                    {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        disabled={isSubmitting || isLoading}
                        {...register("email")}
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        autoComplete="new-password"
                        disabled={isSubmitting || isLoading}
                        {...register("password")}
                    />
                    {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting || isLoading}>
                    {isSubmitting ? "Creating account..." : "Create Account"}
                </Button>
            </form>
        </div>
    );
}

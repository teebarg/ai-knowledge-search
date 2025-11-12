import { getSupabaseServerClient } from "~/lib/supabase/supabase";
import { db } from "@/api/db";
import { users } from "@/api/db/schema";
import { eq } from "drizzle-orm";
import { createServerFn } from "@tanstack/react-start";

export const checkOnboardingStatus: () => Promise<{ onboardingCompleted: boolean; onboardingStep: number; }> = createServerFn({
    method: 'GET',
}).handler(async () => {
    const supabase = getSupabaseServerClient()
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        return {
            onboardingCompleted: false,
            onboardingStep: 0,
        };
    }

    const dbUser = await db.select().from(users).where(eq(users.id, user.id));

    if (!dbUser[0]) {
        return {
            onboardingCompleted: false,
            onboardingStep: 0,
        };
    }

    return {
        onboardingCompleted: dbUser[0].onboardingCompleted ?? false,
        onboardingStep: dbUser[0].onboardingStep ?? 0,
    };
})

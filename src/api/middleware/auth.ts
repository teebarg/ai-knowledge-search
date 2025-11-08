import { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client for JWT verification
 */
function getSupabaseForAuth() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY must be set for authentication");
    }
    
    return createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });
}

/**
 * Extract JWT token from Authorization header
 */
function extractToken(c: Context): string | null {
    const authHeader = c.req.header("Authorization");
    if (!authHeader) return null;
    
    // Support both "Bearer <token>" and just "<token>"
    if (authHeader.startsWith("Bearer ")) {
        return authHeader.substring(7);
    }
    return authHeader;
}

/**
 * Authentication middleware for Hono
 * Verifies Supabase JWT token and adds user info to context
 * 
 * Usage:
 * app.use("/v1/*", authMiddleware);
 * 
 * Or for specific routes:
 * app.post("/v1/upload", authMiddleware, async (c) => { ... });
 */
export async function authMiddleware(c: Context, next: Next) {
    try {
        const token = extractToken(c);
        
        if (!token) {
            throw new HTTPException(401, {
                message: "Authorization token required",
            });
        }

        const supabase = getSupabaseForAuth();
        
        // Verify the JWT token
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            throw new HTTPException(401, {
                message: "Invalid or expired token",
            });
        }

        // Add user info to context
        c.set("user", {
            id: user.id,
            email: user.email,
            user_metadata: user.user_metadata,
        });

        await next();
    } catch (error) {
        if (error instanceof HTTPException) {
            throw error;
        }
        
        console.error("Auth middleware error:", error);
        throw new HTTPException(401, {
            message: "Authentication failed",
        });
    }
}

/**
 * Optional authentication middleware
 * Adds user to context if token is present, but doesn't require it
 * Useful for routes that work with or without authentication
 */
export async function optionalAuthMiddleware(c: Context, next: Next) {
    try {
        const token = extractToken(c);
        
        if (token) {
            const supabase = getSupabaseForAuth();
            const { data: { user }, error } = await supabase.auth.getUser(token);

            if (!error && user) {
                c.set("user", {
                    id: user.id,
                    email: user.email,
                    user_metadata: user.user_metadata,
                });
            }
        }
    } catch (error) {
        // Silently fail for optional auth
        console.warn("Optional auth failed:", error);
    }

    await next();
}

/**
 * Get authenticated user from context
 * Throws if user is not authenticated
 */
export function getAuthenticatedUser(c: Context) {
    const user = c.get("user");
    if (!user) {
        throw new HTTPException(401, {
            message: "User not authenticated",
        });
    }
    return user;
}

/**
 * Type definition for authenticated context
 */
export type AuthenticatedContext = Context & {
    get: (key: "user") => {
        id: string;
        email?: string;
        user_metadata?: Record<string, any>;
    };
};


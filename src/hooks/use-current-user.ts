import { useEffect, useState } from "react";
import { getSupabaseClient } from "~/lib/supabase/supabase-client";

export const useCurrentUser = () => {
    const [name, setName] = useState<string | null>(null);
    const [image, setImage] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfileName = async () => {
            const { data, error } = await getSupabaseClient().auth.getSession();
            if (error) {
                console.error(error);
            }

            setName(data.session?.user.user_metadata.full_name ?? "?");
            setImage(data.session?.user.user_metadata.avatar_url ?? null);
        };

        fetchProfileName();
    }, []);

    return {
        name: name || "?",
        image: image || "",
    };
};

"use client";

import { useCurrentUser } from "@/hooks/use-current-user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const CurrentUserAvatar = () => {
    const { name, image } = useCurrentUser();
    const initials = name
        ?.split(" ")
        ?.map((word: string) => word[0])
        ?.join("")
        ?.toUpperCase();

    return (
        <Avatar>
            {image && <AvatarImage src={image} alt={initials} />}
            <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
    );
};

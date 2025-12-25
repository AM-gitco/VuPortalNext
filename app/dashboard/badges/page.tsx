"use client";

import { Badges } from "@/components/dashboard/Badges";
import { useAuth } from "@/hooks/useAuth";

export default function BadgesPage() {
    const { user } = useAuth();
    return <Badges user={user} />;
}

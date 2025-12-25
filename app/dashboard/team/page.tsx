"use client";

import { OurTeam } from "@/components/dashboard/OurTeam";
import { useAuth } from "@/hooks/useAuth";

export default function TeamPage() {
    const { user } = useAuth();
    return <OurTeam user={user} />;
}

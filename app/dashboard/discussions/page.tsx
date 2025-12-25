"use client";

import { Discussions } from "@/components/dashboard/Discussions";
import { useAuth } from "@/hooks/useAuth";

export default function DiscussionsPage() {
    const { user } = useAuth();
    return <Discussions user={user} />;
}

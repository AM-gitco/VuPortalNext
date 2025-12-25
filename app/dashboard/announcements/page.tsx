"use client";

import { Announcements } from "@/components/dashboard/Announcements";
import { useAuth } from "@/hooks/useAuth";

export default function AnnouncementsPage() {
    const { user } = useAuth();
    return <Announcements user={user} />;
}

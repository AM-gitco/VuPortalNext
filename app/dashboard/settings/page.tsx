"use client";

import { SettingsPage } from "@/components/dashboard/SettingsPage";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function SettingsSegment() {
    const { user } = useAuth();
    const router = useRouter();

    const handlePageChange = (page: string) => {
        router.push(`/dashboard/${page}`);
    };

    return <SettingsPage user={user} onPageChange={handlePageChange} />;
}

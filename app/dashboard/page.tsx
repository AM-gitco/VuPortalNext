"use client";

import { DashboardHome } from "@/components/dashboard/DashboardHome";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const { user } = useAuth();
    const router = useRouter();

    const handlePageChange = (page: string) => {
        router.push(`/dashboard/${page}`);
    };

    return <DashboardHome user={user} onPageChange={handlePageChange} />;
}

"use client";

import { Resources } from "@/components/dashboard/Resources";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function ResourcesPage() {
    const { user } = useAuth();
    const router = useRouter();

    const handlePageChange = (page: string) => {
        router.push(`/dashboard/${page}`);
    };

    return <Resources user={user} onPageChange={handlePageChange} />;
}

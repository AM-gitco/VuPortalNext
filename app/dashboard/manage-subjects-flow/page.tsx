"use client";

import { ManageSubjectsFlow } from "@/components/dashboard/ManageSubjectsFlow";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function ManageSubjectsPage() {
    const { user } = useAuth();
    const router = useRouter();

    const handlePageChange = (page: string) => {
        router.push(`/dashboard/${page}`);
    };

    return <ManageSubjectsFlow user={user} onPageChange={handlePageChange} />;
}

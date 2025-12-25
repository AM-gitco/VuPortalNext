"use client";

import { UpdateProfileFlow } from "@/components/dashboard/UpdateProfileFlow";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function UpdateProfilePage() {
    const { user } = useAuth();
    const router = useRouter();

    const handlePageChange = (page: string) => {
        router.push(`/dashboard/${page}`);
    };

    return <UpdateProfileFlow user={user} onPageChange={handlePageChange} />;
}

"use client";

import { MySubjects } from "@/components/dashboard/MySubjects";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function SubjectsPage() {
    const { user } = useAuth();
    const router = useRouter();

    const handlePageChange = (page: string) => {
        router.push(`/dashboard/${page}`);
    };

    return <MySubjects user={user} onPageChange={handlePageChange} />;
}

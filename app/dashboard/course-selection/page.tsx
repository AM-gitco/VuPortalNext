"use client";

import { CourseSelection } from "@/components/dashboard/CourseSelection";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function CourseSelectionPage() {
    const { user } = useAuth();
    const router = useRouter();

    const handlePageChange = (page: string) => {
        router.push(`/dashboard/${page}`);
    };

    return <CourseSelection user={user} onPageChange={handlePageChange} />;
}

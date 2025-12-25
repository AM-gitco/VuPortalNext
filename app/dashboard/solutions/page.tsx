"use client";

import { Solutions } from "@/components/dashboard/Solutions";
import { useAuth } from "@/hooks/useAuth";

export default function SolutionsPage() {
    const { user } = useAuth();
    return <Solutions user={user} />;
}

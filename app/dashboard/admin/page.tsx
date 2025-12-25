"use client";

import { AdminPanel } from "@/components/dashboard/AdminPanel";
import { useAuth } from "@/hooks/useAuth";
import { redirect } from "next/navigation";

export default function AdminPage() {
    const { user, isLoading } = useAuth();

    if (!isLoading && user?.role !== "admin") {
        redirect("/dashboard");
    }

    return <AdminPanel user={user} />;
}

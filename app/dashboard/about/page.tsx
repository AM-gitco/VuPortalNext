"use client";

import { About } from "@/components/dashboard/About";
import { useAuth } from "@/hooks/useAuth";

export default function AboutPage() {
    const { user } = useAuth();
    return <About user={user} />;
}

"use client";

import { AIChat } from "@/components/dashboard/AIChat";
import { useAuth } from "@/hooks/useAuth";

export default function AIChatPage() {
    const { user } = useAuth();
    return <AIChat user={user} />;
}

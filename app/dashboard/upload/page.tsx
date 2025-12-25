"use client";

import { UploadArea } from "@/components/dashboard/UploadArea";
import { useAuth } from "@/hooks/useAuth";

export default function UploadsPage() {
    const { user } = useAuth();
    return <UploadArea user={user} />;
}

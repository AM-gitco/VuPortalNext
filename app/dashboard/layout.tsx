"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Navbar } from "@/components/dashboard/Navbar";
import { SetupProfile } from "@/components/dashboard/SetupProfile";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading, isAuthenticated } = useAuth();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    // Authentication check - will be handled by middleware later, but keeping for now
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/auth");
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    const needsSetup = user?.role !== "admin" && (!user?.degreeProgram || !user?.subjects?.length);

    if (needsSetup) {
        return <SetupProfile user={user} />;
    }

    // Map pathname to activePage for Sidebar/Navbar compatibility
    const getActivePage = () => {
        if (pathname === "/dashboard") return "dashboard";
        return pathname.replace("/dashboard/", "");
    };

    const activePage = getActivePage();

    const handlePageChange = (page: string) => {
        if (page === "dashboard") {
            router.push("/dashboard");
        } else {
            router.push(`/dashboard/${page}`);
        }
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <Sidebar
                user={user}
                activePage={activePage}
                onPageChange={handlePageChange}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                isMobileOpen={isMobileMenuOpen}
                onMobileClose={() => setIsMobileMenuOpen(false)}
            />

            <div
                className={`transition-all duration-300 flex flex-col min-h-screen ${isSidebarCollapsed ? "md:ml-[72px]" : "md:ml-64"
                    }`}
            >
                <Navbar
                    user={user}
                    onPageChange={handlePageChange}
                    onMobileMenuClick={() => setIsMobileMenuOpen(true)}
                />
                <main className="p-4 md:p-6 flex-1 max-w-[100vw] overflow-x-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
            <ThemeToggle />
        </div>
    );
}

"use client";

import AdminHistoryPage from "@/app/(main)/admin/history/page";

/**
 * The Admin Dashboard now directly renders the global history and metrics page.
 * This provides admins with an immediate overview of system activity upon login.
 */
export function DashboardAdmin() {
    return <AdminHistoryPage />;
}

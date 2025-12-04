"use client";

import { AdminFilesClientPage } from "@/components/admin-files-client";

// This page has been converted to a full Client Component page
// to avoid server-side authentication issues in production environments.
// The AdminFilesClientPage component is already set up to fetch
// all necessary data in real-time on the client.

export default function AdminFilesPage() {
  // The initialUploads and initialUsers props are now removed.
  // The client component will handle all data fetching.
  return <AdminFilesClientPage initialUploads={[]} initialUsers={[]} />;
}

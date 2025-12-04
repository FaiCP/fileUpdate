
import { firestore } from "@/firebase/server";
import { AdminHistoryClientPage } from "@/components/admin-history-client";
import type { Upload, User } from "@/lib/types";

// SERVER: Use Admin SDK to securely fetch all data with privileges
async function getAdminHistoryData() {
  const usersSnapshot = await firestore.collection("users").get();
  const uploadsSnapshot = await firestore.collectionGroup("uploads").orderBy('uploadDate', 'desc').get();

  const allUsers: User[] = usersSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }) as User);

  const allUploads: Upload[] = uploadsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }) as Upload);

  return { allUsers, allUploads };
}


export default async function AdminHistoryPage() {
  // Fetch initial data on the server
  const { allUsers, allUploads } = await getAdminHistoryData();

  // Pass the server-fetched data to the client component for rendering
  return (
    <AdminHistoryClientPage 
        initialUploads={allUploads} 
        initialUsers={allUsers} 
    />
  );
}

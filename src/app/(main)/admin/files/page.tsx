
import { firestore } from "@/firebase/server";
import { AdminFilesClientPage } from "@/components/admin-files-client";
import type { Upload, User } from "@/lib/types";

// SERVER: Use Admin SDK to securely fetch all data with privileges
async function getAdminPageData() {
  const usersSnapshot = await firestore.collection("users").get();
  const uploadsSnapshot = await firestore.collectionGroup("uploads").get();

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


export default async function AdminFilesPage() {
  // Fetch initial data on the server
  const { allUsers, allUploads } = await getAdminPageData();

  // Pass the server-fetched data to the client component for rendering
  return (
    <AdminFilesClientPage 
        initialUploads={allUploads} 
        initialUsers={allUsers} 
    />
  );
}

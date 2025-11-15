import { firestore } from "@/firebase/server"; 
import type { Upload, User } from "@/lib/types";
import { AdminFilesClientPage } from "@/components/admin-files-client";

// SERVER: Usa Admin SDK
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
  const { allUsers, allUploads } = await getAdminPageData();
  return <AdminFilesClientPage initialUploads={allUploads} initialUsers={allUsers} />;
}

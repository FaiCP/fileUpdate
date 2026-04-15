import { firestore } from "@/firebase/server";
import { AdminReportsClientPage } from "@/components/admin-reports-client";
import type { Upload, User } from "@/lib/types";

async function getReportsData() {
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

export default async function AdminReportsPage() {
  const { allUsers, allUploads } = await getReportsData();
  return <AdminReportsClientPage initialUploads={allUploads} initialUsers={allUsers} />;
}

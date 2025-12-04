
import { firestore } from "@/firebase/server";
import { AdminHistoryClientPage } from "@/components/admin-history-client";
import type { Upload, User } from "@/lib/types";

// SERVER: Usa Admin SDK para obtener los datos con privilegios
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
  // Obtenemos los datos en el servidor
  const { allUsers, allUploads } = await getAdminHistoryData();

  // Pasamos los datos al componente de cliente para que los renderice
  return (
    <AdminHistoryClientPage 
        initialUploads={allUploads} 
        initialUsers={allUsers} 
    />
  );
}

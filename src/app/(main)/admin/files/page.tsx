import { collection, collectionGroup, getDocs } from "firebase/firestore";
import { firestore } from "@/firebase/server";
import type { Upload, User } from "@/lib/types";
import { AdminFilesClientPage } from "@/components/admin-files-client";

// This is now a Server Component. It fetches data on the server and passes it
// to the client component that handles interactivity.

async function getAdminPageData() {
  const usersCollection = collection(firestore, "users");
  const uploadsCollection = collectionGroup(firestore, "uploads");

  // Fetch both collections in parallel for efficiency
  const [usersSnapshot, uploadsSnapshot] = await Promise.all([
    getDocs(usersCollection),
    getDocs(uploadsCollection),
  ]);

  const allUsers: User[] = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  const allUploads: Upload[] = uploadsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Upload));

  return { allUsers, allUploads };
}


export default async function AdminFilesPage() {
  // Fetch data on the server
  const { allUsers, allUploads } = await getAdminPageData();

  // Render the client component with the fetched data
  return <AdminFilesClientPage initialUploads={allUploads} initialUsers={allUsers} />;
}

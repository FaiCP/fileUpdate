"use client";

import { useEffect, useState } from "react";
import { useAuth, useFirestore } from "./provider";
import {
  collection,
  getDocs,
  writeBatch,
  doc,
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { User } from "@/lib/types";

// This component will run once on mount, check if users exist, and if not, seed the database.
export function FirebaseSeed() {
  const firestore = useFirestore();
  const auth = useAuth();
  const [isSeeding, setIsSeeding] = useState(false);
  const [hasSeeded, setHasSeeded] = useState(false);

  useEffect(() => {
    if (!firestore || !auth || hasSeeded || isSeeding) return;

    const checkAndSeed = async () => {
      setIsSeeding(true);
      const usersCollection = collection(firestore, "users");
      const userSnapshot = await getDocs(usersCollection);

      if (userSnapshot.empty) {
        console.log("No users found. Seeding initial data...");
        try {
          // --- Seed Admin User ---
          const adminEmail = "ana.garcia@institucion.com";
          const adminPassword = "password";
          const adminCred = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
          const adminUid = adminCred.user.uid;

          const adminUser: Omit<User, 'avatarUrl'> = {
            id: adminUid,
            nombres: "Ana",
            apellidos: "García",
            cedula: "10000000-1",
            departamento: "Legal",
            email: adminEmail,
            rol: "admin",
            activo: true,
          };

          // --- Seed Normal User ---
          const userEmail = "carlos.perez@institucion.com";
          const userPassword = "password";
          const userCred = await createUserWithEmailAndPassword(auth, userEmail, userPassword);
          const userUid = userCred.user.uid;

          const normalUser: Omit<User, 'avatarUrl'> = {
            id: userUid,
            nombres: "Carlos",
            apellidos: "Perez",
            cedula: "20000000-2",
            departamento: "Finanzas",
            email: userEmail,
            rol: "user",
            activo: true,
          };
          
          // --- Batch Write to Firestore ---
          const batch = writeBatch(firestore);

          const adminUserRef = doc(firestore, "users", adminUid);
          batch.set(adminUserRef, { ...adminUser, avatarUrl: `https://picsum.photos/seed/${adminUid}/100` });
          
          // Also grant admin role in the roles_admin collection for security rules
          const adminRoleRef = doc(firestore, "roles_admin", adminUid);
          batch.set(adminRoleRef, { grantedAt: new Date() });

          const normalUserRef = doc(firestore, "users", userUid);
          batch.set(normalUserRef, { ...normalUser, avatarUrl: `https://picsum.photos/seed/${userUid}/100` });
          
          await batch.commit();

          console.log("Database seeded successfully with initial users.");

        } catch (error: any) {
            // This might happen if a user with that email already exists from a previous failed attempt
            if (error.code === 'auth/email-already-in-use') {
                console.log("Initial users already exist in Auth, skipping seed.");
            } else {
                console.error("Error seeding database:", error);
            }
        }
      } else {
        console.log("Users collection is not empty, skipping seed.");
      }
      setHasSeeded(true);
      setIsSeeding(false);
    };

    checkAndSeed();
  }, [firestore, auth, hasSeeded, isSeeding]);

  // This component doesn't render anything visible
  return null;
}

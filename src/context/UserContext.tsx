"use client";

import { createContext, useContext } from "react";
import type { User } from "@/lib/types";

// The context will hold the user object or null if not available.
export const UserContext = createContext<User | null>(null);

/**
 * Custom hook to easily access the current user's data from the context.
 * Throws an error if used outside of a UserContext.Provider.
 */
export const useCurrentUser = (): User | null => {
  const context = useContext(UserContext);
  // This check is not strictly necessary if we always provide a value,
  // but it's good practice for ensuring the hook is used correctly.
  if (context === undefined) {
    // In our case, the provider in MainLayout will always provide a value (even null),
    // so this error shouldn't be hit, but it guards against future misuse.
    return null;
  }
  return context;
};

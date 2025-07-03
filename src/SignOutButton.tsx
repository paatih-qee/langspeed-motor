"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";

export function SignOutButton() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <button
      className="px-4 py-2 rounded bg-white text-red-500 border-[1px] border-red-500 font-semibold hover:bg-red-100"
      onClick={() => void signOut()}
    >
      Sign out
    </button>
  );
}

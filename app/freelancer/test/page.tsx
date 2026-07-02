"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * /freelancer/test is now deprecated.
 * All test/assignment functionality lives at /freelancer/assessment.
 * This file exists only to redirect old bookmarks/links.
 */
export default function TestRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/freelancer/assessment");
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

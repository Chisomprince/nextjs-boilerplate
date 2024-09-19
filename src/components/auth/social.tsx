"use client";

import { signIn } from "next-auth/react";

import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Icons } from "../ui/icons";

export const Social = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const onClick = (provider: "google" | "github") => {
    signIn(provider, {
      callbackUrl: callbackUrl || "/dashboard",
    });
  };

  return (
    <div className="flex items-center w-full gap-x-2">
      <Button
        size="lg"
        className="w-full"
        variant="outline"
        onClick={() => onClick("google")}
      >
        <Icons.google className="h-5 w-5" />
      </Button>
      <Button
        size="lg"
        className="w-full"
        variant="outline"
        onClick={() => onClick("github")}
      >
        <Icons.logo className="h-5 w-5" />
      </Button>
    </div>
  );
};

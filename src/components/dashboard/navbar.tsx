"use client";

import { usePathname } from "next/navigation";

import { AccountDropdown } from "@/components/auth/account-dropdown";

export const Navbar = () => {
  const pathname = usePathname();

  return (
    <nav className="bg-secondary flex justify-between items-center p-4 rounded-xl w-[600px] shadow-sm">
      <div className="flex gap-x-2 font-bold">Dashboard Demo</div>
      <AccountDropdown />
    </nav>
  );
};

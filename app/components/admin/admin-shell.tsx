import type { ReactNode } from "react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";

type AdminShellProps = {
  role: string;
  children: ReactNode;
};

export function AdminShell({ role, children }: AdminShellProps) {
  return (
    <div className="flex min-h-screen bg-[var(--admin-canvas,#f7f4ee)] text-[#1f1f23]">
      <AdminSidebar role={role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileArchive, FileText, History, LayoutDashboard, Settings, Upload, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter
} from "@/components/ui/sidebar";
import type { User } from "@/lib/types";
import { useCurrentUser } from "@/context/UserContext";
import { FileUploadDialog } from "./file-upload-dialog";

const userNavItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/files", icon: History, label: "Mi Historial" },
];

const adminNavItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/files", icon: FileText, label: "Revisión de Actas" },
  { href: "/admin/users", icon: Users, label: "Gestión de Usuarios" },
  { href: "/admin/history", icon: History, label: "Historial Global" },
];

type SidebarNavProps = {
  user: User;
};

export function SidebarNav({ user }: SidebarNavProps) {
  const pathname = usePathname();
  const navItems = user.role === "admin" ? adminNavItems : userNavItems;
  const currentUser = useCurrentUser();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <FileArchive className="h-6 w-6" />
            </div>
            <span className="text-lg font-headline font-bold text-sidebar-foreground">Secure File Hub</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={item.label}
                  className="justify-start"
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      {user.role === "user" && currentUser && (
         <SidebarFooter>
            <FileUploadDialog currentUser={currentUser} />
         </SidebarFooter>
      )}
    </Sidebar>
  );
}

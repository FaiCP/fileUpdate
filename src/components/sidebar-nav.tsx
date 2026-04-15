"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart2, FileArchive, FileText, History, LayoutDashboard, Settings, Upload, Users } from "lucide-react";
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
  { href: "/admin/reports", icon: BarChart2, label: "Reportes" },
];

export function SidebarNav() {
  const pathname = usePathname();
  const currentUser = useCurrentUser();
  
  if (!currentUser) {
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
                {/* Maybe show a loading skeleton here */}
            </SidebarContent>
        </Sidebar>
    )
  }

  const isAdmin = currentUser?.rol === 'admin';
  const navItems = isAdmin ? adminNavItems : userNavItems;

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
      {/* Show upload button only for non-admins */}
      
    </Sidebar>
  );
}

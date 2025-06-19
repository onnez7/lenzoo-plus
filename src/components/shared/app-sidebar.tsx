'use client'

import { UserRole } from "@prisma/client";
import { NavUser } from "./nav-user";
import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import { Separator } from "@/components/ui/separator";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenuItem, SidebarMenu, SidebarMenuButton } from '@/components/ui/sidebar'
import Link from "next/link";

type UserSession = { 
  name?: string | null; 
  email?: string | null; 
  role?: string | null; 
  franchiseId?: string | null; 
  labId?: string | null; 
};

export function AppSidebar({ user }: { user: UserSession }) {
  const isMatriz = user.role === UserRole.MATRIZ_ADMIN;
  const isFranchiseAdmin = user.role === UserRole.FRANCHISE_ADMIN;
  const isFranchiseUser = user.role === UserRole.FRANCHISE_USER;
  const isLabUser = user.role === 'LAB_USER';

  // Determina o link de destino com base no papel do usuário
  const dashboardLink = isMatriz 
    ? "/matriz/dashboard" 
    : isLabUser 
      ? "/lab/dashboard" 
      : "/franchise/dashboard";

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link href={dashboardLink} className="flex items-center gap-2 font-semibold">
                <span className="text-lg group-data-[collapsed=true]/sidebar:hidden">Lenzoo+</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain user={user} />
      </SidebarContent>
      <SidebarFooter>
        <NavSecondary user={user} />
        <Separator className="my-2" />
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
'use client'

import Link from 'next/link'
import { SettingsIcon, HelpCircleIcon } from 'lucide-react'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarGroupContent, SidebarGroup } from '@/components/ui/sidebar'
import { useSession } from 'next-auth/react'
import { UserRole } from '@prisma/client'
import { usePathname } from 'next/navigation'

type UserSession = { 
  role?: string | null; 
  franchiseId?: string | null; 
  labId?: string | null; 
};

export function NavSecondary({ user }: { user: UserSession }) {
  const pathname = usePathname();
  const isMatriz = user.role === UserRole.MATRIZ_ADMIN;
  const isFranchiseAdmin = user.role === UserRole.FRANCHISE_ADMIN;
  const isLabUser = user?.role === UserRole.LAB_USER;

  const franchiseLinks = [
    { href: "/franchise/ajudar", label: "Ajuda", icon: HelpCircleIcon },
  ];

  const matrizLinks = [
    { href: "/matriz/ajudar", label: "Ajuda", icon: HelpCircleIcon },
    { href: "/matriz/configuracoes", label: "Configurações", icon: SettingsIcon }, 
  ];

  const franchiseAdminLinks = [
    { href: "/franchise/configuracoes", label: "Configurações", icon: SettingsIcon }, 
  ];

  const labUserLinks = [
    { href: "/lab/ajudar", label: "Ajuda", icon: HelpCircleIcon },
    { href: "/lab/configuracoes", label: "Configurações", icon: SettingsIcon },
  ];

  // Determina os links a serem exibidos com base no papel do usuário
  const navLinks = isMatriz ? matrizLinks : isLabUser ? labUserLinks : franchiseLinks;

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {navLinks.map((link) => (
            <SidebarMenuItem key={link.href}>
              <Link href={link.href} passHref>
                <SidebarMenuButton data-active={pathname.startsWith(link.href)} tooltip={link.label}>
                  <link.icon className="h-5 w-5" />
                  <span className="group-data-[collapsed=true]/sidebar:hidden">{link.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
          {isFranchiseAdmin && (
            <>
              {franchiseAdminLinks.map((link) => (
                <SidebarMenuItem key={link.href}>
                  <Link href={link.href} passHref>
                    <SidebarMenuButton data-active={pathname.startsWith(link.href)} tooltip={link.label}>
                      <link.icon className="h-5 w-5" />
                      <span className="group-data-[collapsed=true]/sidebar:hidden">{link.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
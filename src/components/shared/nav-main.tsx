'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserRole } from "@prisma/client";
import { Home, Users, Package, ShoppingCart, User as UserIcon, Building, LayoutDashboard, DollarSign, Banknote, Target, TrendingDown, Calendar, Bot, MessageSquare, FlaskConical } from "lucide-react";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarGroupContent, SidebarGroup } from '@/components/ui/sidebar';

type UserSession = { 
  role?: string | null; 
  franchiseId?: string | null; 
  labId?: string | null; 
};

export function NavMain({ user }: { user: UserSession }) {
  const pathname = usePathname();
  const isMatriz = user.role === UserRole.MATRIZ_ADMIN;
  const isFranchiseAdmin = user.role === UserRole.FRANCHISE_ADMIN;
  const isLabUser = user?.role === UserRole.LAB_USER;

  const franchiseLinks = [
    { href: "/franchise/dashboard", label: "Dashboard", icon: Home },
    { href: "/franchise/clientes", label: "Clientes", icon: Users },
    { href: "/franchise/produtos", label: "Produtos", icon: Package },
    { href: "/franchise/pedidos", label: "Vendas / OS", icon: ShoppingCart },
    { href: "/franchise/vendas-perdidas", label: "Vendas Perdidas", icon: TrendingDown }, 
    { href: "/franchise/financeiro", label: "Financeiro", icon: Banknote },
    { href: "/franchise/caixa", label: "Caixa", icon: DollarSign },
    { href: "/franchise/agenda", label: "Agenda", icon: Calendar },
  ];

  const matrizLinks = [
    { href: "/matriz/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/matriz/franquias", label: "Franquias", icon: Building },
    { href: "/matriz/produtos", label: "Produtos Globais", icon: Package },
    { href: "/matriz/processar-automacoes", label: "Processar Automações", icon: Bot },
    { href: "/matriz/laboratorios", label: "Laboratórios", icon: FlaskConical },
  ];

  const marketingLinks = [
    { href: "/franchise/automacoes", label: "Automações", icon: Bot },
    { href: "/franchise/automacoes/logs", label: "Log de Envios", icon: MessageSquare },
  ];

  const franchiseAdminLinks = [
    { href: "/franchise/usuarios", label: "Colaboradores", icon: UserIcon },
    { href: "/franchise/metas", label: "Metas", icon: Target },
  ];

  const labUserLinks = [
    { href: "/lab/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ];

  // Determina os links a serem exibidos com base no papel do usuário
  const navLinks = isMatriz ? matrizLinks : isLabUser ? labUserLinks : franchiseLinks;

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
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
              {marketingLinks.map((link) => (
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
  );
}
'use client'

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { MenuIcon, SearchIcon, BellIcon } from "lucide-react";
import { AppSidebar } from "./app-sidebar";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { markNotificationsAsRead } from "@/lib/actions/notification-actions";
import { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"


export function SiteHeader() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Busca as notificações quando o componente é montado
  useEffect(() => {
    const fetchNotifications = async () => {
        if (session?.user) {
            const res = await fetch('/api/notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications);
            }
        }
    };
    fetchNotifications();
  }, [session]);
  
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && unreadCount > 0) {
        // Marca as notificações como lidas quando o popover é fechado
        markNotificationsAsRead().then(() => {
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        });
    }
  }


  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <Sheet>
            <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="lg:hidden">
                <MenuIcon className="h-5 w-5" />
                <span className="sr-only">Abrir Menu</span>
            </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs p-0">
                 {session?.user && <AppSidebar user={session.user} />}
            </SheetContent>
        </Sheet>
        
        <SidebarTrigger className="hidden lg:flex" />
        <Separator orientation="vertical" className="h-6 hidden lg:block" />
      
        <div className="relative ml-auto flex-1 md:grow-0">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Pesquisar..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
            />
        </div>
        <div className="relative ml-auto flex items-center gap-4">
            <Popover onOpenChange={handleOpenChange}>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="icon" className="relative">
                        <BellIcon className="h-5 w-5" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                                {unreadCount}
                            </span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                    <div className="p-4">
                        <h4 className="font-medium">Notificações</h4>
                    </div>
                    <div className="space-y-2 p-2">
                        {notifications.length > 0 ? (
                            notifications.map(n => (
                                <Link key={n.id} href={n.link || "#"}>
                                    <div className="text-sm p-2 rounded-md hover:bg-muted">
                                        <p>{n.message}</p>
                                        <p className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString('pt-BR')}</p>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground p-4 text-center">Nenhuma notificação.</p>
                        )}
                    </div>
                </PopoverContent>
            </Popover>
             {/* O menu do utilizador (NavUser) viria aqui, mas foi movido para a sidebar */}
        </div>
    </header>
  );
}
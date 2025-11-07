import {
  FileText,
  Search,
  MessageSquare,
  Settings,
  Sparkles,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link } from "@tanstack/react-router";

const menuItems = [
  { title: "Documents", url: "/account/documents", icon: FileText },
  { title: "Search", url: "/account/search", icon: Search },
  { title: "Chat", url: "/account/chat", icon: MessageSquare },
  { title: "Settings", url: "/account/settings", icon: Settings },
];

export function DashboardSidebar() {
  const { open } = useSidebar();

  return (
    <Sidebar className={open ? "w-64" : "w-16"} collapsible="icon">
      <SidebarContent>
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-sidebar-primary" />
            {open && (
              <span className="font-semibold text-sidebar-foreground">
                AI Knowledge
              </span>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      to={item.url}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
                      activeProps={{
                        className:
                          "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
                      }}
                    >
                      <item.icon className="h-5 w-5" />
                      {open && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

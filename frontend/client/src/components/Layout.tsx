import { Link, Outlet, useLocation } from "react-router-dom";
import {
  MessageSquare,
  BookOpen,
  BarChart3,
  FileText,
  Settings,
  Bot,
} from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList } from "@/components/ui/breadcrumb";

const navItems = [
  { path: "/", label: "智能对话", icon: MessageSquare },
  { path: "/knowledge", label: "知识库管理", icon: BookOpen },
  { path: "/dashboard", label: "数据看板", icon: BarChart3 },
  { path: "/report", label: "使用报告", icon: FileText },
  { path: "/settings", label: "系统设置", icon: Settings },
];

const LayoutContent = () => {
  const { pathname } = useLocation();
  const activeItem = navItems.find(
    (item) => item.path === "/" ? pathname === "/" : pathname.startsWith(item.path)
  );
  const activeTitle = activeItem?.label || "智扫通";

  return (
    <>
      <Sidebar collapsible="icon" className="border-r border-white/5">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link to="/">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Bot className="size-5" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
                    <span className="font-semibold text-foreground">智扫通</span>
                    <span className="text-xs text-muted-foreground">智能客服系统</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const isActive =
                    item.path === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.path);
                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link to={item.path}>
                          <item.icon className="size-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="px-3 py-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
            v1.0.0 · RAG Agent
          </div>
        </SidebarFooter>
      </Sidebar>
      <main className="flex-1 flex flex-col overflow-hidden p-6">
        <header className="flex items-center gap-3 mb-6">
          <SidebarTrigger />
          <Breadcrumb className="self-center">
            <BreadcrumbList>
              <BreadcrumbItem className="text-foreground font-medium text-base">
                {activeTitle}
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </>
  );
};

const Layout = () => (
  <SidebarProvider>
    <LayoutContent />
  </SidebarProvider>
);

export default Layout;

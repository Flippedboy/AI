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
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { path: "/", label: "智能对话", icon: MessageSquare, desc: "AI 在线问答" },
  { path: "/knowledge", label: "知识库管理", icon: BookOpen, desc: "文档与向量库" },
  { path: "/dashboard", label: "数据看板", icon: BarChart3, desc: "运营数据可视化" },
  { path: "/report", label: "使用报告", icon: FileText, desc: "AI 生成报告" },
  { path: "/settings", label: "系统设置", icon: Settings, desc: "模型与界面配置" },
];

const LayoutContent = () => {
  const { pathname } = useLocation();
  const activeItem = navItems.find(
    (item) => item.path === "/" ? pathname === "/" : pathname.startsWith(item.path)
  );
  const activeTitle = activeItem?.label || "AI扫地机智能客服";

  return (
    <>
      <Sidebar collapsible="icon" className="border-r border-sidebar-border/60">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="data-[slot=menu-button]:p-2">
                <Link to="/">
                  <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-500 text-primary-foreground shadow-lg shadow-primary/20">
                    <Bot className="size-5" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
                    <span className="font-semibold text-foreground">AI扫地机智能客服</span>
                    <span className="text-xs text-muted-foreground">智能客服系统</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-medium tracking-wide uppercase">
              功能导航
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const isActive =
                    item.path === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.path);
                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.label} className="h-10">
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
            <div className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-success animate-pulse" />
              <span>v1.0.0 · RAG Agent</span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-border/40 bg-background/80 px-6 backdrop-blur-xl">
          <SidebarTrigger className="size-9 rounded-lg hover:bg-accent transition-colors" />
          <Separator orientation="vertical" className="!h-5 bg-border/60" />
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-foreground">{activeTitle}</h1>
            {activeItem && (
              <span className="hidden sm:inline text-xs text-muted-foreground">
                · {activeItem.desc}
              </span>
            )}
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </>
  );
};

const Layout = () => (
  <SidebarProvider defaultOpen={true}>
    <LayoutContent />
  </SidebarProvider>
);

export default Layout;

import { Link, Outlet, useLocation } from "react-router-dom";
import {
  MessageSquare,
  BookOpen,
  BarChart3,
  FileText,
  Settings,
  Bot,
  Sparkles,
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import DockSwitcher from "./DockSwitcher";

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
      <Sidebar collapsible="icon" className="border-r border-sidebar-border/60 tech-sidebar">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="data-[slot=menu-button]:p-2">
                <Link to="/">
                  <div className="relative flex aspect-square size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-blue-500 to-cyan-400 text-primary-foreground shadow-lg shadow-primary/30 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-60" />
                    <Bot className="size-5 relative z-10" />
                    <span className="absolute inset-0 rounded-xl ring-1 ring-white/20" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
                    <span className="font-semibold text-foreground tracking-tight">AI扫地机智能客服</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Sparkles className="size-2.5 text-primary/70" />
                      智能客服系统
                    </span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-medium tracking-widest uppercase text-muted-foreground/70">
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
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.label}
                        className="h-10 relative group/nav"
                      >
                        <Link to={item.path}>
                          <span
                            className={`absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r-full bg-gradient-to-b from-primary to-cyan-400 transition-all duration-300 ${
                              isActive
                                ? "opacity-100 scale-100 shadow-[0_0_8px_var(--primary)]"
                                : "opacity-0 scale-50"
                            } group-data-[collapsible=icon]:hidden`}
                          />
                          <item.icon
                            className={`size-4 transition-all duration-300 ${
                              isActive
                                ? "text-primary drop-shadow-[0_0_6px_var(--primary)]"
                                : "text-muted-foreground group-hover/nav:text-foreground"
                            }`}
                          />
                          <span className={isActive ? "text-foreground font-medium" : ""}>
                            {item.label}
                          </span>
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
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-success" />
              </span>
              <span className="font-mono">v1.0.0 · RAG Agent</span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center gap-2 border-b border-border/40 bg-background/80 px-4 backdrop-blur-xl">
          {/* 豆包风格：圆角图标按钮，hover 时上浮 + 发光 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarTrigger
                className={cnTrigger}
              />
            </TooltipTrigger>
            <TooltipContent side="bottom" className="font-medium">
              切换侧边栏
            </TooltipContent>
          </Tooltip>

          {/* 豆包风格：功能切换器（应用网格按钮） */}
          <DockSwitcher />

          <Separator orientation="vertical" className="!h-5 bg-border/60 mx-1" />

          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-base font-semibold text-foreground tracking-tight truncate">
              {activeTitle}
            </h1>
            {activeItem && (
              <span className="hidden sm:inline text-xs text-muted-foreground shrink-0">
                · {activeItem.desc}
              </span>
            )}
          </div>
          <div className="ml-auto hidden md:flex items-center gap-2 text-xs text-muted-foreground/70 font-mono">
            <span className="size-1.5 rounded-full bg-primary/60 animate-pulse" />
            <span>System Online</span>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6 tech-page-bg">
          <Outlet />
        </div>
      </SidebarInset>
    </>
  );
};

// 豆包风格 SidebarTrigger 样式
const cnTrigger =
  "size-9 rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:bg-primary/10 hover:shadow-md hover:shadow-primary/20 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-primary/40";

const Layout = () => (
  <SidebarProvider defaultOpen={true}>
    <LayoutContent />
  </SidebarProvider>
);

export default Layout;

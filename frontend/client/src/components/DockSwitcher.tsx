import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  MessageSquare,
  BookOpen,
  BarChart3,
  FileText,
  Settings,
  LayoutGrid,
  ChevronRight,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface NavItem {
  path: string;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
}

const navItems: NavItem[] = [
  {
    path: '/',
    label: '智能对话',
    desc: 'AI 在线问答',
    icon: MessageSquare,
    gradient: 'from-blue-500 to-cyan-400',
  },
  {
    path: '/knowledge',
    label: '知识库管理',
    desc: '文档与向量库',
    icon: BookOpen,
    gradient: 'from-emerald-500 to-teal-400',
  },
  {
    path: '/dashboard',
    label: '数据看板',
    desc: '运营数据可视化',
    icon: BarChart3,
    gradient: 'from-violet-500 to-purple-400',
  },
  {
    path: '/report',
    label: '使用报告',
    desc: 'AI 生成报告',
    icon: FileText,
    gradient: 'from-amber-500 to-orange-400',
  },
  {
    path: '/settings',
    label: '系统设置',
    desc: '模型与界面配置',
    icon: Settings,
    gradient: 'from-slate-500 to-slate-400',
  },
];

const DockSwitcher = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isActive = (path: string) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path);

  const activeItem =
    navItems.find((item) => isActive(item.path)) || navItems[0];

  const handleSelect = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label="功能切换"
              className={cn(
                'group relative inline-flex size-9 items-center justify-center rounded-xl',
                'border border-border/60 bg-card/40 backdrop-blur-sm',
                'transition-all duration-300',
                'hover:border-primary/50 hover:bg-primary/10 hover:shadow-md hover:shadow-primary/20',
                'hover:-translate-y-0.5',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                open && 'border-primary/50 bg-primary/10 shadow-md shadow-primary/20'
              )}
            >
              <LayoutGrid
                className={cn(
                  'size-4 transition-all duration-300',
                  'text-muted-foreground group-hover:text-primary',
                  open && 'text-primary'
                )}
              />
              <span
                className={cn(
                  'absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-gradient-to-br',
                  activeItem.gradient,
                  'ring-2 ring-background'
                )}
              />
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="font-medium">
          功能切换
        </TooltipContent>
      </Tooltip>

      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={8}
        className="w-80 p-2 glass tech-card border-border/60 rounded-2xl shadow-2xl shadow-black/30"
      >
        <div className="px-3 py-2 mb-1 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              功能切换
            </div>
            <div className="text-[11px] text-muted-foreground/70 mt-0.5">
              快速跳转到任意模块
            </div>
          </div>
          <kbd className="text-[10px] font-mono text-muted-foreground/70 px-1.5 py-0.5 rounded border border-border/60 bg-muted/30">
            ⌘B
          </kbd>
        </div>

        <div className="grid grid-cols-1 gap-1">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => handleSelect(item.path)}
                className={cn(
                  'group/item relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-left',
                  'transition-all duration-200',
                  active
                    ? 'bg-primary/10 border border-primary/30'
                    : 'border border-transparent hover:bg-accent/60 hover:border-border/40'
                )}
              >
                <div
                  className={cn(
                    'relative size-9 shrink-0 rounded-lg flex items-center justify-center',
                    'bg-gradient-to-br shadow-sm',
                    item.gradient,
                    'transition-transform duration-300 group-hover/item:scale-110',
                    active && 'scale-105'
                  )}
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent rounded-lg" />
                  <Icon className="size-4 text-white relative z-10" />
                </div>

                <div className="flex-1 min-w-0">
                  <div
                    className={cn(
                      'text-sm font-medium truncate',
                      active ? 'text-foreground' : 'text-foreground/90'
                    )}
                  >
                    {item.label}
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {item.desc}
                  </div>
                </div>

                {active ? (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                    当前
                  </span>
                ) : (
                  <ChevronRight className="size-4 text-muted-foreground/50 opacity-0 -translate-x-1 transition-all duration-200 group-hover/item:opacity-100 group-hover/item:translate-x-0" />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-2 pt-2 border-t border-border/40 px-3 py-1.5 text-[10px] text-muted-foreground/60 font-mono text-center">
          AI 扫地机智能客服 · 5 个模块
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DockSwitcher;

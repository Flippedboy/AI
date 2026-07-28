import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { QuickQuestion } from '@shared/api.interface';

interface QuickQuestionBarProps {
  questions: QuickQuestion[];
  onQuestionClick: (question: string) => void;
  disabled?: boolean;
  variant?: 'inline' | 'card';
}

const QuickQuestionBar = ({
  questions,
  onQuestionClick,
  disabled,
  variant = 'inline',
}: QuickQuestionBarProps) => {
  if (questions.length === 0) return null;

  // 卡片样式：空对话状态下居中展示，2 列网格，更醒目
  if (variant === 'card') {
    return (
      <div className="w-full max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {questions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => onQuestionClick(q.content)}
              disabled={disabled}
              className="group relative flex items-center gap-3 glass tech-card rounded-xl p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/15 disabled:opacity-50 disabled:hover:translate-y-0 overflow-hidden"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <div className="size-8 shrink-0 rounded-lg bg-gradient-to-br from-primary/20 to-cyan-400/10 flex items-center justify-center text-primary transition-all group-hover:from-primary/30 group-hover:to-cyan-400/20 group-hover:scale-110">
                <Zap className="size-4" />
              </div>
              <span className="text-sm text-foreground/90 group-hover:text-foreground line-clamp-2">
                {q.content}
              </span>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all duration-300 text-primary">
                →
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 内联样式：对话过程中顶部展示
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2.5">
        <Zap className="size-3.5 text-primary" />
        <span className="text-xs font-medium text-muted-foreground">快捷提问</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {questions.map((q) => (
          <Button
            key={q.id}
            variant="outline"
            size="sm"
            onClick={() => onQuestionClick(q.content)}
            disabled={disabled}
            className="bg-card/50 border-white/10 text-foreground/80 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all duration-300 hover:-translate-y-0.5"
          >
            {q.content}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default QuickQuestionBar;

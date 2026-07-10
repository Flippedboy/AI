import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { QuickQuestion } from '@shared/api.interface';

interface QuickQuestionBarProps {
  questions: QuickQuestion[];
  onQuestionClick: (question: string) => void;
  disabled?: boolean;
}

const QuickQuestionBar = ({ questions, onQuestionClick, disabled }: QuickQuestionBarProps) => {
  if (questions.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="size-4 text-primary" />
        <span className="text-sm font-medium text-foreground">快捷提问</span>
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

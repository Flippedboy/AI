import { useEffect, useRef } from 'react';
import { Bot, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { ChatMessage } from '@shared/api.interface';

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
};

const MessageList = ({ messages, isLoading }: MessageListProps) => {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="size-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="size-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">智扫通智能客服</h3>
          <p className="text-sm text-muted-foreground">
            您好！我是扫地机器人专属客服，有什么可以帮您的？
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={listRef}
      className="flex-1 overflow-y-auto space-y-4 pr-2 scroll-smooth"
      style={{ scrollbarWidth: 'thin' }}
    >
      {messages.map((msg, index) => (
        <div
          key={msg.id}
          className={`flex gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          style={{
            animation: 'slideInUp 0.3s ease-out',
            animationDelay: `${index * 0.02}s`,
            animationFillMode: 'both',
          }}
        >
          <Avatar className="size-8 shrink-0">
            <AvatarFallback
              className={
                msg.type === 'ai'
                  ? 'bg-gradient-to-br from-primary to-blue-500 text-white'
                  : 'bg-muted text-foreground'
              }
            >
              {msg.type === 'ai' ? <Bot className="size-4" /> : <User className="size-4" />}
            </AvatarFallback>
          </Avatar>

          <div className={`flex flex-col gap-1 max-w-[75%] ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
            <div
              className={`px-4 py-3 rounded-2xl ${
                msg.type === 'ai'
                  ? 'bg-gradient-to-br from-primary/80 to-blue-600/60 text-white rounded-tl-sm'
                  : 'bg-card text-foreground rounded-tr-sm border border-white/10'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {msg.content || (
                  <span className="inline-flex gap-1">
                    <span className="size-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="size-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="size-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                )}
                {msg.type === 'ai' && isLoading && index === messages.length - 1 && msg.content && (
                  <span className="inline-block w-0.5 h-4 bg-white/80 ml-1 align-middle animate-pulse" />
                )}
              </p>
            </div>
            <span className="text-xs text-muted-foreground px-1">
              {formatTime(msg.createdAt)}
            </span>
          </div>
        </div>
      ))}

      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default MessageList;

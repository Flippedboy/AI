import { useEffect, useRef } from 'react';
import { Bot, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { ChatMessage } from '@shared/api.interface';

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  streamingId?: string;
}

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
};

const MessageList = ({ messages, isLoading, streamingId }: MessageListProps) => {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  return (
    <div
      ref={listRef}
      className="flex-1 overflow-y-auto space-y-5 pr-1 scroll-smooth tech-scroll"
    >
      {messages.map((msg, index) => {
        const isStreaming = msg.id === streamingId && isLoading;
        const isAiWaiting = msg.type === 'ai' && !msg.content && isStreaming;
        return (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            style={{
              animation: 'slideInUp 0.3s ease-out',
              animationDelay: `${Math.min(index, 5) * 0.02}s`,
              animationFillMode: 'both',
            }}
          >
            <Avatar className="size-8 shrink-0 mt-0.5">
              <AvatarFallback
                className={
                  msg.type === 'ai'
                    ? 'bg-gradient-to-br from-primary via-blue-500 to-cyan-400 text-white shadow-md shadow-primary/30'
                    : 'bg-muted text-foreground'
                }
              >
                {msg.type === 'ai' ? <Bot className="size-4" /> : <User className="size-4" />}
              </AvatarFallback>
            </Avatar>

            <div className={`flex flex-col gap-1 max-w-[78%] ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words relative ${
                  msg.type === 'ai'
                    ? 'glass tech-card text-card-foreground rounded-2xl rounded-tl-sm shadow-sm'
                    : 'bg-gradient-to-br from-primary via-blue-500 to-blue-500 text-white rounded-2xl rounded-tr-sm shadow-md shadow-primary/30'
                }`}
              >
                {isAiWaiting ? (
                  <span className="inline-flex items-center gap-1 py-1 stream-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                ) : (
                  <>
                    <span className={isStreaming ? 'stream-cursor' : ''}>{msg.content}</span>
                  </>
                )}
              </div>
              <span className="text-[11px] text-muted-foreground px-1 font-mono">
                {formatTime(msg.createdAt)}
                {msg.type === 'ai' && msg.responseTime && !isStreaming && (
                  <span className="ml-2 text-muted-foreground/60">· {msg.responseTime}ms</span>
                )}
              </span>
            </div>
          </div>
        );
      })}

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

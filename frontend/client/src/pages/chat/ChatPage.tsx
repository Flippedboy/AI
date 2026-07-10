import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { chat } from '@/api';
import { streamChatReply } from '@/utils/capability';
import type { ChatMessage, QuickQuestion } from '@shared/api.interface';
import QuickQuestionBar from './QuickQuestionBar';
import MessageList from './MessageList';

const SESSION_KEY = 'zhisaotong_session_id';

const ChatPage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quickQuestions, setQuickQuestions] = useState<QuickQuestion[]>([]);
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let sid = localStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem(SESSION_KEY, sid);
    }
    setSessionId(sid);
    loadMessages(sid);
    loadQuickQuestions();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const loadMessages = async (sid: string) => {
    try {
      const result = await chat.getChatMessages({ sessionId: sid, pageSize: 50 });
      setMessages(result.items);
    } catch (error) {
      logger.error('加载消息失败', error);
    }
  };

  const loadQuickQuestions = async () => {
    try {
      const result = await chat.getQuickQuestions();
      setQuickQuestions(result.items);
    } catch (error) {
      logger.error('加载快捷问题失败', error);
    }
  };

  const saveMessage = async (msg: Omit<ChatMessage, 'id' | 'createdAt'>) => {
    try {
      await chat.createChatMessage(msg as any);
    } catch (error) {
      logger.error('保存消息失败', error);
    }
  };

  const handleSend = useCallback(async (content: string, isQuick = false) => {
    if (!content.trim() || isLoading || !sessionId) return;

    const userMsg: ChatMessage = {
      id: `temp_user_${Date.now()}`,
      sessionId,
      content: content.trim(),
      type: 'user',
      isQuickQuestion: isQuick,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    const aiMsgId = `temp_ai_${Date.now()}`;
    const aiMsg: ChatMessage = {
      id: aiMsgId,
      sessionId,
      content: '',
      type: 'ai',
      isQuickQuestion: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, aiMsg]);

    const startTime = Date.now();
    let fullContent = '';

    try {
      fullContent = await streamChatReply(content.trim(), (chunk) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId ? { ...m, content: m.content + chunk } : m
          )
        );
      });

      const responseTime = Date.now() - startTime;

      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId
            ? { ...m, content: fullContent, responseTime }
            : m
        )
      );

      saveMessage({
        sessionId,
        content: content.trim(),
        type: 'user',
        isQuickQuestion: isQuick,
      });
      saveMessage({
        sessionId,
        content: fullContent,
        type: 'ai',
        isQuickQuestion: false,
        responseTime,
      });
    } catch (error) {
      logger.error('AI回复失败', error);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId
            ? { ...m, content: '抱歉，我遇到了一些问题，请稍后再试。' }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, sessionId]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputValue);
    }
  };

  const handleQuickClick = (question: string) => {
    handleSend(question, true);
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <QuickQuestionBar
        questions={quickQuestions}
        onQuestionClick={handleQuickClick}
        disabled={isLoading}
      />

      <MessageList messages={messages} isLoading={isLoading} />

      <div ref={messagesEndRef} />

      <div className="mt-4 glass rounded-2xl p-4">
        <div className="flex gap-3 items-end">
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="请输入您的问题，Enter发送，Shift+Enter换行..."
            className="min-h-[60px] max-h-[200px] resize-none bg-transparent border-white/10 focus:border-primary/50 text-foreground placeholder:text-muted-foreground"
            rows={2}
          />
          <Button
            onClick={() => handleSend(inputValue)}
            disabled={isLoading || !inputValue.trim()}
            className="h-[60px] px-6 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            {isLoading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Send className="size-5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          AI 回复仅供参考，如有疑问请联系人工客服
        </p>
      </div>
    </div>
  );
};

export default ChatPage;

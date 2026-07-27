import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Bot, Loader2 } from 'lucide-react';
import { logger } from '@/utils/logger';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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

  // 自动调整输入框高度
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
  }, [inputValue]);

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

  const isEmpty = messages.length === 0 && !isLoading;

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto">
      {/* 空对话状态：居中展示品牌信息 + 快捷提问卡片 */}
      {isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="size-16 mb-5 rounded-2xl bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center shadow-xl shadow-primary/25">
            <Bot className="size-8 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            您好，我是 AI 扫地机智能客服
          </h2>
          <p className="text-sm text-muted-foreground mb-8 text-center max-w-md">
            专为扫地机器人打造的智能助手，有问题尽管问我，也可以点击下方快捷提问快速开始
          </p>
          <QuickQuestionBar
            questions={quickQuestions}
            onQuestionClick={handleQuickClick}
            disabled={isLoading}
            variant="card"
          />
        </div>
      ) : (
        <>
          {!isEmpty && quickQuestions.length > 0 && messages.length <= 2 && (
            <QuickQuestionBar
              questions={quickQuestions}
              onQuestionClick={handleQuickClick}
              disabled={isLoading}
            />
          )}
          <MessageList messages={messages} isLoading={isLoading} />
        </>
      )}

      <div ref={messagesEndRef} />

      {/* 悬浮输入区：参考豆包的圆角胶囊设计 */}
      <div className="sticky bottom-0 pt-4">
        <div className="glass rounded-2xl p-3 shadow-lg shadow-black/10">
          <div className="flex gap-2 items-end">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="请输入您的问题，Enter 发送，Shift+Enter 换行..."
              className="min-h-[44px] max-h-[200px] resize-none bg-transparent border-0 focus-visible:ring-0 text-foreground placeholder:text-muted-foreground px-2"
              rows={1}
            />
            <Button
              onClick={() => handleSend(inputValue)}
              disabled={isLoading || !inputValue.trim()}
              size="icon"
              className="size-10 shrink-0 rounded-xl bg-gradient-to-br from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 disabled:opacity-40"
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1.5 text-center">
            AI 回复仅供参考，如有疑问请联系人工客服
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;

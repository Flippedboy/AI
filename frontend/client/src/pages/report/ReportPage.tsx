import { useState, useEffect, useRef } from 'react';
import { FileText, Download, Loader2, FileSpreadsheet, AlertCircle, CheckCircle, Clock, Zap, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { report } from '@/api';
import type { UserReport, ReportContent } from '@shared/api.interface';

const MOCK_USERS = [
  { id: '1847292357012580', name: '张先生' },
  { id: '1847292986161210', name: '李女士' },
  { id: '1838411738368010', name: '王先生' },
  { id: '1856321049783650', name: '赵女士' },
];

const ReportPage = () => {
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentReport, setCurrentReport] = useState<UserReport | null>(null);
  const [pollingId, setPollingId] = useState<string | null>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, []);

  const formatMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const handleGenerate = async () => {
    if (!selectedUser) {
      toast.error('请选择用户');
      return;
    }

    setIsGenerating(true);
    setCurrentReport(null);

    try {
      const result = await report.createUserReport({
        userId: selectedUser,
        month: formatMonth(selectedMonth),
      });

      setPollingId(result.id);
      startPolling(result.id);
    } catch (error) {
      logger.error('生成报告失败', error);
      toast.error('生成报告失败，请重试');
      setIsGenerating(false);
    }
  };

  const startPolling = (reportId: string) => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
    }

    pollTimerRef.current = setInterval(async () => {
      try {
        const result = await report.getUserReport(reportId);
        if (result.status === 'success' || result.status === 'failed') {
          setCurrentReport(result);
          setIsGenerating(false);
          setPollingId(null);
          if (pollTimerRef.current) {
            clearInterval(pollTimerRef.current);
            pollTimerRef.current = null;
          }
          if (result.status === 'success') {
            toast.success('报告生成成功');
          } else {
            toast.error('报告生成失败，请重试');
          }
        }
      } catch (error) {
        logger.error('轮询报告状态失败', error);
      }
    }, 2000);
  };

  const handleExportPdf = () => {
    toast.info('PDF 导出功能开发中...');
  };

  const handleExportExcel = () => {
    toast.info('Excel 导出功能开发中...');
  };

  const getUserName = (userId: string) => {
    const user = MOCK_USERS.find((u) => u.id === userId);
    return user?.name || '未知用户';
  };

  const statusConfig = {
    generating: { label: '生成中', icon: <Loader2 className="size-4 animate-spin" />, className: 'text-yellow-400' },
    success: { label: '已完成', icon: <CheckCircle className="size-4" />, className: 'text-green-400' },
    failed: { label: '失败', icon: <AlertCircle className="size-4" />, className: 'text-red-400' },
  };

  const content = currentReport?.content;

  return (
    <div className="flex flex-col h-full">
      <div className="glass rounded-xl p-5 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-muted-foreground">选择用户</label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="w-[180px] bg-card border-white/10 text-foreground">
                <SelectValue placeholder="请选择用户" />
              </SelectTrigger>
              <SelectContent className="bg-card border-white/10 text-foreground">
                {MOCK_USERS.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-muted-foreground">选择月份</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[180px] justify-start text-left font-normal bg-card border-white/10 text-foreground">
                  <Clock className="size-4 mr-2" />
                  {formatMonth(selectedMonth)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-card border-white/10">
                <Calendar
                  mode="single"
                  selected={selectedMonth}
                  onSelect={(date) => date && setSelectedMonth(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !selectedUser}
            className="bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
          >
            {isGenerating ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Sparkles className="size-4 mr-2" />
                生成报告
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {isGenerating && !currentReport && (
          <div className="glass rounded-xl p-12 flex flex-col items-center justify-center">
            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 animate-pulse">
              <FileText className="size-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">正在生成报告</h3>
            <p className="text-sm text-muted-foreground">AI 正在分析用户使用数据，请稍候...</p>
          </div>
        )}

        {!isGenerating && !currentReport && (
          <div className="glass rounded-xl p-12 flex flex-col items-center justify-center">
            <div className="size-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
              <FileText className="size-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">暂无报告</h3>
            <p className="text-sm text-muted-foreground">选择用户和月份，点击生成报告</p>
          </div>
        )}

        {currentReport && currentReport.status === 'failed' && (
          <div className="glass rounded-xl p-12 flex flex-col items-center justify-center">
            <div className="size-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
              <AlertCircle className="size-8 text-red-400" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">报告生成失败</h3>
            <p className="text-sm text-muted-foreground mb-4">请检查网络连接后重试</p>
            <Button onClick={handleGenerate}>重新生成</Button>
          </div>
        )}

        {currentReport && currentReport.status === 'success' && content && (
          <div
            className="bg-white/95 text-slate-800 rounded-xl overflow-hidden"
            style={{ animation: 'fadeInUp 0.5s ease-out' }}
          >
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-8 py-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {getUserName(currentReport.userId)} · {currentReport.month}使用报告
                </h2>
                <p className="text-sm text-slate-300 mt-1">智扫通机器人智能客服</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleExportPdf} className="border-white/20 text-white hover:bg-white/10">
                  <Download className="size-4 mr-1" />
                  PDF
                </Button>
                <Button size="sm" variant="outline" onClick={handleExportExcel} className="border-white/20 text-white hover:bg-white/10">
                  <FileSpreadsheet className="size-4 mr-1" />
                  Excel
                </Button>
              </div>
            </div>

            <div className="p-8 space-y-8">
              <section>
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Zap className="size-5 text-primary" />
                  使用概览
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-primary">{content.overview.totalChats}</div>
                    <div className="text-sm text-slate-500 mt-1">咨询次数</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-primary">{content.overview.totalCleanCount}</div>
                    <div className="text-sm text-slate-500 mt-1">清扫次数</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-primary">{content.overview.totalArea}㎡</div>
                    <div className="text-sm text-slate-500 mt-1">累计面积</div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <FileText className="size-5 text-primary" />
                  高频问题
                </h3>
                <div className="space-y-2">
                  {content.frequentQuestions.map((q, index) => (
                    <div key={index} className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          #{index + 1}
                        </Badge>
                        <span className="text-slate-700">{q.question}</span>
                      </div>
                      <span className="text-sm text-slate-500">{q.count} 次</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Sparkles className="size-5 text-primary" />
                  清洁建议
                </h3>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <p className="text-slate-700 leading-relaxed">{content.cleaningAdvice}</p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <AlertCircle className="size-5 text-primary" />
                  耗材提醒
                </h3>
                <div className="space-y-2">
                  {content.supplyReminder.map((item, index) => {
                    const statusColors = {
                      normal: 'bg-green-50 border-green-200 text-green-700',
                      warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
                      replace: 'bg-red-50 border-red-200 text-red-700',
                    };
                    const statusLabels = {
                      normal: '状态良好',
                      warning: '建议更换',
                      replace: '立即更换',
                    };
                    return (
                      <div
                        key={index}
                        className={`flex items-center justify-between rounded-lg px-4 py-3 border ${statusColors[item.status]}`}
                      >
                        <span className="font-medium">{item.item}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm">{item.detail}</span>
                          <Badge variant="outline" className={statusColors[item.status]}>
                            {statusLabels[item.status]}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
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

export default ReportPage;

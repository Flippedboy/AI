import { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import {
  MessageSquare,
  Users,
  BookOpen,
  Clock,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { logger } from '@/utils/logger';
import { dashboard } from '@/api';
import type {
  DashboardMetrics,
  ChatTrendItem,
  HotQuestion,
  KnowledgeUsageItem,
} from '@shared/api.interface';
import MetricCard from './MetricCard';

const CHART_COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#2563eb', '#1d4ed8', '#0ea5e9', '#06b6d4', '#14b8a6', '#f59e0b', '#ef4444'];

const DashboardPage = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [chatTrend, setChatTrend] = useState<ChatTrendItem[]>([]);
  const [hotQuestions, setHotQuestions] = useState<HotQuestion[]>([]);
  const [knowledgeUsage, setKnowledgeUsage] = useState<KnowledgeUsageItem[]>([]);
  const [trendDimension, setTrendDimension] = useState<'day' | 'week'>('day');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [metricsRes, trendRes, hotRes, usageRes] = await Promise.all([
          dashboard.getDashboardMetrics(),
          dashboard.getChatTrend({ dimension: trendDimension, days: 30 }),
          dashboard.getHotQuestions(10),
          dashboard.getKnowledgeUsage(),
        ]);
        setMetrics(metricsRes);
        setChatTrend(trendRes.items);
        setHotQuestions(hotRes.items);
        setKnowledgeUsage(usageRes.items);
      } catch (error) {
        logger.error('加载看板数据失败', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [trendDimension]);

  const lineOption: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(30, 41, 59, 0.95)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      textStyle: { color: '#e2e8f0' },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: chatTrend.map((item) => item.date.slice(5)),
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      axisLabel: { color: '#94a3b8', fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
      axisLabel: { color: '#94a3b8', fontSize: 11 },
    },
    series: [
      {
        name: '对话数',
        type: 'line',
        smooth: true,
        data: chatTrend.map((item) => item.count),
        lineStyle: { color: '#3b82f6', width: 2 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.02)' },
            ],
          },
        },
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { color: '#3b82f6' },
      },
    ],
  };

  const barOption: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(30, 41, 59, 0.95)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      textStyle: { color: '#e2e8f0' },
      axisPointer: { type: 'shadow' },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
      axisLabel: { color: '#94a3b8', fontSize: 11 },
    },
    yAxis: {
      type: 'category',
      data: hotQuestions.map((q) => q.question).reverse(),
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      axisLabel: { color: '#cbd5e1', fontSize: 11 },
    },
    series: [
      {
        name: '次数',
        type: 'bar',
        data: hotQuestions.map((q) => q.count).reverse(),
        barWidth: 16,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: '#2563eb' },
              { offset: 1, color: '#60a5fa' },
            ],
          },
          borderRadius: [0, 4, 4, 0],
        },
      },
    ],
  };

  const pieOption: EChartsOption = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(30, 41, 59, 0.95)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      textStyle: { color: '#e2e8f0' },
      formatter: (params: any) => `${params.name}<br/>占比: ${params.value}%`,
    },
    legend: {
      type: 'scroll',
      bottom: 0,
      textStyle: { color: '#94a3b8', fontSize: 11 },
      itemWidth: 10,
      itemHeight: 10,
    },
    series: [
      {
        name: '知识库引用',
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        label: { show: false },
        emphasis: {
          label: { show: false },
        },
        data: knowledgeUsage.map((item, index) => ({
          value: item.percentage,
          name: item.docName.length > 15 ? item.docName.slice(0, 15) + '...' : item.docName,
          itemStyle: { color: CHART_COLORS[index % CHART_COLORS.length] },
        })),
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="对话总数"
          value={metrics?.totalChats || 0}
          suffix="次"
          growth={metrics?.chatGrowthRate || 0}
          icon={<MessageSquare className="size-5" />}
          color="blue"
        />
        <MetricCard
          title="活跃用户"
          value={metrics?.totalUsers || 0}
          suffix="人"
          growth={metrics?.userGrowthRate || 0}
          icon={<Users className="size-5" />}
          color="green"
        />
        <MetricCard
          title="知识库文档"
          value={metrics?.totalKnowledgeDocs || 0}
          suffix="篇"
          growth={0}
          icon={<BookOpen className="size-5" />}
          color="purple"
        />
        <MetricCard
          title="平均响应"
          value={metrics?.averageResponseTime || 0}
          suffix="ms"
          growth={-0.3}
          isTime
          icon={<Clock className="size-5" />}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">对话趋势</h3>
            <div className="flex gap-1">
              <button
                onClick={() => setTrendDimension('day')}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  trendDimension === 'day'
                    ? 'bg-primary text-white'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                日
              </button>
              <button
                onClick={() => setTrendDimension('week')}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  trendDimension === 'week'
                    ? 'bg-primary text-white'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                周
              </button>
            </div>
          </div>
          <ReactECharts option={lineOption} theme="dark" className="h-[300px]" />
        </div>

        <div className="glass rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">热门问题 Top10</h3>
          <ReactECharts option={barOption} theme="dark" className="h-[300px]" />
        </div>
      </div>

      <div className="glass rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-4">知识库引用分布</h3>
        <ReactECharts option={pieOption} theme="dark" className="h-[320px]" />
      </div>
    </div>
  );
};

export default DashboardPage;

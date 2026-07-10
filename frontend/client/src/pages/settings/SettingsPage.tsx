import { useState, useEffect } from 'react';
import { Cpu, BookOpen, Palette, Save, Sun, Moon, Type } from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { system } from '@/api';
import type { SystemConfig } from '@shared/api.interface';

const SettingsPage = () => {
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [saving, setSaving] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [systemPrompt, setSystemPrompt] = useState('你是智扫通智能客服助手，专门回答扫地机器人相关问题。');
  const [similarityThreshold, setSimilarityThreshold] = useState(0.75);
  const [topK, setTopK] = useState(5);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const loadConfigs = async () => {
      try {
        const result = await system.getSystemConfigs();
        setConfigs(result.items);

        const tempConfig = result.items.find((c) => c.key === 'model_temperature');
        if (tempConfig) setTemperature(parseFloat(tempConfig.value));

        const tokensConfig = result.items.find((c) => c.key === 'model_max_tokens');
        if (tokensConfig) setMaxTokens(parseInt(tokensConfig.value, 10));

        const promptConfig = result.items.find((c) => c.key === 'model_system_prompt');
        if (promptConfig) setSystemPrompt(promptConfig.value);

        const thresholdConfig = result.items.find((c) => c.key === 'knowledge_threshold');
        if (thresholdConfig) setSimilarityThreshold(parseFloat(thresholdConfig.value));

        const topKConfig = result.items.find((c) => c.key === 'knowledge_top_k');
        if (topKConfig) setTopK(parseInt(topKConfig.value, 10));
      } catch (error) {
        logger.error('加载系统配置失败', error);
      }
    };

    loadConfigs();

    const savedTheme = localStorage.getItem('app-theme') as 'dark' | 'light' | null;
    if (savedTheme) setTheme(savedTheme);

    const savedFontSize = localStorage.getItem('app-font-size') as 'small' | 'medium' | 'large' | null;
    if (savedFontSize) setFontSize(savedFontSize);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await system.updateSystemConfigs({
        configs: [
          { key: 'model_temperature', value: String(temperature) },
          { key: 'model_max_tokens', value: String(maxTokens) },
          { key: 'model_system_prompt', value: systemPrompt },
          { key: 'knowledge_threshold', value: String(similarityThreshold) },
          { key: 'knowledge_top_k', value: String(topK) },
        ],
      });
      toast.success('配置保存成功');
    } catch (error) {
      logger.error('保存配置失败', error);
      toast.error('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleThemeChange = (checked: boolean) => {
    const newTheme = checked ? 'light' : 'dark';
    setIsTransitioning(true);
    setTimeout(() => {
      setTheme(newTheme);
      localStorage.setItem('app-theme', newTheme);
      document.documentElement.classList.toggle('light-theme', newTheme === 'light');
      setTimeout(() => setIsTransitioning(false), 300);
    }, 150);
  };

  const handleFontSizeChange = (value: string) => {
    const size = value as 'small' | 'medium' | 'large';
    setFontSize(size);
    localStorage.setItem('app-font-size', size);

    const root = document.documentElement;
    root.classList.remove('font-small', 'font-medium', 'font-large');
    root.classList.add(`font-${size}`);
  };

  const getTemperatureLabel = (value: number) => {
    if (value < 0.3) return '精确';
    if (value < 0.7) return '平衡';
    return '创意';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {isTransitioning && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-50 pointer-events-none transition-opacity duration-300" />
      )}

      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="size-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center">
            <Cpu className="size-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">模型配置</h2>
            <p className="text-sm text-muted-foreground">调整 AI 模型生成参数</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-foreground">温度 (Temperature)</Label>
              <span className="text-sm text-primary font-medium">
                {temperature} - {getTemperatureLabel(temperature)}
              </span>
            </div>
            <Slider
              value={[temperature]}
              onValueChange={(value) => setTemperature(value[0])}
              min={0}
              max={1}
              step={0.1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              较低的值使回答更精确，较高的值使回答更有创意
            </p>
          </div>

          <div className="space-y-3">
            <Label className="text-foreground">最大 Token 数</Label>
            <Input
              type="number"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value, 10) || 0)}
              className="bg-card border-white/10 text-foreground"
            />
            <p className="text-xs text-muted-foreground">
              AI 生成回复的最大 token 数量，建议 512-4096
            </p>
          </div>

          <div className="space-y-3">
            <Label className="text-foreground">系统提示词</Label>
            <Textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={4}
              className="bg-card border-white/10 text-foreground resize-none"
            />
            <p className="text-xs text-muted-foreground">
              定义 AI 助手的角色和行为准则
            </p>
          </div>
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="size-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-500/5 flex items-center justify-center">
            <BookOpen className="size-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">知识库配置</h2>
            <p className="text-sm text-muted-foreground">调整知识库检索策略</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-foreground">相似度阈值</Label>
              <span className="text-sm text-primary font-medium">{similarityThreshold}</span>
            </div>
            <Slider
              value={[similarityThreshold]}
              onValueChange={(value) => setSimilarityThreshold(value[0])}
              min={0.5}
              max={1}
              step={0.05}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              低于此阈值的知识片段将被过滤，值越高匹配越精确
            </p>
          </div>

          <div className="space-y-3">
            <Label className="text-foreground">Top-K 召回数量</Label>
            <Input
              type="number"
              value={topK}
              onChange={(e) => setTopK(parseInt(e.target.value, 10) || 0)}
              className="bg-card border-white/10 text-foreground"
            />
            <p className="text-xs text-muted-foreground">
              每次检索返回的最相关文档数量，建议 3-10
            </p>
          </div>
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="size-10 rounded-lg bg-gradient-to-br from-green-500/20 to-green-500/5 flex items-center justify-center">
            <Palette className="size-5 text-green-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">界面设置</h2>
            <p className="text-sm text-muted-foreground">个性化您的使用体验</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <Moon className="size-5 text-muted-foreground" />
              ) : (
                <Sun className="size-5 text-muted-foreground" />
              )}
              <div>
                <Label className="text-foreground">主题模式</Label>
                <p className="text-xs text-muted-foreground">
                  当前：{theme === 'dark' ? '深色模式' : '浅色模式'}
                </p>
              </div>
            </div>
            <Switch
              checked={theme === 'light'}
              onCheckedChange={handleThemeChange}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Type className="size-5 text-muted-foreground" />
              <div>
                <Label className="text-foreground">字体大小</Label>
                <p className="text-xs text-muted-foreground">调整界面文字大小</p>
              </div>
            </div>
            <Select value={fontSize} onValueChange={handleFontSizeChange}>
              <SelectTrigger className="w-[140px] bg-card border-white/10 text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-white/10 text-foreground">
                <SelectItem value="small">小</SelectItem>
                <SelectItem value="medium">标准</SelectItem>
                <SelectItem value="large">大</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
        >
          <Save className="size-4 mr-2" />
          {saving ? '保存中...' : '保存配置'}
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;

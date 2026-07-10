import { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number;
  suffix?: string;
  growth: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange';
  isTime?: boolean;
}

const colorMap = {
  blue: 'from-blue-500/20 to-blue-500/5 text-blue-400',
  green: 'from-green-500/20 to-green-500/5 text-green-400',
  purple: 'from-purple-500/20 to-purple-500/5 text-purple-400',
  orange: 'from-orange-500/20 to-orange-500/5 text-orange-400',
};

const MetricCard = ({ title, value, suffix, growth, icon, color, isTime }: MetricCardProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) {
      setDisplayValue(value);
      return;
    }
    hasAnimated.current = true;

    const duration = 1000;
    const startTime = Date.now();
    const startValue = 0;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(startValue + (value - startValue) * easeProgress));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  const formatValue = (num: number) => {
    if (isTime) return num.toLocaleString();
    if (num >= 10000) return (num / 10000).toFixed(1) + '万';
    return num.toLocaleString();
  };

  const isPositive = growth >= 0;

  return (
    <div className="glass rounded-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5">
      <div className="flex items-start justify-between mb-4">
        <div className={`size-10 rounded-lg bg-gradient-to-br ${colorMap[color]} flex items-center justify-center`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? (
            <TrendingUp className="size-3" />
          ) : (
            <TrendingDown className="size-3" />
          )}
          <span>{Math.abs(growth)}%</span>
        </div>
      </div>
      <div className="text-3xl font-bold text-foreground mb-1">
        {formatValue(displayValue)}
        <span className="text-sm font-normal text-muted-foreground ml-1">{suffix}</span>
      </div>
      <div className="text-sm text-muted-foreground">{title}</div>
    </div>
  );
};

export default MetricCard;

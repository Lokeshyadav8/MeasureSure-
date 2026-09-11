import React from 'react';
import { LucideIcon, CheckCircle2 } from 'lucide-react';

interface MetricStatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  accentColor: string;
  bgColor?: string;
  borderColor?: string;
  onClick?: () => void;
  className?: string;
}

export const MetricStatCard: React.FC<MetricStatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  accentColor,
  bgColor = 'bg-white',
  borderColor = 'border-slate-300',
  onClick,
  className = ''
}) => {
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-2xl border ${bgColor} ${borderColor} shadow-xs transition-all ${
        onClick ? 'cursor-pointer hover:border-slate-400 hover:shadow-sm' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-wider text-slate-800">
          {title}
        </span>
        <div className={`p-2 rounded-xl ${accentColor}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-2 text-2xl font-black text-slate-950 tracking-tight">
        {value}
      </div>
      <p className="mt-0.5 text-xs text-slate-700 font-bold">
        {subtitle}
      </p>
    </div>
  );
};

interface PassRateGaugeCardProps {
  passRatePercentage: number;
  totalVerified: number;
  totalFailed: number;
  className?: string;
}

export const PassRateGaugeCard: React.FC<PassRateGaugeCardProps> = ({
  passRatePercentage,
  totalVerified,
  totalFailed,
  className = ''
}) => {
  const strokeDashoffset = 282.7 - (282.7 * passRatePercentage) / 100;

  return (
    <div className={`p-5 rounded-2xl bg-slate-900 text-white shadow-md border border-slate-800 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
            Compliance & Pass Rate
          </span>
          <div className="mt-1 text-3xl font-black text-white tracking-tight">
            {passRatePercentage}%
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 font-medium text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              {totalVerified} Passed
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium text-rose-300">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              {totalFailed} Failed
            </span>
          </div>
        </div>

        {/* Circular Progress Gauge */}
        <div className="relative w-18 h-18 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              className="text-slate-800"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              className="text-emerald-400 transition-all duration-1000 ease-out"
              strokeWidth="8"
              strokeDasharray={282.7}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

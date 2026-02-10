import { TrendingUp, BookOpen, Award, Target, GraduationCap } from 'lucide-react';
import { AcademicRecord, getDegreeClass } from '@/lib/grading';
import { cn } from '@/lib/utils';

interface StatsCardsProps {
  record: AcademicRecord;
}

export const StatsCards = ({ record }: StatsCardsProps) => {
  const stats = [
    {
      label: 'Current CGPA',
      value: record.cgpa.toFixed(2),
      subValue: 'of 5.00',
      icon: TrendingUp,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      progress: (record.cgpa / 5) * 100,
    },
    {
      label: 'Credits Registered',
      value: record.totalTCR.toString(),
      subValue: 'TCR',
      icon: BookOpen,
      color: 'text-info',
      bgColor: 'bg-info/10',
    },
    {
      label: 'Credits Earned',
      value: record.totalTCE.toString(),
      subValue: 'TCE',
      icon: Target,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'Degree Class',
      value: record.degreeClass,
      subValue: record.cgpa > 0 ? 'Projected' : 'Add courses',
      icon: record.cgpa >= 4.5 ? Award : GraduationCap,
      color: record.cgpa >= 4.5 ? 'text-accent' : 'text-muted-foreground',
      bgColor: record.cgpa >= 4.5 ? 'bg-accent/10' : 'bg-muted',
      isText: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className="stat-card animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={cn('p-2 rounded-md', stat.bgColor)}>
              <stat.icon className={cn('w-4 h-4', stat.color)} />
            </div>
            {stat.progress !== undefined && (
              <span className="text-xs text-muted-foreground">
                {stat.progress.toFixed(0)}%
              </span>
            )}
          </div>
          
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p
              className={cn(
                'font-semibold',
                stat.isText ? 'text-base' : 'text-xl',
                stat.isText ? 'text-foreground' : stat.color
              )}
            >
              {stat.value}
            </p>
            <p className="text-xs text-muted-foreground">{stat.subValue}</p>
          </div>

          {stat.progress !== undefined && (
            <div className="mt-3 h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${Math.min(stat.progress, 100)}%` }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
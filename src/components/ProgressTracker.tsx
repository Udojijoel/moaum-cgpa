import { TrendingUp, TrendingDown, Minus, BookOpen, Award, Target } from 'lucide-react';
import { Semester, calculateCGPA, getDegreeClass } from '@/lib/grading';
import { cn } from '@/lib/utils';

interface ProgressTrackerProps {
  semesters: Semester[];
}

export const ProgressTracker = ({ semesters }: ProgressTrackerProps) => {
  // Calculate running CGPA for each semester
  const progressData = semesters.map((semester, index) => {
    const previousSemesters = semesters.slice(0, index + 1);
    const cgpaStats = calculateCGPA(previousSemesters);
    const previousCGPA = index > 0 
      ? calculateCGPA(semesters.slice(0, index)).cgpa 
      : 0;
    
    const cgpaChange = index > 0 ? cgpaStats.cgpa - previousCGPA : 0;
    
    return {
      ...semester,
      cumulativeCGPA: cgpaStats.cgpa,
      cumulativeTCR: cgpaStats.totalTCR,
      cumulativeTCE: cgpaStats.totalTCE,
      cgpaChange,
      degreeClass: getDegreeClass(cgpaStats.cgpa),
    };
  });

  if (progressData.length === 0) {
    return (
      <div className="card-elevated p-8 text-center animate-slide-up">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Progress Data</h3>
        <p className="text-muted-foreground">
          Add semesters and courses to track your academic progress over time.
        </p>
      </div>
    );
  }

  const latestProgress = progressData[progressData.length - 1];
  const totalCourses = semesters.reduce((sum, sem) => sum + sem.courses.length, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card animate-slide-up">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <span className="text-sm text-muted-foreground">Current CGPA</span>
          </div>
          <p className="text-3xl font-bold text-accent">{latestProgress.cumulativeCGPA.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground">{latestProgress.degreeClass}</p>
        </div>

        <div className="stat-card animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Semesters Completed</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{semesters.length}</p>
          <p className="text-sm text-muted-foreground">{totalCourses} courses total</p>
        </div>

        <div className="stat-card animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-success/10">
              <Target className="w-5 h-5 text-success" />
            </div>
            <span className="text-sm text-muted-foreground">Credits Earned</span>
          </div>
          <p className="text-3xl font-bold text-success">{latestProgress.cumulativeTCE}</p>
          <p className="text-sm text-muted-foreground">of {latestProgress.cumulativeTCR} registered</p>
        </div>

        <div className="stat-card animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-info/10">
              <Award className="w-5 h-5 text-info" />
            </div>
            <span className="text-sm text-muted-foreground">Pass Rate</span>
          </div>
          <p className="text-3xl font-bold text-info">
            {latestProgress.cumulativeTCR > 0
              ? ((latestProgress.cumulativeTCE / latestProgress.cumulativeTCR) * 100).toFixed(0)
              : 0}%
          </p>
          <p className="text-sm text-muted-foreground">credits passed</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="card-elevated p-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
        <h3 className="text-lg font-semibold mb-6">Academic Timeline</h3>
        
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-6">
            {progressData.map((item, index) => {
              const trend = item.cgpaChange > 0 ? 'up' : item.cgpaChange < 0 ? 'down' : 'stable';
              
              return (
                <div key={item.id} className="relative pl-12">
                  {/* Timeline dot */}
                  <div
                    className={cn(
                      'absolute left-2 w-5 h-5 rounded-full border-2 border-background flex items-center justify-center',
                      index === progressData.length - 1 ? 'bg-accent' : 'bg-primary'
                    )}
                  >
                    {index === progressData.length - 1 && (
                      <div className="w-2 h-2 rounded-full bg-background" />
                    )}
                  </div>

                  <div className="p-4 bg-muted/30 rounded-lg border hover:border-primary/50 transition-colors">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{item.name}</h4>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            {item.level} Level
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.session}</p>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Semester GPA */}
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">GPA</p>
                          <p className="text-lg font-bold">{item.gpa.toFixed(2)}</p>
                        </div>

                        {/* CGPA with trend */}
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">CGPA</p>
                          <div className="flex items-center gap-1">
                            <p className="text-lg font-bold text-accent">
                              {item.cumulativeCGPA.toFixed(2)}
                            </p>
                            {index > 0 && (
                              <div
                                className={cn(
                                  'flex items-center',
                                  trend === 'up' && 'text-success',
                                  trend === 'down' && 'text-destructive',
                                  trend === 'stable' && 'text-muted-foreground'
                                )}
                              >
                                {trend === 'up' && <TrendingUp className="w-4 h-4" />}
                                {trend === 'down' && <TrendingDown className="w-4 h-4" />}
                                {trend === 'stable' && <Minus className="w-4 h-4" />}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Credits */}
                        <div className="text-center min-w-[60px]">
                          <p className="text-xs text-muted-foreground">Credits</p>
                          <p className="text-lg font-medium">
                            <span className="text-success">{item.tce}</span>
                            <span className="text-muted-foreground">/{item.tcr}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Course count */}
                    <div className="mt-3 pt-3 border-t flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.courses.length} course{item.courses.length !== 1 ? 's' : ''}
                      </span>
                      <span className="text-muted-foreground">
                        TWGP: {item.twgp}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

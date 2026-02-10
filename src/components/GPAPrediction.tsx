import { useState } from 'react';
import { Target, TrendingUp, AlertTriangle, CheckCircle2, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { AcademicRecord, calculateRequiredGPA, getDegreeClass, DEGREE_CLASSES } from '@/lib/grading';
import { cn } from '@/lib/utils';

interface GPAPredictionProps {
  record: AcademicRecord;
}

export const GPAPrediction = ({ record }: GPAPredictionProps) => {
  const [targetCGPA, setTargetCGPA] = useState(4.5);
  const [upcomingCredits, setUpcomingCredits] = useState(24);
  const [result, setResult] = useState<{
    requiredGPA: number;
    achievable: boolean;
    message: string;
  } | null>(null);

  const handleCalculate = () => {
    const prediction = calculateRequiredGPA(
      record.totalTWGP,
      record.totalTCR,
      targetCGPA,
      upcomingCredits
    );
    setResult(prediction);
  };

  const targetClass = getDegreeClass(targetCGPA);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="card-elevated p-6 animate-slide-up">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-accent/10">
              <Target className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">GPA Prediction</h3>
              <p className="text-sm text-muted-foreground">
                Calculate the GPA you need to achieve your target CGPA
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Current Stats */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Current Academic Standing</p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xl font-bold text-foreground">{record.cgpa.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">CGPA</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{record.totalTCR}</p>
                  <p className="text-xs text-muted-foreground">TCR</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{record.totalTWGP}</p>
                  <p className="text-xs text-muted-foreground">TWGP</p>
                </div>
              </div>
            </div>

            {/* Target CGPA */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Target CGPA</Label>
                <div className="text-right">
                  <span className="text-2xl font-bold text-accent">{targetCGPA.toFixed(2)}</span>
                  <p className="text-xs text-muted-foreground">{targetClass}</p>
                </div>
              </div>
              <Slider
                value={[targetCGPA]}
                onValueChange={(value) => setTargetCGPA(value[0])}
                min={1}
                max={5}
                step={0.01}
                className="mb-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                {DEGREE_CLASSES.slice(0, 5).reverse().map((dc) => (
                  <span key={dc.class}>{dc.min}</span>
                ))}
              </div>
            </div>

            {/* Upcoming Credits */}
            <div>
              <Label htmlFor="upcomingCredits">Upcoming Semester Credit Units</Label>
              <Input
                id="upcomingCredits"
                type="number"
                value={upcomingCredits}
                onChange={(e) => setUpcomingCredits(parseInt(e.target.value) || 0)}
                min={1}
                max={40}
                className="mt-2"
                placeholder="e.g., 24"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter the total credit units you plan to register
              </p>
            </div>

            <Button onClick={handleCalculate} className="w-full gap-2">
              <Calculator className="w-4 h-4" />
              Calculate Required GPA
            </Button>
          </div>
        </div>

        {/* Results Section */}
        <div className="card-elevated p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Prediction Result</h3>
              <p className="text-sm text-muted-foreground">
                Your calculated requirements
              </p>
            </div>
          </div>

          {result ? (
            <div className="space-y-6">
              {/* Required GPA Display */}
              <div
                className={cn(
                  'p-6 rounded-xl text-center',
                  result.achievable ? 'bg-success/10' : 'bg-destructive/10'
                )}
              >
                <div
                  className={cn(
                    'w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center',
                    result.achievable ? 'bg-success/20' : 'bg-destructive/20'
                  )}
                >
                  {result.achievable ? (
                    <CheckCircle2 className="w-8 h-8 text-success" />
                  ) : (
                    <AlertTriangle className="w-8 h-8 text-destructive" />
                  )}
                </div>

                <p className="text-sm text-muted-foreground mb-2">Required GPA</p>
                <p
                  className={cn(
                    'text-4xl font-bold',
                    result.achievable ? 'text-success' : 'text-destructive'
                  )}
                >
                  {result.requiredGPA > 5 ? '> 5.00' : result.requiredGPA.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground mt-2">out of 5.00</p>
              </div>

              {/* Message */}
              <div
                className={cn(
                  'p-4 rounded-lg border-l-4',
                  result.achievable
                    ? 'bg-success/5 border-success'
                    : 'bg-destructive/5 border-destructive'
                )}
              >
                <p className="text-sm">{result.message}</p>
              </div>

              {/* Projection */}
              {result.achievable && record.totalTCR > 0 && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-3">If you achieve this GPA:</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-background rounded-lg">
                      <p className="text-lg font-bold text-foreground">
                        {(record.totalTCR + upcomingCredits)}
                      </p>
                      <p className="text-xs text-muted-foreground">New Total TCR</p>
                    </div>
                    <div className="text-center p-3 bg-background rounded-lg">
                      <p className="text-lg font-bold text-accent">{targetCGPA.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Target CGPA</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Calculator className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                Set your target CGPA and upcoming credit units, then click calculate to see your required GPA.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tips Section */}
      <div className="card-elevated p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <h3 className="text-lg font-semibold mb-4">Tips for Improving Your CGPA</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: 'Focus on High Credit Courses',
              description: 'Prioritize courses with more credit units as they have a greater impact on your GPA.',
            },
            {
              title: 'Early Preparation',
              description: 'Start studying early in the semester to better understand course materials.',
            },
            {
              title: 'Seek Help',
              description: 'Don\'t hesitate to ask lecturers or peers for clarification on difficult topics.',
            },
            {
              title: 'Consistent Study Schedule',
              description: 'Maintain a regular study routine rather than cramming before exams.',
            },
          ].map((tip, index) => (
            <div key={index} className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium text-sm mb-2">{tip.title}</h4>
              <p className="text-xs text-muted-foreground">{tip.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

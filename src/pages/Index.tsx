import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, BookOpen, TrendingUp, Calculator, Target, FileText, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TopNavigation } from '@/components/TopNavigation';
import { StatsCards } from '@/components/StatsCards';
import { SemesterCard, AddSemesterDialog } from '@/components/SemesterCard';
import { GPATrendChart, CreditUnitsChart, GradeDistributionChart } from '@/components/Charts';
import { GPAPrediction } from '@/components/GPAPrediction';
import { ProgressTracker } from '@/components/ProgressTracker';
import { TranscriptView } from '@/components/TranscriptView';
import { useAcademicData } from '@/hooks/useAcademicData';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { GRADING_SCALE, DEGREE_CLASSES, getGradeColorClass } from '@/lib/grading';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const Index = () => {
  const navigate = useNavigate();
  const { user, profile: authProfile, loading: authLoading, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const [activeTab, setActiveTab] = useState('dashboard');
  const {
    profile,
    semesters,
    academicRecord,
    saveProfile,
    addSemester,
    updateSemester,
    deleteSemester,
    addCourse,
    updateCourse,
    deleteCourse,
  } = useAcademicData();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Redirect admin users to admin dashboard - they shouldn't use student features
  useEffect(() => {
    if (isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [isAdmin, navigate]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Failed to sign out');
    } else {
      toast.success('Signed out successfully');
      navigate('/auth');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            {semesters.length === 0 ? (
              <div className="bg-card rounded-md border shadow-sm p-12 text-center animate-fade-in">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <GraduationCap className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold mb-3 font-serif">Welcome to RFMOAU CGPA Calculator</h2>
                <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                  Calculate your Grade Point Average using the official Nigerian 5-point grading system. 
                  Track your academic progress throughout your university journey.
                </p>
                <Button onClick={() => setActiveTab('calculator')} className="gap-2" size="lg">
                  <Calculator className="w-5 h-5" />
                  Start Calculating
                </Button>
              </div>
            ) : (
              <>
                <StatsCards record={academicRecord} />
                
                <div className="grid lg:grid-cols-2 gap-6">
                  <GPATrendChart semesters={semesters} />
                  <GradeDistributionChart semesters={semesters} />
                </div>
                
                <CreditUnitsChart semesters={semesters} />

                {/* Quick Actions */}
                <div className="bg-card rounded-md border shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4 font-serif gold-border">Quick Actions</h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex flex-col items-center gap-2 hover:border-primary hover:bg-primary/5"
                      onClick={() => setActiveTab('calculator')}
                    >
                      <Calculator className="w-6 h-6 text-primary" />
                      <span className="text-sm font-medium">Add Courses</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex flex-col items-center gap-2 hover:border-accent hover:bg-accent/5"
                      onClick={() => setActiveTab('prediction')}
                    >
                      <Target className="w-6 h-6 text-accent" />
                      <span className="text-sm font-medium">Predict GPA</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex flex-col items-center gap-2 hover:border-success hover:bg-success/5"
                      onClick={() => setActiveTab('progress')}
                    >
                      <TrendingUp className="w-6 h-6 text-success" />
                      <span className="text-sm font-medium">View Progress</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex flex-col items-center gap-2 hover:border-info hover:bg-info/5"
                      onClick={() => setActiveTab('transcript')}
                    >
                      <FileText className="w-6 h-6 text-info" />
                      <span className="text-sm font-medium">Export Transcript</span>
                    </Button>
                  </div>
                </div>

                {/* Reference Cards */}
                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="bg-card rounded-md border shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4 font-serif gold-border">
                      RFMOAU Grading Scale
                    </h3>
                    <table className="academic-table">
                      <thead>
                        <tr>
                          <th>Grade</th>
                          <th>Score Range</th>
                          <th>Grade Point</th>
                        </tr>
                      </thead>
                      <tbody>
                        {GRADING_SCALE.map((grade) => (
                          <tr key={grade.grade}>
                            <td>
                              <span className={cn('grade-badge', getGradeColorClass(grade.grade))}>
                                {grade.grade}
                              </span>
                            </td>
                            <td>{grade.min} – {grade.max}%</td>
                            <td className="font-semibold">{grade.point}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-card rounded-md border shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4 font-serif gold-border">
                      Degree Classification
                    </h3>
                    <table className="academic-table">
                      <thead>
                        <tr>
                          <th>Classification</th>
                          <th>CGPA Range</th>
                        </tr>
                      </thead>
                      <tbody>
                        {DEGREE_CLASSES.slice(0, 5).map((deg) => (
                          <tr key={deg.class}>
                            <td className="font-medium flex items-center gap-2">
                              <Award className="w-4 h-4 text-accent" />
                              {deg.class}
                            </td>
                            <td>{deg.min.toFixed(2)} – {deg.max.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case 'calculator':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="page-header mb-0 pb-0 border-0">
                <h2 className="page-title">CGPA Calculator</h2>
                <p className="page-description">Add your courses and calculate your Grade Point Average</p>
              </div>
              <AddSemesterDialog onAddSemester={addSemester} />
            </div>

            <div className="section-divider" />

            <StatsCards record={academicRecord} />

            {semesters.length === 0 ? (
              <div className="bg-card rounded-md border shadow-sm p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2 font-serif">No Semesters Added</h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                  Create a semester to start entering your courses and calculating your GPA.
                </p>
                <AddSemesterDialog onAddSemester={addSemester} />
              </div>
            ) : (
              <div className="grid lg:grid-cols-2 gap-6">
                {semesters.map((semester, index) => (
                  <div key={semester.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                    <SemesterCard
                      semester={semester}
                      onAddCourse={addCourse}
                      onUpdateCourse={updateCourse}
                      onDeleteCourse={deleteCourse}
                      onDeleteSemester={deleteSemester}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'progress':
        return (
          <div className="space-y-6">
            <div className="page-header">
              <h2 className="page-title">Academic Progress</h2>
              <p className="page-description">Track your academic journey across all semesters</p>
            </div>
            <ProgressTracker semesters={semesters} />
          </div>
        );

      case 'prediction':
        return (
          <div className="space-y-6">
            <div className="page-header">
              <h2 className="page-title">GPA Prediction</h2>
              <p className="page-description">Calculate the GPA required to achieve your target CGPA</p>
            </div>
            <GPAPrediction record={academicRecord} />
          </div>
        );

      case 'transcript':
        return (
          <div className="space-y-6">
            <div className="page-header">
              <h2 className="page-title">Academic Transcript</h2>
              <p className="page-description">View and export your complete academic records</p>
            </div>
            <TranscriptView
              record={academicRecord}
              profile={profile}
              onSaveProfile={saveProfile}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        userName={authProfile?.full_name || user?.email}
        onSignOut={handleSignOut}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center justify-center gap-3">
              <GraduationCap className="w-5 h-5 text-accent" />
              <span className="font-serif font-semibold">Reverend Father Moses Orshio Adasu University</span>
              <span className="text-primary-foreground/50">•</span>
              <span className="text-sm text-primary-foreground/70">CGPA Calculator</span>
            </div>
            <a 
              href="/admin-login" 
              className="text-xs text-primary-foreground/40 hover:text-primary-foreground/70 transition-colors"
            >
              Admin Login
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

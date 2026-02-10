import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Users, RefreshCw, ShieldCheck, Download, FileSpreadsheet, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin, StudentData } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { StudentDataTable } from '@/components/StudentDataTable';

const COLORS = {
  male: 'hsl(200, 70%, 45%)',
  female: 'hsl(340, 70%, 55%)',
};

const GPA_COLORS = [
  'hsl(150, 60%, 35%)',   // First Class - green
  'hsl(200, 70%, 45%)',   // 2.1 - blue
  'hsl(42, 85%, 50%)',    // 2.2 - gold
  'hsl(30, 80%, 50%)',    // Third - orange
  'hsl(15, 75%, 55%)',    // Pass - red-orange
  'hsl(0, 72%, 51%)',     // Fail - red
];

const getClassification = (cgpa: number): string => {
  if (cgpa >= 4.5) return 'First Class';
  if (cgpa >= 3.5) return 'Second Class Upper';
  if (cgpa >= 2.4) return 'Second Class Lower';
  if (cgpa >= 1.5) return 'Third Class';
  if (cgpa >= 1.0) return 'Pass';
  return 'Fail';
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading, stats, statsLoading, refetchStats } = useAdmin();

  useEffect(() => {
    // Only redirect after loading is complete
    if (!adminLoading) {
      if (!user || !isAdmin) {
        navigate('/admin-login', { replace: true });
      }
    }
  }, [user, isAdmin, adminLoading, navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out successfully');
    navigate('/admin-login', { replace: true });
  };

  const exportToExcel = () => {
    if (!stats?.studentList || stats.studentList.length === 0) {
      toast.error('No data to export');
      return;
    }

    const exportData = stats.studentList.map((student: StudentData) => ({
      'Full Name': student.full_name || 'N/A',
      'Gender': student.gender ? student.gender.charAt(0).toUpperCase() + student.gender.slice(1) : 'N/A',
      'Faculty': student.faculty || 'N/A',
      'Department': student.department || 'N/A',
      'Level': student.level || 'N/A',
      'CGPA': student.cgpa.toFixed(2),
      'Total Credits': student.totalCredits,
      'Classification': getClassification(student.cgpa),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    
    // Auto-size columns
    const colWidths = Object.keys(exportData[0] || {}).map(key => ({ wch: Math.max(key.length + 2, 15) }));
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, `RFMOAU_Students_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Excel file downloaded successfully');
  };

  const exportToCSV = () => {
    if (!stats?.studentList || stats.studentList.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = ['Full Name', 'Gender', 'Faculty', 'Department', 'Level', 'CGPA', 'Total Credits', 'Classification'];
    const csvContent = [
      headers.join(','),
      ...stats.studentList.map((student: StudentData) => [
        `"${student.full_name || 'N/A'}"`,
        `"${student.gender ? student.gender.charAt(0).toUpperCase() + student.gender.slice(1) : 'N/A'}"`,
        `"${student.faculty || 'N/A'}"`,
        `"${student.department || 'N/A'}"`,
        `"${student.level || 'N/A'}"`,
        student.cgpa.toFixed(2),
        student.totalCredits,
        `"${getClassification(student.cgpa)}"`,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `RFMOAU_Students_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('CSV file downloaded successfully');
  };

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  const genderData = stats ? [
    { name: 'Male', value: stats.genderDistribution.male },
    { name: 'Female', value: stats.genderDistribution.female },
  ] : [];

  const malePercent = stats && stats.totalStudents > 0 
    ? ((stats.genderDistribution.male / stats.totalStudents) * 100).toFixed(1) 
    : '0';
  const femalePercent = stats && stats.totalStudents > 0 
    ? ((stats.genderDistribution.female / stats.totalStudents) * 100).toFixed(1) 
    : '0';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-foreground/10 border-2 border-accent flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-serif">Admin Dashboard</h1>
              <p className="text-sm text-primary-foreground/80">Student Statistics Overview</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              disabled={statsLoading || !stats?.studentList?.length}
              className="text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10 gap-2"
            >
              <Download className="w-4 h-4" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportToExcel}
              disabled={statsLoading || !stats?.studentList?.length}
              className="text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10 gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Excel
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={refetchStats}
              disabled={statsLoading}
              className="text-primary-foreground hover:bg-primary-foreground/10 gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${statsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-primary-foreground hover:bg-primary-foreground/10 gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {statsLoading && !stats ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-pulse text-muted-foreground">Loading statistics...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="stat-card-highlight">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm opacity-80">Total Students</p>
                      <p className="text-3xl font-bold font-serif">{stats?.totalStudents || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="stat-card">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-info/10 flex items-center justify-center">
                      <Users className="w-6 h-6 text-info" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Male Students</p>
                      <p className="text-2xl font-bold font-serif text-foreground">
                        {stats?.genderDistribution.male || 0}
                        <span className="text-sm font-normal text-muted-foreground ml-1">({malePercent}%)</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="stat-card">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center">
                      <Users className="w-6 h-6 text-pink-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Female Students</p>
                      <p className="text-2xl font-bold font-serif text-foreground">
                        {stats?.genderDistribution.female || 0}
                        <span className="text-sm font-normal text-muted-foreground ml-1">({femalePercent}%)</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="stat-card">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-success" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Departments</p>
                      <p className="text-2xl font-bold font-serif text-foreground">
                        {stats?.departmentCounts.length || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Gender Distribution Pie Chart */}
              <Card className="chart-card">
                <CardHeader>
                  <CardTitle className="font-serif gold-border">Gender Distribution</CardTitle>
                  <CardDescription>Breakdown of students by gender</CardDescription>
                </CardHeader>
                <CardContent>
                  {genderData.length > 0 && (genderData[0].value > 0 || genderData[1].value > 0) ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={genderData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                        >
                          <Cell fill={COLORS.male} />
                          <Cell fill={COLORS.female} />
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No data available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* GPA Distribution Bar Chart */}
              <Card className="chart-card">
                <CardHeader>
                  <CardTitle className="font-serif gold-border">GPA Distribution</CardTitle>
                  <CardDescription>Number of students in each classification</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats?.gpaRanges && stats.gpaRanges.some(r => r.count > 0) ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={stats.gpaRanges}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" />
                        <YAxis 
                          type="category" 
                          dataKey="range" 
                          width={180}
                          tick={{ fontSize: 11 }}
                        />
                        <Tooltip />
                        <Bar dataKey="count" name="Students">
                          {stats.gpaRanges.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={GPA_COLORS[index]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Average CGPA per Level Line Chart */}
              <Card className="chart-card">
                <CardHeader>
                  <CardTitle className="font-serif gold-border">Average CGPA by Level</CardTitle>
                  <CardDescription>Academic performance across different levels</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats?.levelCgpa && stats.levelCgpa.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart
                        data={stats.levelCgpa}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="level" />
                        <YAxis domain={[0, 5]} />
                        <Tooltip formatter={(value) => [(value as number).toFixed(2), 'Avg CGPA']} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="avgCgpa" 
                          name="Avg CGPA"
                          stroke="hsl(150, 60%, 35%)" 
                          strokeWidth={3}
                          dot={{ r: 6, fill: 'hsl(150, 60%, 35%)' }}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No data available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Students per Department */}
              <Card className="chart-card">
                <CardHeader>
                  <CardTitle className="font-serif gold-border">Students by Department</CardTitle>
                  <CardDescription>Top 10 departments by enrollment</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats?.departmentCounts && stats.departmentCounts.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={stats.departmentCounts}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="department" 
                          tick={{ fontSize: 10 }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" name="Students" fill="hsl(192, 62%, 19%)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Student Data Table */}
            <StudentDataTable 
              students={stats?.studentList || []} 
              loading={statsLoading} 
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;

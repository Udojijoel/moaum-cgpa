import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { Semester, getGradeDistribution, Course } from '@/lib/grading';
import { cn } from '@/lib/utils';

interface ChartsProps {
  semesters: Semester[];
}

const GRADE_COLORS = {
  A: 'hsl(160, 84%, 39%)',
  B: 'hsl(200, 80%, 50%)',
  C: 'hsl(45, 93%, 47%)',
  D: 'hsl(30, 90%, 55%)',
  E: 'hsl(12, 80%, 60%)',
  F: 'hsl(0, 72%, 51%)',
};

export const GPATrendChart = ({ semesters }: ChartsProps) => {
  let cumulativeTWGP = 0;
  let cumulativeTCR = 0;

  const data = semesters.map((sem, index) => {
    cumulativeTWGP += sem.twgp;
    cumulativeTCR += sem.tcr;
    const cgpa = cumulativeTCR > 0 ? cumulativeTWGP / cumulativeTCR : 0;

    return {
      name: `${sem.level}L ${sem.name.slice(0, 1)}S`,
      gpa: sem.gpa,
      cgpa: Number(cgpa.toFixed(2)),
      session: sem.session,
    };
  });

  if (data.length === 0) {
    return (
      <div className="chart-card">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">GPA & CGPA Trend</h3>
        <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
          Add semesters to see your GPA trend
        </div>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">GPA & CGPA Trend</h3>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gpaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(220, 70%, 35%)" stopOpacity={0.2} />
              <stop offset="95%" stopColor="hsl(220, 70%, 35%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="cgpaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(12, 80%, 60%)" stopOpacity={0.2} />
              <stop offset="95%" stopColor="hsl(12, 80%, 60%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 90%)" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11 }}
            stroke="hsl(220, 10%, 50%)"
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[0, 5]}
            tick={{ fontSize: 11 }}
            stroke="hsl(220, 10%, 50%)"
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(0, 0%, 100%)',
              border: '1px solid hsl(220, 20%, 90%)',
              borderRadius: '6px',
              fontSize: '12px',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Area
            type="monotone"
            dataKey="gpa"
            stroke="hsl(220, 70%, 35%)"
            fill="url(#gpaGradient)"
            strokeWidth={2}
            name="Semester GPA"
          />
          <Area
            type="monotone"
            dataKey="cgpa"
            stroke="hsl(12, 80%, 60%)"
            fill="url(#cgpaGradient)"
            strokeWidth={2}
            name="CGPA"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const CreditUnitsChart = ({ semesters }: ChartsProps) => {
  const data = semesters.map((sem) => ({
    name: `${sem.level}L ${sem.name.slice(0, 1)}S`,
    registered: sem.tcr,
    earned: sem.tce,
  }));

  if (data.length === 0) {
    return (
      <div className="chart-card">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Credit Units per Semester</h3>
        <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
          Add semesters to see credit distribution
        </div>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">Credit Units per Semester</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 90%)" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11 }}
            stroke="hsl(220, 10%, 50%)"
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            stroke="hsl(220, 10%, 50%)"
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(0, 0%, 100%)',
              border: '1px solid hsl(220, 20%, 90%)',
              borderRadius: '6px',
              fontSize: '12px',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Bar
            dataKey="registered"
            fill="hsl(220, 70%, 35%)"
            name="Registered (TCR)"
            radius={[3, 3, 0, 0]}
          />
          <Bar
            dataKey="earned"
            fill="hsl(160, 84%, 39%)"
            name="Earned (TCE)"
            radius={[3, 3, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const GradeDistributionChart = ({ semesters }: ChartsProps) => {
  const allCourses = semesters.flatMap((sem) => sem.courses);
  const distribution = getGradeDistribution(allCourses);

  const data = Object.entries(distribution)
    .filter(([_, count]) => count > 0)
    .map(([grade, count]) => ({
      name: grade,
      value: count,
      color: GRADE_COLORS[grade as keyof typeof GRADE_COLORS],
    }));

  if (data.length === 0) {
    return (
      <div className="chart-card">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Grade Distribution</h3>
        <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
          Add courses to see grade distribution
        </div>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="chart-card">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">Grade Distribution</h3>
      <div className="flex items-center">
        <ResponsiveContainer width="55%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={75}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(0, 0%, 100%)',
                border: '1px solid hsl(220, 20%, 90%)',
                borderRadius: '6px',
                fontSize: '12px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-1.5">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-muted-foreground">Grade {item.name}</span>
              </div>
              <span className="font-medium">
                {item.value} ({((item.value / total) * 100).toFixed(0)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
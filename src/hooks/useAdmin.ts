import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface StudentData {
  id: string;
  full_name: string | null;
  gender: string | null;
  faculty: string | null;
  department: string | null;
  level: string | null;
  cgpa: number;
  totalCredits: number;
}

interface StudentStats {
  totalStudents: number;
  genderDistribution: { male: number; female: number };
  departmentCounts: { department: string; count: number }[];
  gpaRanges: { range: string; count: number }[];
  levelCgpa: { level: string; avgCgpa: number }[];
  studentList: StudentData[];
}

export const useAdmin = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const checkAdminRole = async () => {
      // Wait for auth to finish loading before checking role
      if (authLoading) {
        return;
      }

      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .rpc('has_role', { _user_id: user.id, _role: 'admin' });

        if (error) throw error;
        setIsAdmin(data === true);
      } catch (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminRole();
  }, [user, authLoading]);

  // Fetch admin statistics
  const fetchStats = useCallback(async () => {
    if (!isAdmin) return;

    setStatsLoading(true);
    try {
      // Get all profiles with full details
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, gender, faculty, department, level');

      if (profilesError) throw profilesError;

      // Get all semesters with calculated CGPA per user
      const { data: semesters, error: semestersError } = await supabase
        .from('semesters')
        .select('user_id, twgp, tce');

      if (semestersError) throw semestersError;

      // Calculate statistics
      const totalStudents = profiles?.length || 0;

      // Gender distribution
      const genderDistribution = {
        male: profiles?.filter(p => p.gender === 'male').length || 0,
        female: profiles?.filter(p => p.gender === 'female').length || 0,
      };

      // Department counts
      const deptMap = new Map<string, number>();
      profiles?.forEach(p => {
        if (p.department) {
          deptMap.set(p.department, (deptMap.get(p.department) || 0) + 1);
        }
      });
      const departmentCounts = Array.from(deptMap.entries())
        .map(([department, count]) => ({ department, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Calculate CGPA per user
      const userCgpaMap = new Map<string, { totalTwgp: number; totalTce: number }>();
      semesters?.forEach(sem => {
        const existing = userCgpaMap.get(sem.user_id) || { totalTwgp: 0, totalTce: 0 };
        userCgpaMap.set(sem.user_id, {
          totalTwgp: existing.totalTwgp + Number(sem.twgp || 0),
          totalTce: existing.totalTce + (sem.tce || 0),
        });
      });

      // GPA ranges
      const gpaRanges = [
        { range: '4.50 - 5.00 (First Class)', min: 4.5, max: 5.0, count: 0 },
        { range: '3.50 - 4.49 (Second Class Upper)', min: 3.5, max: 4.49, count: 0 },
        { range: '2.40 - 3.49 (Second Class Lower)', min: 2.4, max: 3.49, count: 0 },
        { range: '1.50 - 2.39 (Third Class)', min: 1.5, max: 2.39, count: 0 },
        { range: '1.00 - 1.49 (Pass)', min: 1.0, max: 1.49, count: 0 },
        { range: '0.00 - 0.99 (Fail)', min: 0, max: 0.99, count: 0 },
      ];

      userCgpaMap.forEach(({ totalTwgp, totalTce }) => {
        if (totalTce > 0) {
          const cgpa = totalTwgp / totalTce;
          const rangeItem = gpaRanges.find(r => cgpa >= r.min && cgpa <= r.max);
          if (rangeItem) rangeItem.count++;
        }
      });

      // Average CGPA per level
      const levelCgpaMap = new Map<string, { totalCgpa: number; count: number }>();
      profiles?.forEach(p => {
        if (p.level && p.id) {
          const userStats = userCgpaMap.get(p.id);
          if (userStats && userStats.totalTce > 0) {
            const cgpa = userStats.totalTwgp / userStats.totalTce;
            const existing = levelCgpaMap.get(p.level) || { totalCgpa: 0, count: 0 };
            levelCgpaMap.set(p.level, {
              totalCgpa: existing.totalCgpa + cgpa,
              count: existing.count + 1,
            });
          }
        }
      });

      const levelCgpa = Array.from(levelCgpaMap.entries())
        .map(([level, { totalCgpa, count }]) => ({
          level,
          avgCgpa: count > 0 ? Number((totalCgpa / count).toFixed(2)) : 0,
        }))
        .sort((a, b) => {
          const levelOrder = ['100L', '200L', '300L', '400L', '500L', '600L'];
          return levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level);
        });

      // Build student list for export
      const studentList: StudentData[] = (profiles || []).map(p => {
        const userStats = userCgpaMap.get(p.id);
        const cgpa = userStats && userStats.totalTce > 0 
          ? userStats.totalTwgp / userStats.totalTce 
          : 0;
        return {
          id: p.id,
          full_name: p.full_name,
          gender: p.gender,
          faculty: p.faculty,
          department: p.department,
          level: p.level,
          cgpa: Number(cgpa.toFixed(2)),
          totalCredits: userStats?.totalTce || 0,
        };
      });

      setStats({
        totalStudents,
        genderDistribution,
        departmentCounts,
        gpaRanges: gpaRanges.map(r => ({ range: r.range, count: r.count })),
        levelCgpa,
        studentList,
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setStatsLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin, fetchStats]);

  return {
    isAdmin,
    loading,
    stats,
    statsLoading,
    refetchStats: fetchStats,
  };
};

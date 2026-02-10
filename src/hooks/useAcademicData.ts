import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  Semester,
  Course,
  AcademicRecord,
  calculateSemesterStats,
  calculateCGPA,
  getDegreeClass,
  scoreToGrade,
  scoreToGradePoint,
  calculateWGP,
} from '@/lib/grading';
import { StudentProfile } from '@/lib/storage';
import { toast } from 'sonner';

export const useAcademicData = () => {
  const { user, profile: authProfile } = useAuth();
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [academicRecord, setAcademicRecord] = useState<AcademicRecord>({
    semesters: [],
    cgpa: 0,
    totalTCR: 0,
    totalTCE: 0,
    totalTWGP: 0,
    degreeClass: 'Not Classified',
  });
  const [loading, setLoading] = useState(true);

  // Convert auth profile to StudentProfile format for compatibility
  const profile: StudentProfile | null = authProfile ? {
    name: authProfile.full_name,
    matricNumber: authProfile.matric_number || '',
    department: authProfile.department,
    faculty: authProfile.faculty,
    level: authProfile.level || '',
    admissionYear: authProfile.admission_year || '',
  } : null;

  // Fetch semesters and courses from Supabase
  const fetchData = useCallback(async () => {
    if (!user) {
      setSemesters([]);
      setLoading(false);
      return;
    }

    try {
      // Fetch semesters
      const { data: semesterData, error: semesterError } = await supabase
        .from('semesters')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (semesterError) throw semesterError;

      // Fetch all courses for this user's semesters
      const semesterIds = semesterData?.map(s => s.id) || [];
      
      let coursesData: any[] = [];
      if (semesterIds.length > 0) {
        const { data: courses, error: coursesError } = await supabase
          .from('courses')
          .select('*')
          .in('semester_id', semesterIds)
          .order('created_at', { ascending: true });

        if (coursesError) throw coursesError;
        coursesData = courses || [];
      }

      // Map to Semester type with courses attached
      const mappedSemesters: Semester[] = (semesterData || []).map((sem) => {
        const semesterCourses: Course[] = coursesData
          .filter((c) => c.semester_id === sem.id)
          .map((c) => ({
            id: c.id,
            code: c.code,
            title: c.title,
            creditUnits: c.credit_units,
            score: c.score,
            grade: c.grade,
            gradePoint: c.grade_point,
            weightedGradePoint: c.weighted_grade_point,
            semesterId: c.semester_id,
          }));

        return {
          id: sem.id,
          name: sem.name,
          level: sem.level,
          session: sem.session,
          courses: semesterCourses,
          tcr: sem.tcr,
          tce: sem.tce,
          twgp: Number(sem.twgp),
          gpa: Number(sem.gpa),
        };
      });

      setSemesters(mappedSemesters);
    } catch (error: any) {
      console.error('Error fetching academic data:', error);
      toast.error('Failed to load academic data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Refresh academic record when semesters change
  const refreshAcademicRecord = useCallback(() => {
    const cgpaStats = calculateCGPA(semesters);
    const degreeClass = getDegreeClass(cgpaStats.cgpa);
    
    setAcademicRecord({
      semesters,
      cgpa: cgpaStats.cgpa,
      totalTCR: cgpaStats.totalTCR,
      totalTCE: cgpaStats.totalTCE,
      totalTWGP: cgpaStats.totalTWGP,
      degreeClass,
    });
  }, [semesters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    refreshAcademicRecord();
  }, [refreshAcademicRecord]);

  const saveProfile = useCallback(async (profileData: StudentProfile) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          matric_number: profileData.matricNumber || null,
          level: profileData.level || null,
          admission_year: profileData.admissionYear || null,
        })
        .eq('id', user.id);

      if (error) throw error;
      toast.success('Profile updated');
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    }
  }, [user]);

  const addSemester = useCallback(async (name: string, level: string, session: string): Promise<Semester> => {
    if (!user) throw new Error('Not authenticated');

    const newSemester: Semester = {
      id: crypto.randomUUID(),
      name,
      level,
      session,
      courses: [],
      tcr: 0,
      tce: 0,
      twgp: 0,
      gpa: 0,
    };

    try {
      const { data, error } = await supabase
        .from('semesters')
        .insert({
          id: newSemester.id,
          user_id: user.id,
          name,
          level,
          session,
          tcr: 0,
          tce: 0,
          twgp: 0,
          gpa: 0,
        })
        .select()
        .single();

      if (error) throw error;

      setSemesters((prev) => [...prev, newSemester]);
      toast.success('Semester added');
      return newSemester;
    } catch (error: any) {
      console.error('Error adding semester:', error);
      toast.error('Failed to add semester');
      throw error;
    }
  }, [user]);

  const updateSemester = useCallback(async (semesterId: string, updates: Partial<Semester>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('semesters')
        .update({
          name: updates.name,
          level: updates.level,
          session: updates.session,
        })
        .eq('id', semesterId);

      if (error) throw error;

      setSemesters((prev) =>
        prev.map((sem) => (sem.id === semesterId ? { ...sem, ...updates } : sem))
      );
    } catch (error: any) {
      console.error('Error updating semester:', error);
      toast.error('Failed to update semester');
    }
  }, [user]);

  const deleteSemester = useCallback(async (semesterId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('semesters')
        .delete()
        .eq('id', semesterId);

      if (error) throw error;

      setSemesters((prev) => prev.filter((s) => s.id !== semesterId));
      toast.success('Semester deleted');
    } catch (error: any) {
      console.error('Error deleting semester:', error);
      toast.error('Failed to delete semester');
    }
  }, [user]);

  const updateSemesterStats = useCallback(async (semesterId: string, courses: Course[]) => {
    const stats = calculateSemesterStats(courses);
    
    try {
      await supabase
        .from('semesters')
        .update({
          tcr: stats.tcr,
          tce: stats.tce,
          twgp: stats.twgp,
          gpa: stats.gpa,
        })
        .eq('id', semesterId);
    } catch (error) {
      console.error('Error updating semester stats:', error);
    }
  }, []);

  const addCourse = useCallback(async (
    semesterId: string,
    code: string,
    title: string,
    creditUnits: number,
    score: number
  ): Promise<Course> => {
    if (!user) throw new Error('Not authenticated');

    const grade = scoreToGrade(score);
    const gradePoint = scoreToGradePoint(score);
    const weightedGradePoint = calculateWGP(creditUnits, gradePoint);

    const newCourse: Course = {
      id: crypto.randomUUID(),
      code,
      title,
      creditUnits,
      score,
      grade,
      gradePoint,
      weightedGradePoint,
      semesterId,
    };

    try {
      const { error } = await supabase
        .from('courses')
        .insert({
          id: newCourse.id,
          semester_id: semesterId,
          code,
          title,
          credit_units: creditUnits,
          score,
          grade,
          grade_point: gradePoint,
          weighted_grade_point: weightedGradePoint,
        });

      if (error) throw error;

      setSemesters((prev) => {
        const newSemesters = prev.map((sem) => {
          if (sem.id === semesterId) {
            const newCourses = [...sem.courses, newCourse];
            const stats = calculateSemesterStats(newCourses);
            updateSemesterStats(semesterId, newCourses);
            return { ...sem, courses: newCourses, ...stats };
          }
          return sem;
        });
        return newSemesters;
      });

      toast.success('Course added');
      return newCourse;
    } catch (error: any) {
      console.error('Error adding course:', error);
      toast.error('Failed to add course');
      throw error;
    }
  }, [user, updateSemesterStats]);

  const updateCourse = useCallback(async (
    semesterId: string,
    courseId: string,
    updates: Partial<Omit<Course, 'id' | 'semesterId' | 'grade' | 'gradePoint' | 'weightedGradePoint'>>
  ) => {
    if (!user) return;

    // Get current course to merge updates
    const semester = semesters.find((s) => s.id === semesterId);
    const currentCourse = semester?.courses.find((c) => c.id === courseId);
    if (!currentCourse) return;

    const newScore = updates.score ?? currentCourse.score;
    const newCreditUnits = updates.creditUnits ?? currentCourse.creditUnits;
    const grade = scoreToGrade(newScore);
    const gradePoint = scoreToGradePoint(newScore);
    const weightedGradePoint = calculateWGP(newCreditUnits, gradePoint);

    try {
      const { error } = await supabase
        .from('courses')
        .update({
          code: updates.code ?? currentCourse.code,
          title: updates.title ?? currentCourse.title,
          credit_units: newCreditUnits,
          score: newScore,
          grade,
          grade_point: gradePoint,
          weighted_grade_point: weightedGradePoint,
        })
        .eq('id', courseId);

      if (error) throw error;

      setSemesters((prev) => {
        const newSemesters = prev.map((sem) => {
          if (sem.id === semesterId) {
            const newCourses = sem.courses.map((course) => {
              if (course.id === courseId) {
                return {
                  ...course,
                  ...updates,
                  grade,
                  gradePoint,
                  weightedGradePoint,
                };
              }
              return course;
            });
            const stats = calculateSemesterStats(newCourses);
            updateSemesterStats(semesterId, newCourses);
            return { ...sem, courses: newCourses, ...stats };
          }
          return sem;
        });
        return newSemesters;
      });

      toast.success('Course updated');
    } catch (error: any) {
      console.error('Error updating course:', error);
      toast.error('Failed to update course');
    }
  }, [user, semesters, updateSemesterStats]);

  const deleteCourse = useCallback(async (semesterId: string, courseId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) throw error;

      setSemesters((prev) => {
        const newSemesters = prev.map((sem) => {
          if (sem.id === semesterId) {
            const newCourses = sem.courses.filter((c) => c.id !== courseId);
            const stats = calculateSemesterStats(newCourses);
            updateSemesterStats(semesterId, newCourses);
            return { ...sem, courses: newCourses, ...stats };
          }
          return sem;
        });
        return newSemesters;
      });

      toast.success('Course deleted');
    } catch (error: any) {
      console.error('Error deleting course:', error);
      toast.error('Failed to delete course');
    }
  }, [user, updateSemesterStats]);

  const clearAll = useCallback(async () => {
    if (!user) return;

    try {
      // Delete all semesters (courses will cascade)
      const { error } = await supabase
        .from('semesters')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setSemesters([]);
      toast.success('All data cleared');
    } catch (error: any) {
      console.error('Error clearing data:', error);
      toast.error('Failed to clear data');
    }
  }, [user]);

  return {
    profile,
    semesters,
    academicRecord,
    loading,
    saveProfile,
    addSemester,
    updateSemester,
    deleteSemester,
    addCourse,
    updateCourse,
    deleteCourse,
    clearAll,
    refreshAcademicRecord,
    refetch: fetchData,
  };
};

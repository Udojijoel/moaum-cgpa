/**
 * RFMOAU/Nigerian University Grading System
 * 5-Point CGPA Scale
 */

export interface Course {
  id: string;
  code: string;
  title: string;
  creditUnits: number;
  score: number;
  grade: string;
  gradePoint: number;
  weightedGradePoint: number;
  semesterId: string;
}

export interface Semester {
  id: string;
  name: string;
  level: string;
  session: string;
  courses: Course[];
  tcr: number; // Total Credit Units Registered
  tce: number; // Total Credit Units Earned
  twgp: number; // Total Weighted Grade Point
  gpa: number;
}

export interface AcademicRecord {
  semesters: Semester[];
  cgpa: number;
  totalTCR: number;
  totalTCE: number;
  totalTWGP: number;
  degreeClass: string;
}

// Grading Scale (RFMOAU / Nigerian Standard)
export const GRADING_SCALE = [
  { min: 70, max: 100, grade: 'A', point: 5 },
  { min: 60, max: 69, grade: 'B', point: 4 },
  { min: 50, max: 59, grade: 'C', point: 3 },
  { min: 45, max: 49, grade: 'D', point: 2 },
  { min: 40, max: 44, grade: 'E', point: 1 },
  { min: 0, max: 39, grade: 'F', point: 0 },
];

// Degree Classifications
export const DEGREE_CLASSES = [
  { min: 4.50, max: 5.00, class: 'First Class Honours' },
  { min: 3.50, max: 4.49, class: 'Second Class Upper' },
  { min: 2.40, max: 3.49, class: 'Second Class Lower' },
  { min: 1.50, max: 2.39, class: 'Third Class' },
  { min: 1.00, max: 1.49, class: 'Pass' },
  { min: 0.00, max: 0.99, class: 'Fail' },
];

// Levels
export const LEVELS = ['100', '200', '300', '400', '500'];

// Sessions (dynamic based on current year)
export const generateSessions = (): string[] => {
  const currentYear = new Date().getFullYear();
  const sessions: string[] = [];
  for (let i = currentYear - 5; i <= currentYear + 2; i++) {
    sessions.push(`${i}/${i + 1}`);
  }
  return sessions;
};

/**
 * Convert score to letter grade
 */
export const scoreToGrade = (score: number): string => {
  const gradeEntry = GRADING_SCALE.find(
    (g) => score >= g.min && score <= g.max
  );
  return gradeEntry?.grade || 'F';
};

/**
 * Convert score to grade point
 */
export const scoreToGradePoint = (score: number): number => {
  const gradeEntry = GRADING_SCALE.find(
    (g) => score >= g.min && score <= g.max
  );
  return gradeEntry?.point || 0;
};

/**
 * Calculate Weighted Grade Point (WGP)
 * WGP = Credit Unit × Grade Point
 */
export const calculateWGP = (creditUnits: number, gradePoint: number): number => {
  return creditUnits * gradePoint;
};

/**
 * Check if a course is passed (grade ≥ E, i.e., point ≥ 1)
 */
export const isPassed = (gradePoint: number): boolean => {
  return gradePoint >= 1;
};

/**
 * Calculate semester statistics
 */
export const calculateSemesterStats = (courses: Course[]): {
  tcr: number;
  tce: number;
  twgp: number;
  gpa: number;
} => {
  const tcr = courses.reduce((sum, course) => sum + course.creditUnits, 0);
  const tce = courses
    .filter((course) => isPassed(course.gradePoint))
    .reduce((sum, course) => sum + course.creditUnits, 0);
  const twgp = courses.reduce((sum, course) => sum + course.weightedGradePoint, 0);
  const gpa = tcr > 0 ? twgp / tcr : 0;

  return { tcr, tce, twgp, gpa: Number(gpa.toFixed(2)) };
};

/**
 * Calculate CGPA from all semesters
 */
export const calculateCGPA = (semesters: Semester[]): {
  cgpa: number;
  totalTCR: number;
  totalTCE: number;
  totalTWGP: number;
} => {
  const totalTCR = semesters.reduce((sum, sem) => sum + sem.tcr, 0);
  const totalTCE = semesters.reduce((sum, sem) => sum + sem.tce, 0);
  const totalTWGP = semesters.reduce((sum, sem) => sum + sem.twgp, 0);
  const cgpa = totalTCR > 0 ? totalTWGP / totalTCR : 0;

  return {
    cgpa: Number(cgpa.toFixed(2)),
    totalTCR,
    totalTCE,
    totalTWGP,
  };
};

/**
 * Get degree classification based on CGPA
 */
export const getDegreeClass = (cgpa: number): string => {
  const degreeClass = DEGREE_CLASSES.find(
    (d) => cgpa >= d.min && cgpa <= d.max
  );
  return degreeClass?.class || 'Not Classified';
};

/**
 * Calculate required GPA to achieve target CGPA
 * Required GPA = (Target CGPA × Total Credits After Completion − Current TWGP) ÷ Upcoming Semester Credit Units
 */
export const calculateRequiredGPA = (
  currentTWGP: number,
  currentTCR: number,
  targetCGPA: number,
  upcomingCredits: number
): { requiredGPA: number; achievable: boolean; message: string } => {
  if (upcomingCredits <= 0) {
    return { requiredGPA: 0, achievable: false, message: 'Please enter valid credit units.' };
  }

  const totalCreditsAfter = currentTCR + upcomingCredits;
  const targetTWGP = targetCGPA * totalCreditsAfter;
  const requiredTWGP = targetTWGP - currentTWGP;
  const requiredGPA = requiredTWGP / upcomingCredits;

  if (requiredGPA > 5.0) {
    return {
      requiredGPA: Number(requiredGPA.toFixed(2)),
      achievable: false,
      message: 'Target CGPA not achievable this semester. You would need a GPA higher than 5.00.',
    };
  }

  if (requiredGPA < 0) {
    return {
      requiredGPA: 0,
      achievable: true,
      message: 'You have already exceeded your target CGPA!',
    };
  }

  return {
    requiredGPA: Number(requiredGPA.toFixed(2)),
    achievable: true,
    message: `You need a GPA of ${requiredGPA.toFixed(2)} to achieve your target CGPA.`,
  };
};

/**
 * Get grade color class
 */
export const getGradeColorClass = (grade: string): string => {
  const colorMap: Record<string, string> = {
    A: 'grade-a',
    B: 'grade-b',
    C: 'grade-c',
    D: 'grade-d',
    E: 'grade-e',
    F: 'grade-f',
  };
  return colorMap[grade] || 'grade-f';
};

/**
 * Get grade distribution from courses
 */
export const getGradeDistribution = (courses: Course[]): Record<string, number> => {
  const distribution: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
  courses.forEach((course) => {
    if (distribution[course.grade] !== undefined) {
      distribution[course.grade]++;
    }
  });
  return distribution;
};

/**
 * Generate unique ID
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

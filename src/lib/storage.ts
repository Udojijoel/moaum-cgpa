import { Semester, Course, AcademicRecord, calculateSemesterStats, calculateCGPA, getDegreeClass } from './grading';

const STORAGE_KEY = 'bsu_cgpa_data';

export interface StudentProfile {
  name: string;
  matricNumber: string;
  department: string;
  faculty: string;
  level: string;
  admissionYear: string;
}

export interface StoredData {
  profile: StudentProfile | null;
  semesters: Semester[];
  lastUpdated: string;
}

const defaultData: StoredData = {
  profile: null,
  semesters: [],
  lastUpdated: new Date().toISOString(),
};

export const loadData = (): StoredData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
  return defaultData;
};

export const saveData = (data: StoredData): void => {
  try {
    data.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

export const saveProfile = (profile: StudentProfile): void => {
  const data = loadData();
  data.profile = profile;
  saveData(data);
};

export const getProfile = (): StudentProfile | null => {
  return loadData().profile;
};

export const saveSemesters = (semesters: Semester[]): void => {
  const data = loadData();
  data.semesters = semesters;
  saveData(data);
};

export const getSemesters = (): Semester[] => {
  return loadData().semesters;
};

export const addSemester = (semester: Semester): Semester[] => {
  const data = loadData();
  data.semesters.push(semester);
  saveData(data);
  return data.semesters;
};

export const updateSemester = (updatedSemester: Semester): Semester[] => {
  const data = loadData();
  const index = data.semesters.findIndex((s) => s.id === updatedSemester.id);
  if (index !== -1) {
    // Recalculate semester stats
    const stats = calculateSemesterStats(updatedSemester.courses);
    data.semesters[index] = { ...updatedSemester, ...stats };
    saveData(data);
  }
  return data.semesters;
};

export const deleteSemester = (semesterId: string): Semester[] => {
  const data = loadData();
  data.semesters = data.semesters.filter((s) => s.id !== semesterId);
  saveData(data);
  return data.semesters;
};

export const addCourseToSemester = (semesterId: string, course: Course): Semester[] => {
  const data = loadData();
  const semester = data.semesters.find((s) => s.id === semesterId);
  if (semester) {
    semester.courses.push(course);
    const stats = calculateSemesterStats(semester.courses);
    Object.assign(semester, stats);
    saveData(data);
  }
  return data.semesters;
};

export const updateCourse = (semesterId: string, updatedCourse: Course): Semester[] => {
  const data = loadData();
  const semester = data.semesters.find((s) => s.id === semesterId);
  if (semester) {
    const courseIndex = semester.courses.findIndex((c) => c.id === updatedCourse.id);
    if (courseIndex !== -1) {
      semester.courses[courseIndex] = updatedCourse;
      const stats = calculateSemesterStats(semester.courses);
      Object.assign(semester, stats);
      saveData(data);
    }
  }
  return data.semesters;
};

export const deleteCourse = (semesterId: string, courseId: string): Semester[] => {
  const data = loadData();
  const semester = data.semesters.find((s) => s.id === semesterId);
  if (semester) {
    semester.courses = semester.courses.filter((c) => c.id !== courseId);
    const stats = calculateSemesterStats(semester.courses);
    Object.assign(semester, stats);
    saveData(data);
  }
  return data.semesters;
};

export const getAcademicRecord = (): AcademicRecord => {
  const semesters = getSemesters();
  const cgpaStats = calculateCGPA(semesters);
  const degreeClass = getDegreeClass(cgpaStats.cgpa);

  return {
    semesters,
    cgpa: cgpaStats.cgpa,
    totalTCR: cgpaStats.totalTCR,
    totalTCE: cgpaStats.totalTCE,
    totalTWGP: cgpaStats.totalTWGP,
    degreeClass,
  };
};

export const clearAllData = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

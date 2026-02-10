export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type AppRole = 'admin' | 'moderator' | 'user';
export type GenderType = 'male' | 'female';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          matric_number: string | null
          full_name: string
          gender: GenderType
          faculty: string
          department: string
          level: string | null
          admission_year: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          matric_number?: string | null
          full_name: string
          gender: GenderType
          faculty: string
          department: string
          level?: string | null
          admission_year?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          matric_number?: string | null
          full_name?: string
          gender?: GenderType
          faculty?: string
          department?: string
          level?: string | null
          admission_year?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      semesters: {
        Row: {
          id: string
          user_id: string
          name: string
          level: string
          session: string
          tcr: number
          tce: number
          twgp: number
          gpa: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          level: string
          session: string
          tcr?: number
          tce?: number
          twgp?: number
          gpa?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          level?: string
          session?: string
          tcr?: number
          tce?: number
          twgp?: number
          gpa?: number
          created_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          semester_id: string
          code: string
          title: string
          credit_units: number
          score: number
          grade: string
          grade_point: number
          weighted_grade_point: number
          created_at: string
        }
        Insert: {
          id?: string
          semester_id: string
          code: string
          title: string
          credit_units: number
          score: number
          grade: string
          grade_point: number
          weighted_grade_point: number
          created_at?: string
        }
        Update: {
          id?: string
          semester_id?: string
          code?: string
          title?: string
          credit_units?: number
          score?: number
          grade?: string
          grade_point?: number
          weighted_grade_point?: number
          created_at?: string
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: AppRole
        }
        Insert: {
          id?: string
          user_id: string
          role: AppRole
        }
        Update: {
          id?: string
          user_id?: string
          role?: AppRole
        }
      }
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: AppRole
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: AppRole
      gender_type: GenderType
    }
  }
}

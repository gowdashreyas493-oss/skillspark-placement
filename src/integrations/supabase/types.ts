export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          created_at: string | null
          created_by: string
          expires_at: string | null
          id: string
          message: string
          priority: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string
          expires_at?: string | null
          id?: string
          message: string
          priority?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          expires_at?: string | null
          id?: string
          message?: string
          priority?: string | null
          title?: string
        }
        Relationships: []
      }
      aptitude_test_questions: {
        Row: {
          category: string
          correct_answer: string
          created_at: string | null
          difficulty: string
          id: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question: string
        }
        Insert: {
          category: string
          correct_answer: string
          created_at?: string | null
          difficulty: string
          id?: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question: string
        }
        Update: {
          category?: string
          correct_answer?: string
          created_at?: string | null
          difficulty?: string
          id?: string
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          question?: string
        }
        Relationships: []
      }
      aptitude_test_results: {
        Row: {
          accuracy: number | null
          category: string
          completed_at: string | null
          id: string
          rank: number | null
          score: number | null
          student_id: string
          time_taken: number | null
          total_questions: number | null
        }
        Insert: {
          accuracy?: number | null
          category: string
          completed_at?: string | null
          id?: string
          rank?: number | null
          score?: number | null
          student_id: string
          time_taken?: number | null
          total_questions?: number | null
        }
        Update: {
          accuracy?: number | null
          category?: string
          completed_at?: string | null
          id?: string
          rank?: number | null
          score?: number | null
          student_id?: string
          time_taken?: number | null
          total_questions?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "aptitude_test_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_attempts: {
        Row: {
          assessment_id: string
          completed_at: string | null
          feedback: string | null
          id: string
          percentage: number | null
          score: number | null
          started_at: string | null
          student_id: string
          total_marks: number | null
        }
        Insert: {
          assessment_id: string
          completed_at?: string | null
          feedback?: string | null
          id?: string
          percentage?: number | null
          score?: number | null
          started_at?: string | null
          student_id: string
          total_marks?: number | null
        }
        Update: {
          assessment_id?: string
          completed_at?: string | null
          feedback?: string | null
          id?: string
          percentage?: number | null
          score?: number | null
          started_at?: string | null
          student_id?: string
          total_marks?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_attempts_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_attempts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          title: string
          total_marks: number | null
          type: Database["public"]["Enums"]["assessment_type"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          title: string
          total_marks?: number | null
          type: Database["public"]["Enums"]["assessment_type"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          title?: string
          total_marks?: number | null
          type?: Database["public"]["Enums"]["assessment_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      code_submissions: {
        Row: {
          code: string
          id: string
          language: string
          output: string | null
          status: string | null
          student_id: string
          submitted_at: string | null
        }
        Insert: {
          code: string
          id?: string
          language: string
          output?: string | null
          status?: string | null
          student_id: string
          submitted_at?: string | null
        }
        Update: {
          code?: string
          id?: string
          language?: string
          output?: string | null
          status?: string | null
          student_id?: string
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "code_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          industry: string | null
          logo_url: string | null
          name: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      mock_interview_questions: {
        Row: {
          created_at: string | null
          difficulty: string
          domain: string
          expected_answer: string | null
          id: string
          question: string
        }
        Insert: {
          created_at?: string | null
          difficulty: string
          domain: string
          expected_answer?: string | null
          id?: string
          question: string
        }
        Update: {
          created_at?: string | null
          difficulty?: string
          domain?: string
          expected_answer?: string | null
          id?: string
          question?: string
        }
        Relationships: []
      }
      mock_interview_results: {
        Row: {
          completed_at: string | null
          domain: string
          feedback: string | null
          id: string
          score: number | null
          student_id: string
          total_questions: number | null
        }
        Insert: {
          completed_at?: string | null
          domain: string
          feedback?: string | null
          id?: string
          score?: number | null
          student_id: string
          total_questions?: number | null
        }
        Update: {
          completed_at?: string | null
          domain?: string
          feedback?: string | null
          id?: string
          score?: number | null
          student_id?: string
          total_questions?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mock_interview_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      placement_drives: {
        Row: {
          company_id: string
          created_at: string | null
          created_by: string | null
          deadline: string | null
          description: string | null
          drive_date: string | null
          eligible_branches: string[] | null
          id: string
          is_active: boolean | null
          min_cgpa: number | null
          package_offered: number | null
          role: string
          title: string
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          drive_date?: string | null
          eligible_branches?: string[] | null
          id?: string
          is_active?: boolean | null
          min_cgpa?: number | null
          package_offered?: number | null
          role: string
          title: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          drive_date?: string | null
          eligible_branches?: string[] | null
          id?: string
          is_active?: boolean | null
          min_cgpa?: number | null
          package_offered?: number | null
          role?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "placement_drives_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "placement_drives_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      student_applications: {
        Row: {
          applied_at: string | null
          drive_id: string
          id: string
          notes: string | null
          status: Database["public"]["Enums"]["placement_status"] | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          applied_at?: string | null
          drive_id: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["placement_status"] | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          applied_at?: string | null
          drive_id?: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["placement_status"] | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_applications_drive_id_fkey"
            columns: ["drive_id"]
            isOneToOne: false
            referencedRelation: "placement_drives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_applications_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_profiles: {
        Row: {
          batch_year: number
          branch: string
          certifications: Json | null
          cgpa: number | null
          created_at: string | null
          github_url: string | null
          id: string
          linkedin_url: string | null
          resume_url: string | null
          roll_number: string
          skills: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          batch_year: number
          branch: string
          certifications?: Json | null
          cgpa?: number | null
          created_at?: string | null
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          resume_url?: string | null
          roll_number: string
          skills?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          batch_year?: number
          branch?: string
          certifications?: Json | null
          cgpa?: number | null
          created_at?: string | null
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          resume_url?: string | null
          roll_number?: string
          skills?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "student"
      assessment_type: "mock_interview" | "aptitude_test" | "coding_challenge"
      placement_status:
        | "eligible"
        | "applied"
        | "shortlisted"
        | "selected"
        | "rejected"
        | "not_eligible"
      user_role: "student" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "student"],
      assessment_type: ["mock_interview", "aptitude_test", "coding_challenge"],
      placement_status: [
        "eligible",
        "applied",
        "shortlisted",
        "selected",
        "rejected",
        "not_eligible",
      ],
      user_role: ["student", "admin"],
    },
  },
} as const

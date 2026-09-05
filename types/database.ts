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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      allocation_rules: {
        Row: {
          color: string | null
          created_at: string
          icon: string | null
          id: string
          is_active: boolean
          name: string
          percentage: number
          sort_order: number
          target_account_id: string | null
          target_category_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          percentage: number
          sort_order?: number
          target_account_id?: string | null
          target_category_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          percentage?: number
          sort_order?: number
          target_account_id?: string | null
          target_category_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      income_sources: {
        Row: {
          account_id: string | null
          amount: number
          category_id: string | null
          created_at: string
          currency: string
          frequency: string
          hours_per_period: number
          id: string
          is_active: boolean
          name: string
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount?: number
          category_id?: string | null
          created_at?: string
          currency?: string
          frequency?: string
          hours_per_period?: number
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          category_id?: string | null
          created_at?: string
          currency?: string
          frequency?: string
          hours_per_period?: number
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      accounts: {
        Row: {
          archived_at: string | null
          created_at: string
          currency: string
          current_balance: number
          description: string | null
          id: string
          initial_balance: number
          is_active: boolean
          name: string
          type: Database["public"]["Enums"]["account_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          currency?: string
          current_balance?: number
          description?: string | null
          id?: string
          initial_balance?: number
          is_active?: boolean
          name: string
          type?: Database["public"]["Enums"]["account_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          currency?: string
          current_balance?: number
          description?: string | null
          id?: string
          initial_balance?: number
          is_active?: boolean
          name?: string
          type?: Database["public"]["Enums"]["account_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          metadata: Json | null
          record_id: string | null
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          metadata?: Json | null
          record_id?: string | null
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          record_id?: string | null
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      budgets: {
        Row: {
          account_id: string | null
          amount: number
          category_id: string | null
          created_at: string
          end_date: string
          id: string
          period_type: Database["public"]["Enums"]["budget_period_type"]
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          category_id?: string | null
          created_at?: string
          end_date: string
          id?: string
          period_type: Database["public"]["Enums"]["budget_period_type"]
          start_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          category_id?: string | null
          created_at?: string
          end_date?: string
          id?: string
          period_type?: Database["public"]["Enums"]["budget_period_type"]
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budgets_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "v_account_expense_breakdown"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "budgets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "v_category_expense_breakdown"
            referencedColumns: ["category_id"]
          },
          {
            foreignKeyName: "budgets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "v_income_by_category"
            referencedColumns: ["category_id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          is_active: boolean
          kind: Database["public"]["Enums"]["category_kind"]
          name: string
          scope: Database["public"]["Enums"]["category_scope"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          kind: Database["public"]["Enums"]["category_kind"]
          name: string
          scope?: Database["public"]["Enums"]["category_scope"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          kind?: Database["public"]["Enums"]["category_kind"]
          name?: string
          scope?: Database["public"]["Enums"]["category_scope"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      debts: {
        Row: {
          created_at: string
          currency: string
          description: string | null
          due_date: string | null
          id: string
          original_amount: number
          person_name: string
          remaining_amount: number
          status: Database["public"]["Enums"]["debt_status"]
          type: Database["public"]["Enums"]["debt_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          description?: string | null
          due_date?: string | null
          id?: string
          original_amount: number
          person_name: string
          remaining_amount: number
          status?: Database["public"]["Enums"]["debt_status"]
          type: Database["public"]["Enums"]["debt_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          description?: string | null
          due_date?: string | null
          id?: string
          original_amount?: number
          person_name?: string
          remaining_amount?: number
          status?: Database["public"]["Enums"]["debt_status"]
          type?: Database["public"]["Enums"]["debt_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          account_id: string | null
          created_at: string
          currency: string
          current_amount: number
          deadline: string | null
          description: string | null
          id: string
          name: string
          priority: Database["public"]["Enums"]["goal_priority"]
          status: Database["public"]["Enums"]["goal_status"]
          target_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          created_at?: string
          currency?: string
          current_amount?: number
          deadline?: string | null
          description?: string | null
          id?: string
          name: string
          priority?: Database["public"]["Enums"]["goal_priority"]
          status?: Database["public"]["Enums"]["goal_status"]
          target_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          created_at?: string
          currency?: string
          current_amount?: number
          deadline?: string | null
          description?: string | null
          id?: string
          name?: string
          priority?: Database["public"]["Enums"]["goal_priority"]
          status?: Database["public"]["Enums"]["goal_status"]
          target_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "v_account_expense_breakdown"
            referencedColumns: ["account_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          preferred_currency: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          preferred_currency?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          preferred_currency?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          account_id: string | null
          archived_at: string | null
          budget: number | null
          created_at: string
          currency: string
          description: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          archived_at?: string | null
          budget?: number | null
          created_at?: string
          currency?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          archived_at?: string | null
          budget?: number | null
          created_at?: string
          currency?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "v_account_expense_breakdown"
            referencedColumns: ["account_id"]
          },
        ]
      }
      recurring_transactions: {
        Row: {
          account_id: string
          amount: number
          category_id: string | null
          created_at: string
          description: string | null
          destination_account_id: string | null
          end_date: string | null
          frequency: Database["public"]["Enums"]["recurring_frequency"]
          id: string
          is_active: boolean
          next_occurrence: string
          project_id: string | null
          start_date: string
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id: string
          amount: number
          category_id?: string | null
          created_at?: string
          description?: string | null
          destination_account_id?: string | null
          end_date?: string | null
          frequency: Database["public"]["Enums"]["recurring_frequency"]
          id?: string
          is_active?: boolean
          next_occurrence: string
          project_id?: string | null
          start_date: string
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string
          amount?: number
          category_id?: string | null
          created_at?: string
          description?: string | null
          destination_account_id?: string | null
          end_date?: string | null
          frequency?: Database["public"]["Enums"]["recurring_frequency"]
          id?: string
          is_active?: boolean
          next_occurrence?: string
          project_id?: string | null
          start_date?: string
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "v_account_expense_breakdown"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "recurring_transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "v_category_expense_breakdown"
            referencedColumns: ["category_id"]
          },
          {
            foreignKeyName: "recurring_transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "v_income_by_category"
            referencedColumns: ["category_id"]
          },
          {
            foreignKeyName: "recurring_transactions_destination_account_id_fkey"
            columns: ["destination_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_transactions_destination_account_id_fkey"
            columns: ["destination_account_id"]
            isOneToOne: false
            referencedRelation: "v_account_expense_breakdown"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "recurring_transactions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_transactions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_summary"
            referencedColumns: ["project_id"]
          },
        ]
      }
      transactions: {
        Row: {
          account_id: string
          amount: number
          category_id: string | null
          created_at: string
          currency: string
          debt_id: string | null
          deleted_at: string | null
          description: string | null
          destination_account_id: string | null
          goal_id: string | null
          id: string
          project_id: string | null
          transaction_date: string
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id: string
          amount: number
          category_id?: string | null
          created_at?: string
          currency?: string
          debt_id?: string | null
          deleted_at?: string | null
          description?: string | null
          destination_account_id?: string | null
          goal_id?: string | null
          id?: string
          project_id?: string | null
          transaction_date?: string
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string
          amount?: number
          category_id?: string | null
          created_at?: string
          currency?: string
          debt_id?: string | null
          deleted_at?: string | null
          description?: string | null
          destination_account_id?: string | null
          goal_id?: string | null
          id?: string
          project_id?: string | null
          transaction_date?: string
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "v_account_expense_breakdown"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "v_category_expense_breakdown"
            referencedColumns: ["category_id"]
          },
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "v_income_by_category"
            referencedColumns: ["category_id"]
          },
          {
            foreignKeyName: "transactions_debt_id_fkey"
            columns: ["debt_id"]
            isOneToOne: false
            referencedRelation: "debts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_debt_id_fkey"
            columns: ["debt_id"]
            isOneToOne: false
            referencedRelation: "v_debt_summary"
            referencedColumns: ["debt_id"]
          },
          {
            foreignKeyName: "transactions_destination_account_id_fkey"
            columns: ["destination_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_destination_account_id_fkey"
            columns: ["destination_account_id"]
            isOneToOne: false
            referencedRelation: "v_account_expense_breakdown"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "transactions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "v_goal_progress"
            referencedColumns: ["goal_id"]
          },
          {
            foreignKeyName: "transactions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_summary"
            referencedColumns: ["project_id"]
          },
        ]
      }
    }
    Views: {
      v_account_expense_breakdown: {
        Row: {
          account: string | null
          account_id: string | null
          total: number | null
          user_id: string | null
        }
        Relationships: []
      }
      v_budget_vs_actual: {
        Row: {
          account_id: string | null
          actual_expense: number | null
          budget_amount: number | null
          budget_id: string | null
          category_id: string | null
          end_date: string | null
          period_type: Database["public"]["Enums"]["budget_period_type"] | null
          start_date: string | null
          user_id: string | null
        }
        Insert: {
          account_id?: string | null
          actual_expense?: never
          budget_amount?: number | null
          budget_id?: string | null
          category_id?: string | null
          end_date?: string | null
          period_type?: Database["public"]["Enums"]["budget_period_type"] | null
          start_date?: string | null
          user_id?: string | null
        }
        Update: {
          account_id?: string | null
          actual_expense?: never
          budget_amount?: number | null
          budget_id?: string | null
          category_id?: string | null
          end_date?: string | null
          period_type?: Database["public"]["Enums"]["budget_period_type"] | null
          start_date?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budgets_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "v_account_expense_breakdown"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "budgets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "v_category_expense_breakdown"
            referencedColumns: ["category_id"]
          },
          {
            foreignKeyName: "budgets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "v_income_by_category"
            referencedColumns: ["category_id"]
          },
        ]
      }
      v_cash_flow_projection: {
        Row: {
          amount: number | null
          description: string | null
          next_occurrence: string | null
          recurring_id: string | null
          type: Database["public"]["Enums"]["transaction_type"] | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          description?: string | null
          next_occurrence?: string | null
          recurring_id?: string | null
          type?: Database["public"]["Enums"]["transaction_type"] | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          description?: string | null
          next_occurrence?: string | null
          recurring_id?: string | null
          type?: Database["public"]["Enums"]["transaction_type"] | null
          user_id?: string | null
        }
        Relationships: []
      }
      v_category_expense_breakdown: {
        Row: {
          category: string | null
          category_id: string | null
          percentage: number | null
          total: number | null
          user_id: string | null
        }
        Relationships: []
      }
      v_daily_summary: {
        Row: {
          daily_expense: number | null
          daily_income: number | null
          daily_net: number | null
          day: string | null
          user_id: string | null
        }
        Relationships: []
      }
      v_debt_summary: {
        Row: {
          debt_id: string | null
          original_amount: number | null
          paid_amount: number | null
          person_name: string | null
          remaining_amount: number | null
          status: Database["public"]["Enums"]["debt_status"] | null
          type: Database["public"]["Enums"]["debt_type"] | null
          user_id: string | null
        }
        Insert: {
          debt_id?: string | null
          original_amount?: number | null
          paid_amount?: never
          person_name?: string | null
          remaining_amount?: number | null
          status?: Database["public"]["Enums"]["debt_status"] | null
          type?: Database["public"]["Enums"]["debt_type"] | null
          user_id?: string | null
        }
        Update: {
          debt_id?: string | null
          original_amount?: number | null
          paid_amount?: never
          person_name?: string | null
          remaining_amount?: number | null
          status?: Database["public"]["Enums"]["debt_status"] | null
          type?: Database["public"]["Enums"]["debt_type"] | null
          user_id?: string | null
        }
        Relationships: []
      }
      v_financial_diary: {
        Row: {
          account_name: string | null
          amount: number | null
          category_name: string | null
          currency: string | null
          description: string | null
          destination_account_name: string | null
          id: string | null
          project_name: string | null
          transaction_date: string | null
          type: Database["public"]["Enums"]["transaction_type"] | null
          user_id: string | null
        }
        Relationships: []
      }
      v_goal_progress: {
        Row: {
          current_amount: number | null
          goal_id: string | null
          name: string | null
          progress_percentage: number | null
          remaining_amount: number | null
          status: Database["public"]["Enums"]["goal_status"] | null
          target_amount: number | null
          user_id: string | null
        }
        Insert: {
          current_amount?: number | null
          goal_id?: string | null
          name?: string | null
          progress_percentage?: never
          remaining_amount?: never
          status?: Database["public"]["Enums"]["goal_status"] | null
          target_amount?: number | null
          user_id?: string | null
        }
        Update: {
          current_amount?: number | null
          goal_id?: string | null
          name?: string | null
          progress_percentage?: never
          remaining_amount?: never
          status?: Database["public"]["Enums"]["goal_status"] | null
          target_amount?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      v_income_by_category: {
        Row: {
          category: string | null
          category_id: string | null
          total: number | null
          user_id: string | null
        }
        Relationships: []
      }
      v_monthly_summary: {
        Row: {
          expense: number | null
          income: number | null
          month: string | null
          net: number | null
          saving: number | null
          user_id: string | null
        }
        Relationships: []
      }
      v_net_worth: {
        Row: {
          net_worth: number | null
          total_assets: number | null
          total_liabilities: number | null
          user_id: string | null
        }
        Relationships: []
      }
      v_project_daily_activity: {
        Row: {
          day: string | null
          expense: number | null
          income: number | null
          project_id: string | null
          result: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_summary"
            referencedColumns: ["project_id"]
          },
        ]
      }
      v_project_summary: {
        Row: {
          expense: number | null
          income: number | null
          project: string | null
          project_id: string | null
          result: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      contribute_to_goal: {
        Args: {
          p_account_id: string
          p_amount: number
          p_date?: string
          p_description?: string
          p_destination_account_id?: string
          p_goal_id: string
        }
        Returns: string
      }
      create_expense: {
        Args: {
          p_account_id: string
          p_amount: number
          p_category_id: string
          p_currency?: string
          p_date?: string
          p_description?: string
        }
        Returns: string
      }
      create_income: {
        Args: {
          p_account_id: string
          p_amount: number
          p_category_id: string
          p_currency?: string
          p_date?: string
          p_description?: string
        }
        Returns: string
      }
      create_transfer: {
        Args: {
          p_account_id: string
          p_amount: number
          p_date?: string
          p_description?: string
          p_destination_account_id: string
        }
        Returns: string
      }
      fn_account_owned: {
        Args: { p_account_id: string; p_user_id: string }
        Returns: boolean
      }
      fn_category_valid: {
        Args: { p_category_id: string; p_user_id: string }
        Returns: boolean
      }
      fn_debt_owned: {
        Args: { p_debt_id: string; p_user_id: string }
        Returns: boolean
      }
      fn_goal_owned: {
        Args: { p_goal_id: string; p_user_id: string }
        Returns: boolean
      }
      fn_project_owned: {
        Args: { p_project_id: string; p_user_id: string }
        Returns: boolean
      }
      pay_debt: {
        Args: {
          p_account_id: string
          p_amount: number
          p_date?: string
          p_debt_id: string
          p_description?: string
        }
        Returns: string
      }
      private_adjust_balance: {
        Args: { p_account_id: string; p_delta: number }
        Returns: undefined
      }
      private_apply_debt_payment: {
        Args: { p_debt_id: string; p_delta: number }
        Returns: undefined
      }
      private_apply_goal_contribution: {
        Args: { p_delta: number; p_goal_id: string }
        Returns: undefined
      }
      private_transaction_apply_effect: {
        Args: {
          p_row: Database["public"]["Tables"]["transactions"]["Row"]
          p_sign: number
        }
        Returns: undefined
      }
    }
    Enums: {
      account_type:
        | "BANK"
        | "CASH"
        | "DIGITAL_WALLET"
        | "CARD"
        | "SAVINGS"
        | "PROJECT"
        | "OTHER"
      app_role: "USER" | "ADMIN"
      budget_period_type: "WEEKLY" | "MONTHLY" | "YEARLY"
      category_kind: "INCOME" | "EXPENSE"
      category_scope: "SYSTEM" | "USER"
      debt_status: "OPEN" | "PARTIALLY_PAID" | "PAID" | "OVERDUE" | "CANCELLED"
      debt_type: "I_OWE" | "OWED_TO_ME"
      goal_priority: "LOW" | "MEDIUM" | "HIGH"
      goal_status: "ACTIVE" | "COMPLETED" | "PAUSED" | "CANCELLED"
      project_status:
        | "PLANNED"
        | "ACTIVE"
        | "PAUSED"
        | "COMPLETED"
        | "CANCELLED"
      recurring_frequency:
        | "DAILY"
        | "WEEKLY"
        | "BIWEEKLY"
        | "MONTHLY"
        | "YEARLY"
      transaction_type:
        | "INCOME"
        | "EXPENSE"
        | "TRANSFER"
        | "SAVING"
        | "DEBT_PAYMENT"
        | "PROJECT_INCOME"
        | "PROJECT_EXPENSE"
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
      account_type: [
        "BANK",
        "CASH",
        "DIGITAL_WALLET",
        "CARD",
        "SAVINGS",
        "PROJECT",
        "OTHER",
      ],
      app_role: ["USER", "ADMIN"],
      budget_period_type: ["WEEKLY", "MONTHLY", "YEARLY"],
      category_kind: ["INCOME", "EXPENSE"],
      category_scope: ["SYSTEM", "USER"],
      debt_status: ["OPEN", "PARTIALLY_PAID", "PAID", "OVERDUE", "CANCELLED"],
      debt_type: ["I_OWE", "OWED_TO_ME"],
      goal_priority: ["LOW", "MEDIUM", "HIGH"],
      goal_status: ["ACTIVE", "COMPLETED", "PAUSED", "CANCELLED"],
      project_status: ["PLANNED", "ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"],
      recurring_frequency: ["DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY", "YEARLY"],
      transaction_type: [
        "INCOME",
        "EXPENSE",
        "TRANSFER",
        "SAVING",
        "DEBT_PAYMENT",
        "PROJECT_INCOME",
        "PROJECT_EXPENSE",
      ],
    },
  },
} as const

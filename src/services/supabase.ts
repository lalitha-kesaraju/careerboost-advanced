import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase credentials not configured. Running in demo mode with localStorage.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Database helper functions
 * Provides simple interface to Supabase tables
 */
export const db = {
  // ============ USERS ============
  async getUser(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  async getUserByEmail(email: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    return { data, error };
  },

  async getUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async createUser(user: { email: string; name: string; tier?: string }) {
    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select()
      .single();
    return { data, error };
  },

  // ============ USER USAGE ============
  async getUserUsage(userId: string) {
    const { data, error } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', userId)
      .single();
    return { data, error };
  },

  async updateUserUsage(userId: string, updates: Record<string, number>) {
    const { data, error } = await supabase
      .from('user_usage')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();
    return { data, error };
  },

  // ============ RESUMES ============
  async getResumes(userId: string) {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async getResume(resumeId: string) {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .single();
    return { data, error };
  },

  async addResume(userId: string, resume: {
    title: string;
    content: string;
    file_url?: string;
    score?: number;
    feedback?: string;
  }) {
    const { data, error } = await supabase
      .from('resumes')
      .insert([{ user_id: userId, ...resume }])
      .select()
      .single();
    return { data, error };
  },

  async updateResume(resumeId: string, updates: Record<string, any>) {
    const { data, error } = await supabase
      .from('resumes')
      .update(updates)
      .eq('id', resumeId)
      .select()
      .single();
    return { data, error };
  },

  async deleteResume(resumeId: string) {
    const { data, error } = await supabase
      .from('resumes')
      .delete()
      .eq('id', resumeId);
    return { data, error };
  },

  // ============ SKILL GAPS ============
  async getSkillGaps(userId: string) {
    const { data, error } = await supabase
      .from('skill_gaps')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async addSkillGap(userId: string, skillGap: {
    target_role: string;
    current_skills?: string;
    required_skills?: string;
    gap_analysis?: string;
    recommendations?: string;
  }) {
    const { data, error } = await supabase
      .from('skill_gaps')
      .insert([{ user_id: userId, ...skillGap }])
      .select()
      .single();
    return { data, error };
  },

  // ============ LEARNING PLANS ============
  async getLearningPlans(userId: string) {
    const { data, error } = await supabase
      .from('learning_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async addLearningPlan(userId: string, plan: {
    goal: string;
    duration_weeks?: number;
    content?: string;
    courses?: string;
    progress?: number;
  }) {
    const { data, error } = await supabase
      .from('learning_plans')
      .insert([{ user_id: userId, ...plan }])
      .select()
      .single();
    return { data, error };
  },

  async updateLearningPlan(planId: string, updates: Record<string, any>) {
    const { data, error } = await supabase
      .from('learning_plans')
      .update(updates)
      .eq('id', planId)
      .select()
      .single();
    return { data, error };
  },

  // ============ CAREER ADVICE ============
  async getCareerAdvice(userId: string) {
    const { data, error } = await supabase
      .from('career_advice')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async addCareerAdvice(userId: string, advice: {
    topic: string;
    question: string;
    advice?: string;
  }) {
    const { data, error } = await supabase
      .from('career_advice')
      .insert([{ user_id: userId, ...advice }])
      .select()
      .single();
    return { data, error };
  },

  // ============ MOCK INTERVIEWS ============
  async getMockInterviews(userId: string) {
    const { data, error } = await supabase
      .from('mock_interviews')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async addMockInterview(userId: string, interview: {
    role: string;
    company?: string;
    score?: number;
    feedback?: string;
    transcript?: string;
  }) {
    const { data, error } = await supabase
      .from('mock_interviews')
      .insert([{ user_id: userId, ...interview }])
      .select()
      .single();
    return { data, error };
  },

  // ============ JOB APPLICATIONS ============
  async getJobApplications(userId: string) {
    const { data, error } = await supabase
      .from('job_applications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async addJobApplication(userId: string, app: {
    company_name: string;
    position: string;
    status?: string;
    salary?: string;
    location?: string;
    notes?: string;
  }) {
    const { data, error } = await supabase
      .from('job_applications')
      .insert([{ user_id: userId, ...app }])
      .select()
      .single();
    return { data, error };
  },

  async updateJobApplication(appId: string, updates: Record<string, any>) {
    const { data, error } = await supabase
      .from('job_applications')
      .update(updates)
      .eq('id', appId)
      .select()
      .single();
    return { data, error };
  },

  async deleteJobApplication(appId: string) {
    const { data, error } = await supabase
      .from('job_applications')
      .delete()
      .eq('id', appId);
    return { data, error };
  },

  // ============ DASHBOARD ============
  async getUserDashboard(userId: string) {
    const { data, error } = await supabase
      .from('user_dashboard_summary')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  }
};

/**
 * Test Supabase connection
 * Run this on app startup to verify configuration
 */
export async function testSupabaseConnection() {
  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Supabase not configured');
    return false;
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('count(*)', { count: 'exact' })
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connected successfully!');
    return true;
  } catch (err) {
    console.error('❌ Supabase connection error:', err);
    return false;
  }
}

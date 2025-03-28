// src/lib/ApplicationService.ts
import { supabase } from './supabase';
import cacheService from './CacheService';

export interface JobType {
  id: string;
  title: string;
  description: string | null;
  requirements: string[] | null;
  is_recruiting: boolean;
  color: string;
  members_count: number;
}

export interface JobQuestion {
  id: string;
  job_id: string;
  label: string;
  type: 'text' | 'textarea';
  required: boolean;
  order_index: number;
}

export interface JobApplication {
  id: string;
  job_id: string;
  job_title?: string; // Joined field
  user_id: string;
  username: string | null;
  discord_id: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  submitted_at: string;
  updated_at: string | null;
  updated_by: string | null;
  feedback: string | null;
  answers?: ApplicationAnswer[]; // Joined field
}

export interface ApplicationAnswer {
  application_id: string;
  question_id: string;
  question_label?: string; // Joined field
  answer: string | null;
}

const CACHE_KEY_JOBS = 'job_types';
const CACHE_KEY_QUESTIONS = 'job_questions';
const CACHE_KEY_APPLICATIONS = 'job_applications';
const CACHE_KEY_USER_APPLICATIONS = 'user_applications';

export const ApplicationService = {
  async getJobTypes(): Promise<JobType[]> {
    const cached = cacheService.get<JobType[]>(CACHE_KEY_JOBS);
    if (cached) return cached;
    
    try {
      const { data, error } = await supabase
        .from('job_types')
        .select('*')
        .order('title');
        
      if (error) throw error;
      
      cacheService.set(CACHE_KEY_JOBS, data || [], { expiryInMinutes: 30 });
      return data || [];
    } catch (error) {
      console.error('Error fetching job types:', error);
      return [];
    }
  },
  
  async getJobQuestions(jobId: string): Promise<JobQuestion[]> {
    const cacheKey = `${CACHE_KEY_QUESTIONS}_${jobId}`;
    const cached = cacheService.get<JobQuestion[]>(cacheKey);
    if (cached) return cached;
    
    try {
      const { data, error } = await supabase
        .from('job_questions')
        .select('*')
        .eq('job_id', jobId)
        .order('order_index');
        
      if (error) throw error;
      
      cacheService.set(cacheKey, data || [], { expiryInMinutes: 30 });
      return data || [];
    } catch (error) {
      console.error('Error fetching job questions:', error);
      return [];
    }
  },
  
  async getAllApplications(): Promise<JobApplication[]> {
    const cached = cacheService.get<JobApplication[]>(CACHE_KEY_APPLICATIONS);
    if (cached) return cached;
    
    try {
      // Get applications
      const { data: applications, error: appError } = await supabase
        .from('job_applications')
        .select('*')
        .order('submitted_at', { ascending: false });
        
      if (appError) throw appError;
      if (!applications) return [];
      
      // Get job titles
      const jobIds = [...new Set(applications.map(app => app.job_id))];
      
      const { data: jobs, error: jobsError } = await supabase
        .from('job_types')
        .select('id, title')
        .in('id', jobIds);
        
      if (jobsError) throw jobsError;
      
      // Get answers for all applications
      const applicationIds = applications.map(app => app.id);
      
      const { data: answers, error: answersError } = await supabase
        .from('application_answers')
        .select('*')
        .in('application_id', applicationIds);
        
      if (answersError) throw answersError;
      
      // Get question texts
      const questionIds = answers ? [...new Set(answers.map(ans => ans.question_id))] : [];
      
      const { data: questions, error: questionsError } = await supabase
        .from('job_questions')
        .select('id, label')
        .in('id', questionIds);
        
      if (questionsError) throw questionsError;
      
      // Create lookup maps
      const jobTitleMap: Record<string, string> = {};
      jobs?.forEach(job => {
        jobTitleMap[job.id] = job.title;
      });
      
      const questionLabelMap: Record<string, string> = {};
      questions?.forEach(q => {
        questionLabelMap[q.id] = q.label;
      });
      
      // Group answers by application
      const answersByApplication: Record<string, ApplicationAnswer[]> = {};
      answers?.forEach(answer => {
        if (!answersByApplication[answer.application_id]) {
          answersByApplication[answer.application_id] = [];
        }
        
        answersByApplication[answer.application_id].push({
          ...answer,
          question_label: questionLabelMap[answer.question_id]
        });
      });
      
      // Combine all data
      const enrichedApplications: JobApplication[] = applications.map(app => ({
        ...app,
        job_title: jobTitleMap[app.job_id],
        answers: answersByApplication[app.id] || []
      }));
      
      cacheService.set(CACHE_KEY_APPLICATIONS, enrichedApplications, { expiryInMinutes: 15 });
      return enrichedApplications;
    } catch (error) {
      console.error('Error fetching applications:', error);
      return [];
    }
  },
  
  async getUserApplications(userId: string): Promise<JobApplication[]> {
    const cacheKey = `${CACHE_KEY_USER_APPLICATIONS}_${userId}`;
    const cached = cacheService.get<JobApplication[]>(cacheKey);
    if (cached) return cached;
    
    try {
      // Get applications for this user
      const { data: applications, error: appError } = await supabase
        .from('job_applications')
        .select('*')
        .eq('user_id', userId)
        .order('submitted_at', { ascending: false });
        
      if (appError) throw appError;
      if (!applications) return [];
      
      // Get job titles
      const jobIds = [...new Set(applications.map(app => app.job_id))];
      
      const { data: jobs, error: jobsError } = await supabase
        .from('job_types')
        .select('id, title')
        .in('id', jobIds);
      
      if (jobsError) throw jobsError;
      
      // Get answers for all applications
      const applicationIds = applications.map(app => app.id);
      
      const { data: answers, error: answersError } = await supabase
        .from('application_answers')
        .select('*')
        .in('application_id', applicationIds);
        
      if (answersError) throw answersError;
      
      // Get question texts
      const questionIds = answers ? [...new Set(answers.map(ans => ans.question_id))] : [];
      
      const { data: questions, error: questionsError } = await supabase
        .from('job_questions')
        .select('id, label')
        .in('id', questionIds);
        
      if (questionsError) throw questionsError;
      
      // Create lookup maps
      const jobTitleMap: Record<string, string> = {};
      jobs?.forEach(job => {
        jobTitleMap[job.id] = job.title;
      });
      
      const questionLabelMap: Record<string, string> = {};
      questions?.forEach(q => {
        questionLabelMap[q.id] = q.label;
      });
      
      // Group answers by application
      const answersByApplication: Record<string, ApplicationAnswer[]> = {};
      answers?.forEach(answer => {
        if (!answersByApplication[answer.application_id]) {
          answersByApplication[answer.application_id] = [];
        }
        
        answersByApplication[answer.application_id].push({
          ...answer,
          question_label: questionLabelMap[answer.question_id]
        });
      });
      
      // Combine all data
      const enrichedApplications: JobApplication[] = applications.map(app => ({
        ...app,
        job_title: jobTitleMap[app.job_id],
        answers: answersByApplication[app.id] || []
      }));
      
      cacheService.set(cacheKey, enrichedApplications, { expiryInMinutes: 15 });
      return enrichedApplications;
    } catch (error) {
      console.error('Error fetching user applications:', error);
      return [];
    }
  },

  async getApplicationById(id: string): Promise<JobApplication | null> {
    try {
      // First check if it's in the cache
      const allApplications = cacheService.get<JobApplication[]>(CACHE_KEY_APPLICATIONS);
      if (allApplications) {
        const cached = allApplications.find(app => app.id === id);
        if (cached) return cached;
      }
      
      // Get the application
      const { data: application, error: appError } = await supabase
        .from('job_applications')
        .select('*')
        .eq('id', id)
        .single();
        
      if (appError) throw appError;
      if (!application) return null;
      
      // Get job details
      const { data: job, error: jobError } = await supabase
        .from('job_types')
        .select('id, title')
        .eq('id', application.job_id)
        .single();
        
      if (jobError) throw jobError;
      
      // Get answers
      const { data: answers, error: answersError } = await supabase
        .from('application_answers')
        .select('*')
        .eq('application_id', id);
        
      if (answersError) throw answersError;
      
      // Get question labels
      const questionIds = answers ? answers.map(ans => ans.question_id) : [];
      
      const { data: questions, error: questionsError } = await supabase
        .from('job_questions')
        .select('id, label')
        .in('id', questionIds);
        
      if (questionsError) throw questionsError;
      
      // Create question label map
      const questionLabelMap: Record<string, string> = {};
      questions?.forEach(q => {
        questionLabelMap[q.id] = q.label;
      });
      
      // Enrich answers with question labels
      const enrichedAnswers = answers?.map(answer => ({
        ...answer,
        question_label: questionLabelMap[answer.question_id]
      })) || [];
      
      // Return the enriched application
      return {
        ...application,
        job_title: job?.title,
        answers: enrichedAnswers
      };
    } catch (error) {
      console.error('Error fetching application:', error);
      return null;
    }
  },
  
  async updateJobType(id: string, updates: Partial<JobType>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('job_types')
        .update(updates)
        .eq('id', id);
        
      if (error) throw error;
      
      // Invalidate caches
      cacheService.invalidate(CACHE_KEY_JOBS);
      
      return true;
    } catch (error) {
      console.error('Error updating job type:', error);
      return false;
    }
  },
  
  async updateJobQuestions(jobId: string, questions: Partial<JobQuestion>[]): Promise<boolean> {
    try {
      // First get existing questions
      const { data: existingQuestions, error: fetchError } = await supabase
        .from('job_questions')
        .select('id')
        .eq('job_id', jobId);
        
      if (fetchError) throw fetchError;
      
      // Identify questions to update and create
      const existingIds = new Set(existingQuestions?.map(q => q.id) || []);
      const questionsToUpdate = questions.filter(q => q.id && existingIds.has(q.id));
      const questionsToCreate = questions.filter(q => !q.id || !existingIds.has(q.id as string));
      
      // Update existing questions
      for (const question of questionsToUpdate) {
        const { error } = await supabase
          .from('job_questions')
          .update(question)
          .eq('id', question.id as string);
          
        if (error) throw error;
      }
      
      // Create new questions
      if (questionsToCreate.length > 0) {
        const newQuestions = questionsToCreate.map(q => ({
          ...q,
          job_id: jobId
        }));
        
        const { error } = await supabase
          .from('job_questions')
          .insert(newQuestions);
          
        if (error) throw error;
      }
      
      // Invalidate cache
      cacheService.invalidate(`${CACHE_KEY_QUESTIONS}_${jobId}`);
      
      return true;
    } catch (error) {
      console.error('Error updating job questions:', error);
      return false;
    }
  },
  
  async deleteJobType(id: string): Promise<boolean> {
    try {
      // This will cascade delete questions
      const { error } = await supabase
        .from('job_types')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Invalidate caches
      cacheService.invalidate(CACHE_KEY_JOBS);
      cacheService.invalidate(`${CACHE_KEY_QUESTIONS}_${id}`);
      cacheService.invalidate(CACHE_KEY_APPLICATIONS);
      
      return true;
    } catch (error) {
      console.error('Error deleting job type:', error);
      return false;
    }
  },
  
  async getApplicationsForJob(jobId: string): Promise<JobApplication[]> {
    try {
      const allApplications = await this.getAllApplications();
      return allApplications.filter(app => app.job_id === jobId);
    } catch (error) {
      console.error('Error fetching applications for job:', error);
      return [];
    }
  },
  
  async getApplicationCounts(): Promise<{[key: string]: {pending: number, accepted: number, rejected: number}}> {
    try {
      const applications = await this.getAllApplications();
      const counts: {[key: string]: {pending: number, accepted: number, rejected: number}} = {};
      
      applications.forEach(app => {
        if (!counts[app.job_id]) {
          counts[app.job_id] = {
            pending: 0,
            accepted: 0,
            rejected: 0
          };
        }
        
        counts[app.job_id][app.status]++;
      });
      
      return counts;
    } catch (error) {
      console.error('Error getting application counts:', error);
      return {};
    }
  },
  
  async incrementMembersCount(jobId: string): Promise<boolean> {
    try {
      // First get current count
      const { data, error: fetchError } = await supabase
        .from('job_types')
        .select('members_count')
        .eq('id', jobId)
        .single();
        
      if (fetchError) throw fetchError;
      
      const currentCount = data?.members_count || 0;
      
      // Update count
      const { error: updateError } = await supabase
        .from('job_types')
        .update({ members_count: currentCount + 1 })
        .eq('id', jobId);
        
      if (updateError) throw updateError;
      
      // Invalidate cache
      cacheService.invalidate(CACHE_KEY_JOBS);
      
      return true;
    } catch (error) {
      console.error('Error incrementing members count:', error);
      return false;
    }
  }
};

export default ApplicationService;
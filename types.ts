export type OnboardingStep = 'initial_info' | 'personal_info' | 'skills' | 'experience' | 'goals';
export type JourneyStep = 'onboarding' | 'roadmap' | 'interview' | 'dashboard';


export enum InterviewType {
  CHAT,
  AUDIO,
}
export type InterviewRound = 'General' | 'Technical' | 'HR' | 'Leadership';

export interface PersonalInfo {
  name: string;
  age?: number;
  currentDesignation: string;
}

export interface WorkExperience {
  role: string;
  company: string;
  duration: string;
  summary: string;
}

export interface Education {
  degree: string;
  institution: string;
  year?: number;
}

export interface Skill {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  workExperience: WorkExperience[];
  education: Education[];
  skills: Skill[];
}

export interface UserProfile {
  targetDesignation: string;
  expectedSalaryMin: string;
  expectedSalaryMax: string;
}

export interface CapstoneProject {
  title: string;
  description: string;
}

export interface SuggestedCourse {
  name: string;
  link: string;
}

export interface Milestone {
  title: string;
  description: string;
  skillsToAcquire: string[];
  suggestedCourses: SuggestedCourse[];
  capstoneProject: CapstoneProject;
}

export interface SoftSkill {
  skill: string;
  description: string;
}

export interface NetworkingSuggestion {
  suggestion: string;
  messageTemplate: string;
}

export interface Roadmap {
  gapAnalysis: string;
  milestones: Milestone[];
  softSkills: SoftSkill[];
  networkingSuggestions: NetworkingSuggestion;
}

export interface VocalDeliveryMetric {
  score: number; // out of 10
  feedback: string;
}

export interface InterviewFeedback {
  milestoneTitle: string;
  round: InterviewRound;
  overallScore: number; // out of 10
  scoreReason: string;
  strengths: string[];
  areasForImprovement: string[];
  detailedFeedback: string;
  vocalDelivery?: { // For audio interviews
    pace: VocalDeliveryMetric;
    clarity: VocalDeliveryMetric;
    confidence: VocalDeliveryMetric;
    fillerWords: VocalDeliveryMetric;
    energy: VocalDeliveryMetric;
  }
}

export interface Job {
  designation: string;
  companyName: string;
}
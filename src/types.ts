export type JobStatus = 'Pending' | 'Approved' | 'Rejected';

export type JobCategory = 'Developers' | 'Creatives' | 'Finance' | 'Marketing & Sales' | 'Management' | 'Operations' | 'Other';

export type UserRole = 'seeker' | 'employer' | 'admin';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  employerType?: 'company' | 'private';
  companyName?: string;
  companyIndustry?: string;
  companyLocation?: string;
  hasTradeLicense?: boolean;
  privateActivityDescription?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  category?: JobCategory;
  deadline: string;
  description: string;
  applyMethod: {
    type: 'telegram' | 'phone' | 'link';
    value: string;
  };
  status: JobStatus;
  employerId: string;
  createdAt: string;
  telegramBroadcastedAt?: string;
  telegramMessageId?: number;
  isConfidential?: boolean;
  isPrivateEmployer?: boolean;
  privateEmployerContext?: string;
  viewCount?: number;
  applyClickCount?: number;
}

export interface JobAlert {
  id: string;
  userId: string;
  keyword: string;
  location?: string;
  category?: JobCategory;
  notifyVia: 'email' | 'telegram';
  contact: string;
  createdAt: string;
}

export type TalentCategory = 
  | 'Graphic Design' 
  | 'Print & Packaging' 
  | 'UI/UX Design' 
  | 'Video & Motion' 
  | 'Software Dev' 
  | 'Digital Marketing';

export interface TalentProject {
  title: string;
  imageUrl: string;
  linkUrl?: string;
}

export type TalentBadge = 'Verified Pro' | 'Top Rated' | 'Fast Responder' | 'Featured Spot';

export interface TalentReview {
  id: string;
  reviewerName: string;
  reviewerRole?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface TalentPortfolio {
  id: string;
  userId: string;
  fullName: string;
  avatarUrl?: string;
  title: string;
  category: TalentCategory;
  location: string;
  availability: 'Freelance' | 'Full-Time' | 'Both';
  rateInfo: string;
  bio: string;
  skills: string[];
  projects: TalentProject[];
  telegramUsername?: string;
  phone?: string;
  externalPortfolioUrl?: string;
  isFeatured?: boolean;
  status: 'Pending' | 'Approved' | 'Rejected';
  rating: number;
  reviewCount: number;
  reviews: TalentReview[];
  badges: TalentBadge[];
  skillEndorsements: Record<string, number>;
  createdAt: string;
}

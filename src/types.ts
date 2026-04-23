export type JobStatus = 'Pending' | 'Approved' | 'Rejected';

export type JobCategory = 'Developers' | 'Creatives' | 'Finance' | 'Marketing & Sales' | 'Management' | 'Operations' | 'Other';

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
}

export interface JobAlert {
  id: string;
  userId: string;
  keyword: string;
  location?: string;
  notifyVia: 'email' | 'telegram';
  contact: string;
  createdAt: string;
}

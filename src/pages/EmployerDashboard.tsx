import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Zap } from 'lucide-react';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import { JobStatus, Job } from '../types';

function StatusBadge({ status }: { status: JobStatus }) {
  const colors = {
    Pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    Approved: 'bg-green-50 text-green-700 border-green-200',
    Rejected: 'bg-red-50 text-red-700 border-red-200'
  };
  
  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${colors[status]}`}>
      {status}
    </span>
  );
}

export function EmployerDashboard() {
  const { jobs, deleteJob, addJob } = useJobs();
  const { user, profile } = useAuth();
  const [seeding, setSeeding] = useState(false);
  const [filter, setFilter] = useState<'All' | JobStatus>('All');
  
  const myJobs = useMemo(() => {
    if (!user) return [];
    let filtered = jobs.filter(j => j.employerId === user.uid);
    if (filter !== 'All') {
      filtered = filtered.filter(j => j.status === filter);
    }
    return filtered;
  }, [jobs, user, filter]);

  const handleSeedJobs = async () => {
    setSeeding(true);
    const titles = ["Frontend Developer", "Backend Engineer", "Product Manager", "Data Analyst", "UX Designer", "Marketing Specialist", "DevOps Engineer"];
    const companies = ["TechCorp", "Innovatech", "CloudServe", "DataSys", "WebDesign Co", "NextGen Solutions"];
    const locations = ["Addis Ababa", "Remote", "Hawassa", "Dire Dawa", "Mekelle", "Bahir Dar", "Adama"];
    
    const descriptions = [
      `We are looking for a highly skilled Software Engineer to join our core product team. You will be responsible for designing and implementing scalable backend services, optimizing API performance, and working closely with our frontend developers to deliver seamless user experiences.

Requirements:
• 3+ years of experience in Node.js and TypeScript.
• Strong understanding of SQL (PostgreSQL preferred) and database design.
• Familiarity with Docker and containerized deployments.
• Excellent problem-solving skills and clean code practices.
• Experience with Redis or similar caching mechanisms.

We offer flexible working hours, health coverage, and a collaborative work environment.`,
      `Join our creative team as a UX/UI Designer and help shape the next generation of our digital products. You'll work closely with product managers and engineers to craft intuitive, beautiful interfaces that our users love.

Responsibilities:
• Conduct user research and usability testing to validate design decisions.
• Create wireframes, interactive prototypes, and high-fidelity mockups.
• Maintain and evolve our internal design system.
• Ensure accessibility standards are met across all platforms.

Qualifications:
• A strong portfolio demonstrating complex problem solving through design.
• Proficiency in Figma.
• Basic understanding of HTML/CSS is a plus.`,
      `We're hiring a Data Analyst to translate raw data into actionable business insights. In this role, you will analyze user behavior, build automated reporting dashboards, and assist leadership in making data-driven decisions.

What you'll do:
• Develop and maintain complex SQL queries to extract data from our warehouse.
• Create automated dashboards using Tableau or Power BI.
• Identify trends and anomalies in user engagement metrics.
• Present analytical findings to non-technical stakeholders.

You should have:
• A degree in Computer Science, Statistics, Mathematics, or Economics.
• 2+ years of experience in a similar analytical role.
• High proficiency in Python (Pandas/NumPy) or R.`,
      `Are you a marketing wizard? We need a Digital Marketing Specialist to lead our user acquisition campaigns and manage our brand presence across social media channels.

Key Responsibilities:
• Plan and execute SEO and SEM strategies.
• Manage performance marketing budgets across Google Ads and Meta Ads.
• Track and report on campaign CPA, ROI, and conversion rates.
• Collaborate with content creators to produce engaging campaign materials.

Requirements:
• Proven track record of running successful paid acquisition campaigns.
• Deep understanding of Google Analytics and marketing attribution models.
• Creative mindset with a data-driven approach.`,
      `We are seeking a reliable and proactive Product Manager to guide our new mobile app initiative from conception to launch. You are the glue between engineering, design, and our stakeholders.

Your day-to-day:
• Define product vision, strategy, and roadmap.
• Write clear technical and non-technical specifications and user stories.
• Prioritize backlog based on business value and user impact.
• Run daily standups and sprint planning meetings.

What we're looking for:
• 4+ years of product management experience, preferably in B2C tech.
• Ability to influence cross-functional teams without direct authority.
• Strong communication and organizational skills.`
    ];

    try {
      for (let i = 0; i < 5; i++) {
        await addJob({
            title: titles[Math.floor(Math.random() * titles.length)],
            company: companies[Math.floor(Math.random() * companies.length)],
            location: locations[Math.floor(Math.random() * locations.length)],
            salary: `${Math.floor(Math.random() * 50 + 20)},000 ETB`,
            deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * (Math.floor(Math.random() * 30 + 10))).toISOString(),
            description: descriptions[i % descriptions.length],
            applyMethod: {
              type: Math.random() > 0.5 ? 'telegram' : 'link',
              value: Math.random() > 0.5 ? '@hr_contact' : 'https://example.com/apply'
            }
        });
      }
      alert("Successfully queued 5 jobs! (If you are an admin they might be pending until you approve them, unless you modified JobContext to auto-approve them depending on your role).");
    } catch(err) {
       console.error("Failed to seed jobs:", err);
       alert("Error creating jobs. Are you logged in as an Employer?");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-[--color-sira-blue]">Employer Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your job postings</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 p-1 rounded-full flex text-sm font-medium hidden md:flex">
            {['All', 'Approved', 'Pending', 'Rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status as 'All' | JobStatus)}
                className={`px-4 py-1.5 rounded-full transition-all ${filter === status ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
              >
                {status}
              </button>
            ))}
          </div>

          <button 
            onClick={handleSeedJobs}
            disabled={seeding}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-5 py-2.5 rounded-full font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
            title="Generate 5 random test jobs instantly"
          >
            <Zap size={18} className={seeding ? "animate-pulse" : ""} />
            {seeding ? "Seeding..." : "Seed 5 Random Jobs"}
          </button>
          
          <Link 
            to="/employer/post" 
            className="flex items-center gap-2 bg-[--color-sira-orange] text-black px-5 py-2.5 rounded-full font-medium hover:bg-[#E66E00] transition-colors"
          >
            <Plus size={18} />
            Post New Job
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                <th className="font-medium p-4 pl-6">Job Title</th>
                <th className="font-medium p-4">Posted Date</th>
                <th className="font-medium p-4">Status</th>
                <th className="font-medium p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {myJobs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    No jobs posted yet. <Link to="/employer/post" className="text-[--color-sira-blue] hover:underline">Post your first job</Link>.
                  </td>
                </tr>
              ) : (
                myJobs.map(job => (
                  <tr key={job.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 pl-6 font-medium text-gray-900">{job.title}</td>
                    <td className="p-4 text-gray-500 text-sm">{new Date(job.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="p-4 pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/employer/edit/${job.id}`} className="p-2 w-8 h-8 rounded-full text-gray-400 hover:text-[--color-sira-blue] hover:bg-blue-50 transition-colors flex items-center justify-center">
                          <Edit2 size={16} />
                        </Link>
                        <button 
                          onClick={() => deleteJob(job.id)}
                          className="p-2 w-8 h-8 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

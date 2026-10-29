import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { JobProvider } from './context/JobContext';
import { ThemeProvider } from './context/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';
import { Loader2 } from 'lucide-react';

const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const EmployerDashboard = lazy(() => import('./pages/EmployerDashboard').then(m => ({ default: m.EmployerDashboard })));
const PostJob = lazy(() => import('./pages/PostJob').then(m => ({ default: m.PostJob })));
const EditJob = lazy(() => import('./pages/EditJob').then(m => ({ default: m.EditJob })));
const JobDetails = lazy(() => import('./pages/JobDetails').then(m => ({ default: m.JobDetails })));
const AdminPanel = lazy(() => import('./pages/AdminPanel').then(m => ({ default: m.AdminPanel })));
const SavedJobs = lazy(() => import('./pages/SavedJobs').then(m => ({ default: m.SavedJobs })));
const JobAlerts = lazy(() => import('./pages/JobAlerts').then(m => ({ default: m.JobAlerts })));
const HowItWorks = lazy(() => import('./pages/HowItWorks').then(m => ({ default: m.HowItWorks })));
const WhyChooseUs = lazy(() => import('./pages/WhyChooseUs').then(m => ({ default: m.WhyChooseUs })));
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const AuthHub = lazy(() => import('./pages/AuthHub').then(m => ({ default: m.AuthHub })));
const AuthSeeker = lazy(() => import('./pages/AuthSeeker').then(m => ({ default: m.AuthSeeker })));
const AuthEmployer = lazy(() => import('./pages/AuthEmployer').then(m => ({ default: m.AuthEmployer })));
const AdminLogin = lazy(() => import('./pages/AdminLogin').then(m => ({ default: m.AdminLogin })));
const TalentDirectory = lazy(() => import('./pages/TalentDirectory').then(m => ({ default: m.TalentDirectory })));
const TalentDetails = lazy(() => import('./pages/TalentDetails').then(m => ({ default: m.TalentDetails })));
const PostPortfolio = lazy(() => import('./pages/PostPortfolio').then(m => ({ default: m.PostPortfolio })));
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 size={36} className="animate-spin text-blue-500" />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <AuthProvider>
          <JobProvider>
            <Router>
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/talent" element={<TalentDirectory />} />
                    <Route path="/talent/:id" element={<TalentDetails />} />
                    <Route path="/post-portfolio" element={<PostPortfolio />} />
                    <Route path="/how-it-works" element={<HowItWorks />} />
                    <Route path="/why-us" element={<WhyChooseUs />} />
                    <Route path="/employer" element={<EmployerDashboard />} />
                    <Route path="/employer/post" element={<PostJob />} />
                    <Route path="/employer/edit/:id" element={<EditJob />} />
                    <Route path="/jobs/:id" element={<JobDetails />} />
                    <Route path="/admin" element={<AdminPanel />} />
                    <Route path="/saved" element={<SavedJobs />} />
                    <Route path="/alerts" element={<JobAlerts />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/login" element={<AuthHub />} />
                    <Route path="/login/seeker" element={<AuthSeeker />} />
                    <Route path="/login/employer" element={<AuthEmployer />} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </Layout>
            </Router>
          </JobProvider>
        </AuthProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { JobProvider } from './context/JobContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { EmployerDashboard } from './pages/EmployerDashboard';
import { PostJob } from './pages/PostJob';
import { EditJob } from './pages/EditJob';
import { JobDetails } from './pages/JobDetails';
import { AdminPanel } from './pages/AdminPanel';
import { SavedJobs } from './pages/SavedJobs';
import { HowItWorks } from './pages/HowItWorks';
import { WhyChooseUs } from './pages/WhyChooseUs';

export default function App() {
  return (
    <AuthProvider>
      <JobProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/why-us" element={<WhyChooseUs />} />
              <Route path="/employer" element={<EmployerDashboard />} />
              <Route path="/employer/post" element={<PostJob />} />
              <Route path="/employer/edit/:id" element={<EditJob />} />
              <Route path="/jobs/:id" element={<JobDetails />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/saved" element={<SavedJobs />} />
            </Routes>
          </Layout>
        </Router>
      </JobProvider>
    </AuthProvider>
  );
}

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import Projects from './pages/projects/Projects';
import ProjectDetail from './pages/projects/ProjectDetail';
import Workers from './pages/workers/Workers';
import Attendance from './pages/workers/Attendance';
import Finance from './pages/finance/Finance';
import Documents from './pages/documents/Documents';
import Team from './pages/team/Team';
import WorkerDashboard from './pages/worker/WorkerDashboard';

/* Redirects unauthenticated users to login */
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

/* Only for worker role — redirects others to main app */
const WorkerRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'worker') return <Navigate to="/" replace />;
  return children;
};

/* Main app route — redirects workers to their dashboard */
const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'worker') return <Navigate to="/worker-dashboard" replace />;
  return children;
};

export default function App() {
  return (
    <SettingsProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Worker portal */}
          <Route path="/worker-dashboard" element={
            <WorkerRoute><WorkerDashboard /></WorkerRoute>
          } />

          {/* Main ERP app */}
          <Route path="/*" element={
            <AdminRoute>
              <Layout>
                <Routes>
                  <Route path="/"            element={<Dashboard />} />
                  <Route path="/projects"    element={<Projects />} />
                  <Route path="/projects/:id" element={<ProjectDetail />} />
                  <Route path="/workers"     element={<Workers />} />
                  <Route path="/attendance"  element={<Attendance />} />
                  <Route path="/finance"     element={<Finance />} />
                  <Route path="/documents"   element={<Documents />} />
                  <Route path="/team"        element={<Team />} />
                </Routes>
              </Layout>
            </AdminRoute>
          } />
        </Routes>
      </BrowserRouter>
    </SettingsProvider>
  );
}

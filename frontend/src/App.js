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
import Subscription    from './pages/subscription/Subscription';
import ClientLayout    from './components/client/ClientLayout';
import ClientPortal    from './pages/client/ClientPortal';
import ClientActivity  from './pages/client/ClientActivity';
import ClientPayments  from './pages/client/ClientPayments';
import ClientBuilderProfile from './pages/client/ClientBuilderProfile';
import ClientDocuments      from './pages/client/ClientDocuments';
import Vendors          from './pages/vendors/Vendors';
import VendorDetail     from './pages/vendors/VendorDetail';
import PurchaseOrders   from './pages/vendors/PurchaseOrders';
import PurchaseOrderForm from './pages/vendors/PurchaseOrderForm';
import Reports          from './pages/reports/Reports';
import Notifications    from './pages/notifications/Notifications';

/* Redirects unauthenticated users to login */
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

/* Only for worker role */
const WorkerRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'worker') return <Navigate to="/" replace />;
  return children;
};

/* Only for client role */
const ClientRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'client') return <Navigate to="/" replace />;
  return children;
};

/* Main ERP app — blocks workers (→ worker-dashboard) and clients (→ /client) */
const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'worker') return <Navigate to="/worker-dashboard" replace />;
  if (user.role === 'client') return <Navigate to="/client" replace />;
  return children;
};

/* Admin-only pages (finance, vendors, team, subscription) */
const AdminOnlyRoute = ({ children }) => {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin()) return <Navigate to="/" replace />;
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

          {/* Worker portal — role: worker only */}
          <Route path="/worker-dashboard" element={
            <WorkerRoute><WorkerDashboard /></WorkerRoute>
          } />

          {/* Client portal — role: client only */}
          <Route path="/client/*" element={
            <ClientRoute>
              <ClientLayout>
                <Routes>
                  <Route path="/"         element={<ClientPortal />} />
                  <Route path="/activity"  element={<ClientActivity />} />
                  <Route path="/payments"  element={<ClientPayments />} />
                  <Route path="/documents" element={<ClientDocuments />} />
                  <Route path="/builder"   element={<ClientBuilderProfile />} />
                </Routes>
              </ClientLayout>
            </ClientRoute>
          } />

          {/* Main ERP app — admin + engineer roles */}
          <Route path="/*" element={
            <AdminRoute>
              <Layout>
                <Routes>
                  <Route path="/"             element={<Dashboard />} />
                  <Route path="/projects"     element={<Projects />} />
                  <Route path="/projects/:id" element={<ProjectDetail />} />
                  <Route path="/workers"      element={<Workers />} />
                  <Route path="/attendance"   element={<Attendance />} />
                  <Route path="/documents"    element={<Documents />} />

                  {/* Admin-only routes */}
                  <Route path="/finance"               element={<AdminOnlyRoute><Finance /></AdminOnlyRoute>} />
                  <Route path="/team"                  element={<AdminOnlyRoute><Team /></AdminOnlyRoute>} />
                  <Route path="/subscription"          element={<AdminOnlyRoute><Subscription /></AdminOnlyRoute>} />
                  <Route path="/vendors"               element={<AdminOnlyRoute><Vendors /></AdminOnlyRoute>} />
                  <Route path="/vendors/:id"           element={<AdminOnlyRoute><VendorDetail /></AdminOnlyRoute>} />
                  <Route path="/purchase-orders"       element={<AdminOnlyRoute><PurchaseOrders /></AdminOnlyRoute>} />
                  <Route path="/purchase-orders/new"   element={<AdminOnlyRoute><PurchaseOrderForm /></AdminOnlyRoute>} />
                  <Route path="/reports"               element={<AdminOnlyRoute><Reports /></AdminOnlyRoute>} />
                  <Route path="/notifications"         element={<Notifications />} />
                </Routes>
              </Layout>
            </AdminRoute>
          } />
        </Routes>
      </BrowserRouter>
    </SettingsProvider>
  );
}

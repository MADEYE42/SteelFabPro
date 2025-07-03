import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './features/user/LoginPage';
import RegisterPage from './features/user/RegisterPage';
import { AuthProvider } from './features/user/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import UserMenu from './components/UserMenu';
import Sidebar from './components/Sidebar';
import ProfilePage from './features/user/ProfilePage';
import SettingsPage from './features/user/SettingsPage';
import { ThemeContextProvider } from './theme/ThemeContext';
import { NotificationContextProvider } from './notification/NotificationContext';
import { ProjectListPage, ProjectDetailPage } from './features/project';
import { InventoryListPage } from './features/inventory';
import { CommunicationPage } from './features/communication';
import PaymentPage from './features/payment/PaymentPage';

const Dashboard = () => <div><h2>Dashboard</h2></div>;
const InventoryModule = () => <div><h2>Inventory Module</h2></div>;
const CommunicationModule = () => <div><h2>Communication Module</h2></div>;
const PaymentModule = () => <div><h2>Payment Module</h2></div>;
const ReportingModule = () => <div><h2>Reporting Module</h2></div>;

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <UserMenu />
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: 24 }}>{children}</main>
    </div>
  </>
);

const App: React.FC = () => {
  return (
    <ThemeContextProvider>
      <NotificationContextProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <Dashboard />
                  </ProtectedLayout>
                </ProtectedRoute>
              } />
              <Route path="/project" element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <ProjectListPage />
                  </ProtectedLayout>
                </ProtectedRoute>
              } />
              <Route path="/project/:projectId" element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <ProjectDetailPage />
                  </ProtectedLayout>
                </ProtectedRoute>
              } />
              <Route path="/inventory/*" element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <InventoryModule />
                  </ProtectedLayout>
                </ProtectedRoute>
              } />
              <Route path="/inventory" element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <InventoryListPage />
                  </ProtectedLayout>
                </ProtectedRoute>
              } />
              <Route path="/communication/*" element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <CommunicationModule />
                  </ProtectedLayout>
                </ProtectedRoute>
              } />
              <Route path="/communication" element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <CommunicationPage />
                  </ProtectedLayout>
                </ProtectedRoute>
              } />
              <Route path="/payment/*" element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <PaymentPage />
                  </ProtectedLayout>
                </ProtectedRoute>
              } />
              <Route path="/reporting/*" element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <ReportingModule />
                  </ProtectedLayout>
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <ProfilePage />
                  </ProtectedLayout>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <SettingsPage />
                  </ProtectedLayout>
                </ProtectedRoute>
              } />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </NotificationContextProvider>
    </ThemeContextProvider>
  );
};

export default App;

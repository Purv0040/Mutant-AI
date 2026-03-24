import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import Home from '../pages/Home';
import FeaturesPage from '../pages/FeaturesPage';
import PricingPage from '../pages/PricingPage';
import AboutPage from '../pages/AboutPage';
import SignInPage from '../pages/SignInPage';
import AdminSignInPage from '../pages/AdminSignInPage';
import SignUpPage from '../pages/SignUpPage';
import RoleSelection from '../pages/RoleSelection';
import DashboardPage from '../pages/DashboardPage';
import Chat from '../pages/Chat';
import DocumentsPage from '../pages/DocumentsPage';
import SearchPage from '../pages/SearchPage';
import MeetingsPage from '../pages/MeetingsPage';
import SettingsPage from '../pages/SettingsPage';
import AnalyticsPage from '../pages/AnalyticsPage';
import TeamPage from '../pages/TeamPage';
import UserDocumentsPage from '../pages/UserDocumentsPage';
import Login from '../pages/Login';
import Register from '../pages/Register';
import AskAI from '../pages/AskAI';
import Summarization from '../pages/Summarization';
import Categorization from '../pages/Categorization';
import { Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/role-selection" />;
  if (!isAdmin) return <Navigate to="/dashboard" />;
  return children;
};

const UserRoute = ({ children }) => {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/role-selection" />;
  if (isAdmin) return <Navigate to="/documents" />;
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/admin-signin" element={<AdminSignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/role-selection" element={<RoleSelection />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route
          path="/user-documents"
          element={
            <UserRoute>
              <UserDocumentsPage />
            </UserRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents"
          element={
            <AdminRoute>
              <DocumentsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/search"
          element={
            <AdminRoute>
              <SearchPage />
            </AdminRoute>
          }
        />
        <Route path="/meetings" element={<MeetingsPage />} />
        <Route
          path="/team"
          element={
            <AdminRoute>
              <TeamPage />
            </AdminRoute>
          }
        />
        <Route path="/settings" element={<SettingsPage />} />
        <Route
          path="/analytics"
          element={
            <AdminRoute>
              <AnalyticsPage />
            </AdminRoute>
          }
        />
        <Route path="/profile" element={<Navigate to="/settings" replace />} />
        <Route
          path="/ask-ai"
          element={
            <ProtectedRoute>
              <AskAI />
            </ProtectedRoute>
          }
        />
        <Route
          path="/summarization"
          element={
            <ProtectedRoute>
              <Summarization />
            </ProtectedRoute>
          }
        />
        <Route
          path="/categorization"
          element={
            <AdminRoute>
              <Categorization />
            </AdminRoute>
          }
        />
      </Route>
    </Routes>
  );
};

export default AppRoutes;

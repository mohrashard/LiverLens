import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./auth";
import LiverLensLanding from "./pages/landing";
import UserRegistration from "./pages/register";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import PredictPage from "./pages/predict";
import HistoryPage from "./pages/history";
import ProfilePage from "./pages/ProfilePage";
import LoadingSpinner from "./components/LoadingSpinner";
import PlaygroundPage from "./pages/PlaygroundPage";
import LearningPage from "./pages/learn";
import UploadCSVPage from "./pages/UploadCSVPage";
import ReportBuilderPage from "./pages/ReportBuilderPage";
import DatasetExplorerPage from "./pages/DatasetExplorerPage";
import AnalysisPage from "./pages/AnalysisPage";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? children : <Navigate to="/LoginPage" />;
};

function AppRouter() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LiverLensLanding />} />
          <Route path="/register" element={<UserRegistration />} />
          <Route path="/LoginPage" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/predict"
            element={
              <ProtectedRoute>
                <PredictPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ProfilePage"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/PlaygroundPage"
            element={
              <ProtectedRoute>
                <PlaygroundPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learn"
            element={
              <ProtectedRoute>
                <LearningPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/UploadCSVPage"
            element={
              <ProtectedRoute>
                <UploadCSVPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ReportBuilderPage"
            element={
              <ProtectedRoute>
                <ReportBuilderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/DatasetExplorerPage"
            element={
              <ProtectedRoute>
                <DatasetExplorerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/AnalysisPage"
            element={
              <ProtectedRoute>
                <AnalysisPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default AppRouter;

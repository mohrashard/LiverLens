
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth';
import LiverLensLanding from './pages/landing';
import UserRegistration from './pages/register';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LoadingSpinner from './components/LoadingSpinner';
import PredictPage from './pages/predict';


function AppRouter() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LiverLensLanding />} />
          <Route path="/register" element={<UserRegistration />} />
          <Route path="/LoginPage" element={<LoginPage />} />
          <Route 
            path="/DashboardPage" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
           <Route path="/predict" element={<PredictPage/>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return isAuthenticated ? children : <Navigate to="/LoginPage" />;
};

export default AppRouter;
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/sidebar'; // Import the Sidebar component
import { useAuth } from '../auth';
import { UserCircle, BriefcaseMedical, GraduationCap } from 'lucide-react';
import '../styles/dashboard.css';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [userDetails, setUserDetails] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch('/profile', {
          method: 'GET',
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setUserDetails(data);
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    if (user) {
      fetchUserDetails();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
  };

  const getRoleIcon = () => {
    const role = userDetails?.role || user?.role;
    
    switch(role) {
      case 'Doctor':
        return <BriefcaseMedical size={24} className="role-icon" />;
      case 'Researcher':
      case 'Student':
        return <GraduationCap size={24} className="role-icon" />;
      default:
        return null;
    }
  };

  // Format date from backend response
  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString);
  };

  // Use fetched user details when available
  const displayUser = userDetails || user;

  return (
    <div className="dashboard-layout">
      {/* Sidebar Component */}
      <Sidebar 
        userRole={displayUser?.role} 
        onLogout={handleLogout}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={setIsSidebarCollapsed}
      />
      
      {/* Main Content */}
      <div className={`dashboard-content ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="dashboard-container">
          <div className="dashboard-header">
            <h1 className="dashboard-title">Welcome to LiverLens</h1>
          </div>

          <div className="dashboard-content">
            <div className="profile-card">
              <div className="profile-header">
                <UserCircle size={80} className="profile-icon" />
                <h2 className="profile-name">{displayUser?.full_name}</h2>
                <p className="profile-email">{displayUser?.email}</p>
                <div className="profile-role">
                  {getRoleIcon()}
                  <span>{displayUser?.role || 'Not specified'}</span>
                </div>
              </div>

              <div className="profile-details">
                <div className="detail-item">
                  <strong>Member since:</strong>{' '}
                  {displayUser?.created_at 
                    ? formatDate(displayUser.created_at).toLocaleDateString() 
                    : 'Unknown'}
                </div>
                
                <div className="detail-item">
                  <strong>Last login:</strong>{' '}
                  {displayUser?.last_login 
                    ? formatDate(displayUser.last_login).toLocaleString()
                    : 'Never'}
                </div>
                
                {/* Doctor-specific details */}
                {displayUser?.role === 'Doctor' && displayUser?.doctor_info && (
                  <>
                    <div className="role-divider">Medical Information</div>
                    <div className="detail-item">
                      <strong>Medical License:</strong> {displayUser.doctor_info.medical_license_id || 'Not specified'}
                    </div>
                    <div className="detail-item">
                      <strong>Specialty:</strong> {displayUser.doctor_info.specialty || 'Not specified'}
                    </div>
                    <div className="detail-item">
                      <strong>Hospital/Clinic:</strong> {displayUser.doctor_info.hospital_clinic_name || 'Not specified'}
                    </div>
                    <div className="detail-item">
                      <strong>Country:</strong> {displayUser.doctor_info.country || 'Not specified'}
                    </div>
                  </>
                )}
                
                {/* Academic-specific details */}
                {['Researcher', 'Student'].includes(displayUser?.role) && displayUser?.academic_info && (
                  <>
                    <div className="role-divider">Academic Information</div>
                    <div className="detail-item">
                      <strong>Institution:</strong> {displayUser.academic_info.institution_name || 'Not specified'}
                    </div>
                    <div className="detail-item">
                      <strong>Department:</strong> {displayUser.academic_info.department || 'Not specified'}
                    </div>
                    <div className="detail-item">
                      <strong>Position:</strong> {displayUser.academic_info.role_title || 'Not specified'}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="features-grid">
              <div className="feature-card">
                <h3>Liver Analysis</h3>
                <p>Upload and analyze liver CT scans for diagnostics.</p>
              </div>
              <div className="feature-card">
                <h3>Case Studies</h3>
                <p>Access medical case studies and research papers.</p>
              </div>
              <div className="feature-card">
                <h3>Patient Records</h3>
                <p>Manage and review patient medical histories.</p>
              </div>
              <div className="feature-card">
                <h3>Research Tools</h3>
                <p>Utilize advanced tools for medical research.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
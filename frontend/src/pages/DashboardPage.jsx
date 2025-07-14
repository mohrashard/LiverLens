import React, { useState } from 'react';

import Sidebar from '../components/sidebar';
import { useAuth } from '../auth';
import { UserCircle, BriefcaseMedical, GraduationCap } from 'lucide-react';
import '../styles/dashboard.css';

const DashboardPage = () => {
  const { user, logout } = useAuth(); // Use context user directly
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const getRoleIcon = () => {
    const role = user?.role;
    
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

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar 
        userRole={user?.role} 
        onLogout={handleLogout}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={setIsSidebarCollapsed}
      />
      
      <div className={`dashboard-content ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="dashboard-container">
          <div className="dashboard-header">
            <h1 className="dashboard-title">Welcome to LiverLens</h1>
          </div>

          <div className="dashboard-content">
            <div className="profile-card">
              <div className="profile-header">
                <UserCircle size={80} className="profile-icon" />
                <h2 className="profile-name">{user?.full_name}</h2>
                <p className="profile-email">{user?.email}</p>
                <div className="profile-role">
                  {getRoleIcon()}
                  <span>{user?.role || 'Not specified'}</span>
                </div>
              </div>

              <div className="profile-details">
                <div className="detail-item">
                  <strong>Member since:</strong>{' '}
                  {user?.created_at 
                    ? formatDate(user.created_at).toLocaleDateString() 
                    : 'Unknown'}
                </div>
                
                <div className="detail-item">
                  <strong>Last login:</strong>{' '}
                  {user?.last_login 
                    ? formatDate(user.last_login).toLocaleString()
                    : 'Never'}
                </div>
                
                {user?.role === 'Doctor' && user?.doctor_info && (
                  <>
                    <div className="role-divider">Medical Information</div>
                    <div className="detail-item">
                      <strong>Medical License:</strong> {user.doctor_info.medical_license_id || 'Not specified'}
                    </div>
                    <div className="detail-item">
                      <strong>Specialty:</strong> {user.doctor_info.specialty || 'Not specified'}
                    </div>
                    <div className="detail-item">
                      <strong>Hospital/Clinic:</strong> {user.doctor_info.hospital_clinic_name || 'Not specified'}
                    </div>
                    <div className="detail-item">
                      <strong>Country:</strong> {user.doctor_info.country || 'Not specified'}
                    </div>
                  </>
                )}
                
                {['Researcher', 'Student'].includes(user?.role) && user?.academic_info && (
                  <>
                    <div className="role-divider">Academic Information</div>
                    <div className="detail-item">
                      <strong>Institution:</strong> {user.academic_info.institution_name || 'Not specified'}
                    </div>
                    <div className="detail-item">
                      <strong>Department:</strong> {user.academic_info.department || 'Not specified'}
                    </div>
                    <div className="detail-item">
                      <strong>Position:</strong> {user.academic_info.role_title || 'Not specified'}
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
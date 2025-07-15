import React, { useState, useEffect } from 'react';
import Sidebar from '../components/sidebar';
import { useAuth } from '../auth';
import { Navigate } from 'react-router-dom';
import { Loader, User, Calendar, Activity, Edit, Save, X } from 'lucide-react';
import '../styles/profile.css';

const ProfilePage = () => {
  const { user, isAuthenticated, isLoading: isAuthLoading, logout } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      setProfileData(user);
      setFormData({
        full_name: user.full_name,
        ...(user.role === 'Doctor' ? { doctor_info: user.doctor_info } : {}),
        ...(user.role === 'Researcher' || user.role === 'Student' 
          ? { academic_info: user.academic_info } 
          : {}
        )
      });
      fetchStats();
    }
  }, [isAuthenticated, user]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/stats', {
        method: 'GET',
        credentials: 'include'
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch stats');
      
      setStats(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('doctor_info.') || name.startsWith('academic_info.')) {
      const [prefix, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [prefix]: {
          ...prev[prefix],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:5000/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Update failed');

      setProfileData(data);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isAuthLoading) {
    return (
      <div className="loading-container">
        <Loader className="loading-spinner" />
        <p>Checking authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar 
        userRole={user?.role || 'Doctor'} 
        onLogout={logout}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={setIsSidebarCollapsed}
      />
      
      <main className="main-content">
        <div className="profile-container">
          <div className="profile-header">
            <div className="header-content">
              <User className="header-icon" />
              <div>
                <h1>User Profile</h1>
                <p>Manage your account information and activity</p>
              </div>
            </div>
          </div>

          <div className="profile-stats">
            <div className="stat-card">
              <Activity className="stat-icon" />
              <div>
                <h3>{stats.total_predictions || 0}</h3>
                <p>Total Predictions</p>
              </div>
            </div>
            
            <div className="stat-card">
              <Calendar className="stat-icon" />
              <div>
                <h3>{formatDate(profileData?.last_login)}</h3>
                <p>Last Login</p>
              </div>
            </div>
            
            <div className="stat-card">
              <Calendar className="stat-icon" />
              <div>
                <h3>{formatDate(profileData?.created_at)}</h3>
                <p>Member Since</p>
              </div>
            </div>
          </div>

          <div className="profile-card">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-section">
                  <h3>Account Information</h3>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={profileData?.email || ''}
                      disabled
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Role</label>
                    <input
                      type="text"
                      value={profileData?.role || ''}
                      disabled
                    />
                  </div>
                </div>

                {profileData?.role === 'Doctor' && (
                  <div className="form-section">
                    <h3>Professional Information</h3>
                    <div className="form-group">
                      <label>Medical License ID</label>
                      <input
                        type="text"
                        name="doctor_info.medical_license_id"
                        value={formData.doctor_info?.medical_license_id || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Specialty</label>
                      <input
                        type="text"
                        name="doctor_info.specialty"
                        value={formData.doctor_info?.specialty || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Hospital/Clinic</label>
                      <input
                        type="text"
                        name="doctor_info.hospital_clinic_name"
                        value={formData.doctor_info?.hospital_clinic_name || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Country</label>
                      <input
                        type="text"
                        name="doctor_info.country"
                        value={formData.doctor_info?.country || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                )}

                {(profileData?.role === 'Researcher' || profileData?.role === 'Student') && (
                  <div className="form-section">
                    <h3>Academic Information</h3>
                    <div className="form-group">
                      <label>Institution</label>
                      <input
                        type="text"
                        name="academic_info.institution_name"
                        value={formData.academic_info?.institution_name || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Department</label>
                      <input
                        type="text"
                        name="academic_info.department"
                        value={formData.academic_info?.department || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Position/Role</label>
                      <input
                        type="text"
                        name="academic_info.role_title"
                        value={formData.academic_info?.role_title || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                )}

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => setIsEditing(false)}
                    disabled={loading}
                  >
                    <X className="btn-icon" />
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader className="btn-icon spinning" />
                    ) : (
                      <Save className="btn-icon" />
                    )}
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-details">
                <div className="profile-header-info">
                  <div className="user-avatar">
                    <User size={48} />
                  </div>
                  <div>
                    <h2>{profileData?.full_name || ''}</h2>
                    <div className="user-meta">
                      <span className="user-role">{profileData?.role || ''}</span>
                      <span>{profileData?.email || ''}</span>
                    </div>
                  </div>
                  <button 
                    className="edit-btn"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit size={18} />
                    Edit Profile
                  </button>
                </div>

                <div className="info-section">
                  <h3>Account Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Member Since</span>
                      <span className="info-value">
                        {formatDate(profileData?.created_at)}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Last Login</span>
                      <span className="info-value">
                        {formatDate(profileData?.last_login)}
                      </span>
                    </div>
                  </div>
                </div>

                {profileData?.role === 'Doctor' && profileData?.doctor_info && (
                  <div className="info-section">
                    <h3>Professional Information</h3>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="info-label">Medical License ID</span>
                        <span className="info-value">
                          {profileData.doctor_info.medical_license_id || 'N/A'}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Specialty</span>
                        <span className="info-value">
                          {profileData.doctor_info.specialty || 'N/A'}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Hospital/Clinic</span>
                        <span className="info-value">
                          {profileData.doctor_info.hospital_clinic_name || 'N/A'}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Country</span>
                        <span className="info-value">
                          {profileData.doctor_info.country || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {(profileData?.role === 'Researcher' || profileData?.role === 'Student') && 
                  profileData?.academic_info && (
                  <div className="info-section">
                    <h3>Academic Information</h3>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="info-label">Institution</span>
                        <span className="info-value">
                          {profileData.academic_info.institution_name || 'N/A'}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Department</span>
                        <span className="info-value">
                          {profileData.academic_info.department || 'N/A'}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Position/Role</span>
                        <span className="info-value">
                          {profileData.academic_info.role_title || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="alert alert-error">
                <div>
                  <strong>Error:</strong> {error}
                </div>
              </div>
            )}

            {success && (
              <div className="alert alert-success">
                <div>
                  <strong>Success:</strong> {success}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
import React, { useState } from 'react';
import { 
  Home, 
  Activity, 
  History, 
  User, 
  LogOut, 
  Upload, 
  FilePlus, 
  Gamepad2, 
  BookOpen, 
  FolderSearch, 
  BarChart,
  Menu,
  X
} from 'lucide-react';

const Sidebar = ({ userRole = 'Doctor', onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Universal navigation items for all users
  const universalItems = [
    { label: 'Dashboard', icon: Home, route: '/dashboard' },
    { label: 'Predict', icon: Activity, route: '/predict' },
    { label: 'History', icon: History, route: '/history' },
    { label: 'Profile', icon: User, route: '/profile' },
  ];

  // Role-specific navigation items
  const roleSpecificItems = {
    Doctor: [
      { label: 'Upload CSV', icon: Upload, route: '/bulk-upload' },
      { label: 'Report Builder', icon: FilePlus, route: '/report-builder' },
    ],
    Student: [
      { label: 'Playground', icon: Gamepad2, route: '/playground' },
      { label: 'Learn', icon: BookOpen, route: '/learn' },
    ],
    Researcher: [
      { label: 'Dataset Explorer', icon: FolderSearch, route: '/datasets' },
      { label: 'Analysis', icon: BarChart, route: '/analysis' },
    ],
  };

  // Combine universal and role-specific items
  const navigationItems = [
    ...universalItems,
    ...(roleSpecificItems[userRole] || []),
  ];

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button 
        className="mobile-menu-toggle"
        onClick={toggleMobileMenu}
        aria-label="Toggle mobile menu"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <nav className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        {/* Logo Section */}
        <div className="sidebar-logo">
          <img
            src="/LiverenseLogo.png"
            alt="LiverLens Logo"
            className="logo-img"
          />
          {!isCollapsed && (
            <h2 className="logo-text">LiverLens</h2>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <button 
          className="collapse-toggle desktop-only"
          onClick={toggleCollapse}
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>

        {/* User Info */}
        <div className="user-info">
          <div className="user-avatar">
            <User size={24} />
          </div>
          {!isCollapsed && (
            <div className="user-details">
              <span className="user-role">{userRole}</span>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <ul className="nav-items">
          {navigationItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <li key={index} className="nav-item">
                <a 
                  href={item.route}
                  className="nav-link"
                  onClick={handleNavClick}
                  title={isCollapsed ? item.label : ''}
                >
                  <IconComponent size={20} className="nav-icon" />
                  {!isCollapsed && (
                    <span className="nav-label">{item.label}</span>
                  )}
                </a>
              </li>
            );
          })}
        </ul>

        {/* Logout Button */}
        <div className="sidebar-footer">
          <button 
            className="logout-btn"
            onClick={handleLogout}
            title={isCollapsed ? 'Logout' : ''}
          >
            <LogOut size={20} className="nav-icon" />
            {!isCollapsed && (
              <span className="nav-label">Logout</span>
            )}
          </button>
        </div>
      </nav>

      <style jsx>{`
        .mobile-menu-toggle {
          display: none;
          position: fixed;
          top: 1rem;
          left: 1rem;
          z-index: 1001;
          background: linear-gradient(135deg, #3b82f6, #06b6d4);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 0.5rem;
          cursor: pointer;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .mobile-menu-toggle:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .mobile-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 998;
        }

        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          width: 280px;
          background: linear-gradient(135deg, #3b82f6, #06b6d4);
          color: white;
          padding: 0;
          z-index: 999;
          transition: all 0.3s ease;
          box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }

        .sidebar.collapsed {
          width: 70px;
        }

        .sidebar-logo {
          padding: 1.5rem 1rem;
          text-align: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .logo-img {
          width: 50px;
          height: 50px;
          object-fit: contain;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.1);
          padding: 0.5rem;
        }

        .logo-text {
          font-size: 1.2rem;
          font-weight: 600;
          margin: 0;
          opacity: 0.9;
        }

        .collapse-toggle {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: white;
          border-radius: 6px;
          padding: 0.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .collapse-toggle:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .desktop-only {
          display: block;
        }

        .user-info {
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .user-details {
          flex: 1;
          min-width: 0;
        }

        .user-role {
          font-size: 0.9rem;
          opacity: 0.9;
          font-weight: 500;
        }

        .nav-items {
          list-style: none;
          padding: 0;
          margin: 0;
          flex: 1;
          padding-top: 1rem;
        }

        .nav-item {
          margin: 0;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 1rem;
          color: white;
          text-decoration: none;
          transition: all 0.3s ease;
          border-left: 3px solid transparent;
        }

        .nav-link:hover {
          background: rgba(255, 255, 255, 0.1);
          border-left-color: rgba(255, 255, 255, 0.5);
        }

        .nav-link:active,
        .nav-link.active {
          background: rgba(255, 255, 255, 0.15);
          border-left-color: white;
        }

        .nav-icon {
          flex-shrink: 0;
        }

        .nav-label {
          font-size: 0.9rem;
          font-weight: 500;
          opacity: 0.95;
        }

        .sidebar-footer {
          padding: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          margin-top: auto;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.875rem 1rem;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 8px;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .logout-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }

        .collapsed .nav-label,
        .collapsed .user-details,
        .collapsed .logo-text {
          display: none;
        }

        .collapsed .nav-link,
        .collapsed .logout-btn {
          justify-content: center;
          padding-left: 0;
          padding-right: 0;
        }

        .collapsed .user-info {
          justify-content: center;
        }

        /* Mobile Styles */
        @media (max-width: 768px) {
          .mobile-menu-toggle {
            display: block;
          }

          .mobile-overlay {
            display: block;
          }

          .desktop-only {
            display: none;
          }

          .sidebar {
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }

          .sidebar.mobile-open {
            transform: translateX(0);
          }

          .sidebar.collapsed {
            width: 280px;
          }

          .collapsed .nav-label,
          .collapsed .user-details,
          .collapsed .logo-text {
            display: block;
          }

          .collapsed .nav-link,
          .collapsed .logout-btn {
            justify-content: flex-start;
            padding: 0.875rem 1rem;
          }

          .collapsed .user-info {
            justify-content: flex-start;
          }
        }

        /* Tablet Styles */
        @media (min-width: 769px) and (max-width: 1024px) {
          .sidebar {
            width: 250px;
          }
        }

        /* Large Desktop Styles */
        @media (min-width: 1200px) {
          .sidebar {
            width: 320px;
          }
        }

        /* Scrollbar Styling */
        .sidebar::-webkit-scrollbar {
          width: 4px;
        }

        .sidebar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
        }

        .sidebar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
        }

        .sidebar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </>
  );
};

export default Sidebar;
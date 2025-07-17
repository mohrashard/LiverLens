import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const Sidebar = ({ userRole = 'Doctor', onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation(); 

  // Universal navigation items for all users
  const universalItems = [
    { label: 'Dashboard', icon: Home, route: '/dashboard' },
    { label: 'Predict', icon: Activity, route: '/predict' },
    { label: 'History', icon: History, route: '/history' },
    { label: 'Profile', icon: User, route: '/ProfilePage' },
  ];

  // Role-specific navigation items
  const roleSpecificItems = {
    Doctor: [
      { label: 'Upload CSV', icon: Upload, route: '/UploadCSVPage' },
      { label: 'Report Builder', icon: FilePlus, route: '/ReportBuilderPage' },
    ],
    Student: [
      { label: 'Playground', icon: Gamepad2, route: '/PlaygroundPage' },
      { label: 'Learn', icon: BookOpen, route: '/learn' },
    ],
    Researcher: [
      { label: 'Dataset Explorer', icon: FolderSearch, route: '/DatasetExplorerPage' },
      { label: 'Analysis', icon: BarChart, route: '/AnalysisPage' },
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
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <nav
        className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${
          isMobileMenuOpen ? 'mobile-open' : ''
        }`}
      >
        {/* Logo Section */}
        <div className="sidebar-logo">
          <div className="logo-container">
            <img
              src="/LiverenseLogo.png"
              alt="LiverLens Logo"
              className="logo-img"
            />
          </div>
          {!isCollapsed && <h2 className="logo-text">LiverLens</h2>}
        </div>


        {/* User Info */}
        <div className="user-info">
          <div className="user-avatar">
            <User size={18} />
          </div>
          {!isCollapsed && (
            <div className="user-details">
              <span className="user-role">{userRole}</span>
              <span className="user-status">Online</span>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <ul className="nav-items">
          {navigationItems.map((item, index) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.route;
            return (
              <li key={index} className="nav-item">
                <Link
                  to={item.route}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                  onClick={handleNavClick}
                  title={isCollapsed ? item.label : ''}
                >
                  <IconComponent size={18} className="nav-icon" />
                  {!isCollapsed && (
                    <span className="nav-label">{item.label}</span>
                  )}
                  {isActive && <div className="active-indicator" />}
                </Link>
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
            <LogOut size={18} className="nav-icon" />
            {!isCollapsed && <span className="nav-label">Logout</span>}
          </button>
        </div>
      </nav>

      <style jsx>{`
        .mobile-menu-toggle {
          display: none;
          position: fixed;
          top: 0.75rem;
          left: 0.75rem;
          z-index: 1001;
          background: linear-gradient(135deg, #1e293b, #334155);
          color: white;
          border: none;
          border-radius: 10px;
          padding: 0.6rem;
          cursor: pointer;
          box-shadow: 0 3px 15px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .mobile-menu-toggle:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
          background: linear-gradient(135deg, #334155, #475569);
        }

        .mobile-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          z-index: 998;
          backdrop-filter: blur(2px);
        }

        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          width: 260px;
          background: linear-gradient(180deg, #1e293b 0%, #334155 100%);
          color: white;
          padding: 0;
          z-index: 999;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          border-right: 1px solid rgba(148, 163, 184, 0.1);
        }

        .sidebar.collapsed {
          width: 70px;
        }

        .sidebar-logo {
          padding: 1.25rem;
          text-align: center;
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(6, 182, 212, 0.05));
        }

        .logo-container {
          width: 45px;
          height: 45px;
          background: linear-gradient(135deg, #3b82f6, #06b6d4);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 3px 12px rgba(59, 130, 246, 0.3);
          transition: all 0.3s ease;
        }

        .logo-container:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(59, 130, 246, 0.4);
        }

        .logo-img {
          width: 28px;
          height: 28px;
          object-fit: contain;
          filter: brightness(1.1);
        }

        .logo-text {
          font-size: 1.2rem;
          font-weight: 700;
          margin: 0;
          background: linear-gradient(135deg, #3b82f6, #06b6d4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.02em;
        }

        .collapse-toggle {
          position: absolute;
          top: 1rem;
          right: 0.75rem;
          background: rgba(148, 163, 184, 0.1);
          border: 1px solid rgba(148, 163, 184, 0.2);
          color: #cbd5e1;
          border-radius: 6px;
          padding: 0.4rem;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .collapse-toggle:hover {
          background: rgba(148, 163, 184, 0.2);
          color: white;
          transform: scale(1.05);
        }

        .desktop-only {
          display: block;
        }

        .user-info {
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
          background: rgba(59, 130, 246, 0.05);
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #3b82f6, #06b6d4);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }

        .user-details {
          flex: 1;
          min-width: 0;
        }

        .user-role {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: #e2e8f0;
          margin-bottom: 0.15rem;
        }

        .user-status {
          display: block;
          font-size: 0.75rem;
          color: #10b981;
          font-weight: 500;
        }

        .nav-items {
          list-style: none;
          padding: 0;
          margin: 0;
          flex: 1;
          padding: 0.75rem 0;
        }

        .nav-item {
          margin: 0.15rem 0;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          color: #cbd5e1;
          text-decoration: none;
          transition: all 0.3s ease;
          position: relative;
          border-radius: 0 20px 20px 0;
          margin-right: 0.75rem;
        }

        .nav-link:hover {
          background: rgba(59, 130, 246, 0.1);
          color: white;
          transform: translateX(5px);
        }

        .nav-link.active {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(6, 182, 212, 0.1));
          color: white;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
        }

        .active-indicator {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 20px;
          background: linear-gradient(135deg, #3b82f6, #06b6d4);
          border-radius: 0 3px 3px 0;
        }

        .nav-icon {
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .nav-link:hover .nav-icon {
          transform: scale(1.1);
        }

        .nav-label {
          font-size: 0.85rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .sidebar-footer {
          padding: 1rem;
          border-top: 1px solid rgba(148, 163, 184, 0.1);
          margin-top: auto;
          background: rgba(30, 41, 59, 0.5);
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.75rem 1rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 10px;
          color: #fca5a5;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          color: #fecaca;
          transform: translateY(-1px);
          box-shadow: 0 3px 12px rgba(239, 68, 68, 0.2);
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
          margin-right: 0;
          border-radius: 0;
        }

        .collapsed .user-info {
          justify-content: center;
        }

        .collapsed .sidebar-logo {
          padding: 1rem;
        }

        .collapsed .logo-container {
          width: 40px;
          height: 40px;
        }

        .collapsed .logo-img {
          width: 24px;
          height: 24px;
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
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .sidebar.mobile-open {
            transform: translateX(0);
          }

          .sidebar.collapsed {
            width: 260px;
          }

          .collapsed .nav-label,
          .collapsed .user-details,
          .collapsed .logo-text {
            display: block;
          }

          .collapsed .nav-link,
          .collapsed .logout-btn {
            justify-content: flex-start;
            padding: 0.75rem 1rem;
            margin-right: 0.75rem;
            border-radius: 0 20px 20px 0;
          }

          .collapsed .user-info {
            justify-content: flex-start;
          }

          .collapsed .sidebar-logo {
            padding: 1.25rem;
          }
        }

        /* Tablet Styles */
        @media (min-width: 769px) and (max-width: 1024px) {
          .sidebar {
            width: 240px;
          }

          .mobile-menu-toggle {
            display: none;
          }
        }

        /* Large Desktop Styles */
        @media (min-width: 1200px) {
          .sidebar {
            width: 280px;
          }
        }

        /* Scrollbar Styling */
        .sidebar::-webkit-scrollbar {
          width: 4px;
        }

        .sidebar::-webkit-scrollbar-track {
          background: rgba(148, 163, 184, 0.1);
          border-radius: 2px;
        }

        .sidebar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.3);
          border-radius: 2px;
        }

        .sidebar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.5);
        }

        /* Animations */
        @keyframes slideIn {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .nav-item {
          animation: slideIn 0.3s ease forwards;
        }

        .nav-item:nth-child(1) { animation-delay: 0.05s; }
        .nav-item:nth-child(2) { animation-delay: 0.1s; }
        .nav-item:nth-child(3) { animation-delay: 0.15s; }
        .nav-item:nth-child(4) { animation-delay: 0.2s; }
        .nav-item:nth-child(5) { animation-delay: 0.25s; }
        .nav-item:nth-child(6) { animation-delay: 0.3s; }
      `}</style>
    </>
  );
};

export default Sidebar;
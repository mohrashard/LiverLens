// pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../auth'; 

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: 'Login successful! Redirecting to dashboard...' 
        });
        setTimeout(() => navigate('/dashboard'), 1500); // Updated to '/dashboard'
      } else {
        setMessage({ 
          type: 'error', 
          text: result.error || 'Login failed. Please try again.' 
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Network error. Please check your connection and try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div style={styles.container}>
      <div style={styles.formCard} className="login-card">
        <div style={styles.header}>
          <h1 style={styles.title}>Welcome to LiverLens</h1>
          <p style={styles.subtitle}>Sign in to your LiverLens account</p>
        </div>

        {message.text && (
          <div
            style={{
              ...styles.message,
              ...(message.type === "success"
                ? styles.successMessage
                : styles.errorMessage),
            }}
          >
            {message.text}
          </div>
        )}

        <div style={styles.form}>
          {/* Email Input */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address *</label>
            <div style={styles.inputContainer}>
              <Mail style={styles.inputIcon} size={20} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                style={{
                  ...styles.input,
                  ...styles.inputWithIcon,
                  ...(errors.email ? styles.inputError : {}),
                }}
                placeholder="Enter your email"
              />
            </div>
            {errors.email && (
              <span style={styles.errorText}>{errors.email}</span>
            )}
          </div>

          {/* Password Input */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password *</label>
            <div style={styles.inputContainer}>
              <Lock style={styles.inputIcon} size={20} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                style={{
                  ...styles.input,
                  ...styles.inputWithIcon,
                  ...styles.inputWithToggle,
                  ...(errors.password ? styles.inputError : {}),
                }}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.passwordToggle}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <span style={styles.errorText}>{errors.password}</span>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            style={{
              ...styles.submitButton,
              ...(isLoading ? styles.submitButtonDisabled : {}),
            }}
          >
            {isLoading ? (
              <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                Signing In...
              </div>
            ) : (
              "Sign In"
            )}
          </button>
        </div>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Don't have an account?{" "}
            <span style={styles.link} onClick={() => navigate('/register')}>
              Register now
            </span>
          </p>
          <p style={styles.footerText}>
            <span style={styles.link} onClick={() => navigate('/forgot-password')}>
              Forgot password?
            </span>
          </p>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .login-card {
            animation: slideUp 0.6s ease-out;
          }
          
          @media (max-width: 768px) {
            .login-container {
              padding: 16px !important;
            }
            
            .login-card {
              padding: 24px !important;
            }
            
            .login-title {
              font-size: 24px !important;
            }
          }
        `}
      </style>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #1a2980 0%, #26d0ce 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  formCard: {
    background: "white",
    borderRadius: "16px",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
    padding: "40px",
    width: "100%",
    maxWidth: "480px",
    position: "relative",
    overflow: "hidden",
  },
  header: {
    textAlign: "center",
    marginBottom: "32px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#2d3748",
    margin: "0 0 8px 0",
    background: "linear-gradient(135deg, #1a2980 0%, #26d0ce 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  subtitle: {
    fontSize: "16px",
    color: "#718096",
    margin: "0",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#4a5568",
  },
  inputContainer: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  input: {
    padding: "12px 16px",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "16px",
    transition: "all 0.3s ease",
    outline: "none",
    backgroundColor: "#ffffff",
    width: "100%",
    boxSizing: "border-box",
  },
  inputWithIcon: {
    paddingLeft: "48px",
  },
  inputWithToggle: {
    paddingRight: "48px",
  },
  inputIcon: {
    position: "absolute",
    left: "14px",
    color: "#a0aec0",
    zIndex: 1,
    pointerEvents: "none",
  },
  passwordToggle: {
    position: "absolute",
    right: "14px",
    background: "none",
    border: "none",
    color: "#a0aec0",
    cursor: "pointer",
    padding: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "color 0.3s ease",
  },
  inputError: {
    borderColor: "#f56565",
  },
  errorText: {
    fontSize: "12px",
    color: "#f56565",
    marginTop: "4px",
  },
  submitButton: {
    padding: "14px 24px",
    background: "linear-gradient(135deg, #1a2980 0%, #26d0ce 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginTop: "8px",
  },
  submitButtonDisabled: {
    opacity: "0.7",
    cursor: "not-allowed",
  },
  loadingContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  spinner: {
    width: "20px",
    height: "20px",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    borderTop: "2px solid white",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  message: {
    padding: "12px 16px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "20px",
    textAlign: "center",
  },
  successMessage: {
    backgroundColor: "#f0fff4",
    color: "#38a169",
    border: "1px solid #9ae6b4",
  },
  errorMessage: {
    backgroundColor: "#fed7d7",
    color: "#c53030",
    border: "1px solid #feb2b2",
  },
  footer: {
    textAlign: "center",
    marginTop: "24px",
    paddingTop: "24px",
    borderTop: "1px solid #e2e8f0",
  },
  footerText: {
    fontSize: "14px",
    color: "#718096",
    margin: "0 0 8px 0",
  },
  link: {
    color: "#1a2980",
    textDecoration: "none",
    fontWeight: "600",
    cursor: "pointer",
    transition: "color 0.2s",
  },
};

export default LoginPage;
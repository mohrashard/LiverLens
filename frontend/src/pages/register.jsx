import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const UserRegistration = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
    role: "",
    // Doctor-specific fields
    medical_license_id: "",
    specialty: "",
    hospital_clinic_name: "",
    country: "",
    // Academic fields
    institution_name: "",
    department: "",
    role_title: ""
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const navigate = useNavigate();

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one digit";
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return "Password must contain at least one special character";
    }
    
    return "";
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.full_name.trim()) {
      newErrors.full_name = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else {
      const passwordError = validatePassword(formData.password);
      if (passwordError) {
        newErrors.password = passwordError;
      }
    }

    if (!formData.confirm_password) {
      newErrors.confirm_password = "Password confirmation is required";
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    if (!formData.role) {
      newErrors.role = "User role is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // Prepare data for backend
      const requestData = {
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirm_password,
        role: formData.role
      };

      // Add role-specific fields
      if (formData.role === "Doctor") {
        requestData.medical_license_id = formData.medical_license_id;
        requestData.specialty = formData.specialty;
        requestData.hospital_clinic_name = formData.hospital_clinic_name;
        requestData.country = formData.country;
      } else if (["Researcher", "Student"].includes(formData.role)) {
        requestData.institution_name = formData.institution_name;
        requestData.department = formData.department;
        requestData.role_title = formData.role_title;
      }

      const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Registration successful! Welcome to LiverLens!",
        });

        // Clear form on success
        setFormData({
          full_name: "",
          email: "",
          password: "",
          confirm_password: "",
          role: "",
          medical_license_id: "",
          specialty: "",
          hospital_clinic_name: "",
          country: "",
          institution_name: "",
          department: "",
          role_title: ""
        });
      } else {
        setMessage({
          type: "error",
          text: data.error || "Registration failed. Please try again.",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Network error. Please check your connection and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  // Render role-specific fields
  const renderRoleSpecificFields = () => {
    if (formData.role === "Doctor") {
      return (
        <>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Medical License ID</label>
            <input
              type="text"
              name="medical_license_id"
              value={formData.medical_license_id}
              onChange={handleChange}
              style={styles.input}
              placeholder="Enter your medical license ID"
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Specialty</label>
            <input
              type="text"
              name="specialty"
              value={formData.specialty}
              onChange={handleChange}
              style={styles.input}
              placeholder="e.g., Hepatology"
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Hospital/Clinic Name</label>
            <input
              type="text"
              name="hospital_clinic_name"
              value={formData.hospital_clinic_name}
              onChange={handleChange}
              style={styles.input}
              placeholder="Where you practice"
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Country</label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              style={styles.input}
              placeholder="Your country"
            />
          </div>
        </>
      );
    } else if (["Researcher", "Student"].includes(formData.role)) {
      return (
        <>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Institution Name</label>
            <input
              type="text"
              name="institution_name"
              value={formData.institution_name}
              onChange={handleChange}
              style={styles.input}
              placeholder="e.g., University of Colombo"
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Department</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              style={styles.input}
              placeholder="e.g., Medical Research Lab"
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Role / Title</label>
            <input
              type="text"
              name="role_title"
              value={formData.role_title}
              onChange={handleChange}
              style={styles.input}
              placeholder="e.g., PhD Student, Intern"
            />
          </div>
        </>
      );
    }
    return null;
  };

  return (
    <div style={styles.container}>
      <div style={styles.formCard} className="registration-card">
        <div style={styles.header}>
          <h1 style={styles.title}>Create LiverLens Account</h1>
          <p style={styles.subtitle}>Join our community of medical professionals and researchers</p>
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
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name *</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              style={{
                ...styles.input,
                ...(errors.full_name ? styles.inputError : {}),
              }}
              placeholder="Enter your full name"
            />
            {errors.full_name && (
              <span style={styles.errorText}>{errors.full_name}</span>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              style={{
                ...styles.input,
                ...(errors.email ? styles.inputError : {}),
              }}
              placeholder="Enter your email"
            />
            {errors.email && (
              <span style={styles.errorText}>{errors.email}</span>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              style={{
                ...styles.input,
                ...(errors.password ? styles.inputError : {}),
              }}
              placeholder="Create a strong password"
            />
            {errors.password && (
              <span style={styles.errorText}>{errors.password}</span>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm Password *</label>
            <input
              type="password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              style={{
                ...styles.input,
                ...(errors.confirm_password ? styles.inputError : {}),
              }}
              placeholder="Confirm your password"
            />
            {errors.confirm_password && (
              <span style={styles.errorText}>{errors.confirm_password}</span>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>User Role *</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={{
                ...styles.input,
                ...(errors.role ? styles.inputError : {}),
                padding: "12px",
              }}
            >
              <option value="">Select your role</option>
              <option value="Doctor">Doctor</option>
              <option value="Researcher">Researcher</option>
              <option value="Student">Student</option>
            </select>
            {errors.role && (
              <span style={styles.errorText}>{errors.role}</span>
            )}
          </div>

          {/* Render role-specific fields */}
          {renderRoleSpecificFields()}

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
                Creating Account...
              </div>
            ) : (
              "Create Account"
            )}
          </button>
        </div>

        <div style={styles.footer}>
          <p>
            Already have an account?{" "}
            <span style={styles.link} onClick={() => navigate("/LoginPage")}>
              Sign in
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
          
          .registration-card {
            animation: slideUp 0.6s ease-out;
          }
          
          @media (max-width: 768px) {
            .registration-container {
              padding: 16px !important;
            }
            
            .registration-card {
              padding: 24px !important;
            }
            
            .registration-title {
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
    maxWidth: "520px",
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
  input: {
    padding: "12px 16px",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "16px",
    transition: "all 0.3s ease",
    outline: "none",
    backgroundColor: "#ffffff",
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
    margin: "0",
  },
  link: {
    color: "#1a2980",
    textDecoration: "none",
    fontWeight: "600",
    cursor: "pointer",
    transition: "color 0.2s",
  },
};

export default UserRegistration;
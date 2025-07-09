import { useEffect, useState } from "react";
import "../styles/LiverLensLanding.css";

const LiverLensLanding = () => {
  const [scrollY, setScrollY] = useState(0);
  const [activeSection, setActiveSection] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);

      const sections = [
        "home",
        "about",
        "features",
        "demo",
        "testimonials",
        "faq",
        "contact",
      ];
      const currentSection = sections.find((section) => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });

      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  const handleGetStarted = () => {
    // Navigate to get started page
    window.location.href = "/register";
  };

  const handleRegister = () => {
    // Navigate to register page
    window.location.href = "/register";
  };

  const features = [
    {
      title: "AI-Powered Predictions",
      description:
        "Advanced machine learning algorithms analyze patient data to predict liver disease outcomes with 96% accuracy.",
      icon: "🧠",
      delay: "0.1s",
    },
    {
      title: "Secure Data Input",
      description:
        "HIPAA-compliant platform ensures patient data security with end-to-end encryption and audit trails.",
      icon: "🛡️",
      delay: "0.2s",
    },
    {
      title: "Real-Time Results",
      description:
        "Get instant risk assessments and predictions within seconds of data input for immediate clinical decisions.",
      icon: "⏱️",
      delay: "0.3s",
    },
    {
      title: "Role-Based Dashboards",
      description:
        "Customized interfaces for doctors, researchers, and students with appropriate access levels and tools.",
      icon: "👥",
      delay: "0.4s",
    },
    {
      title: "Clinical Analytics",
      description:
        "Comprehensive reporting and trend analysis to support research and improve patient outcomes.",
      icon: "📊",
      delay: "0.5s",
    },
    {
      title: "EHR Integration",
      description:
        "Seamlessly integrate with existing Electronic Health Record systems and medical databases.",
      icon: "🗄️",
      delay: "0.6s",
    },
  ];

  const demoFeatures = [
    {
      title: "Interactive AI Demo",
      description:
        "Experience our AI prediction engine with real anonymized case studies and see instant results.",
      icon: "🤖",
      features: [
        "Live prediction simulation",
        "Real-time risk assessment",
        "Interactive data visualization",
        "Instant feedback system",
      ],
      cta: "Try Demo Now",
    },
    {
      title: "Virtual Lab Tour",
      description:
        "Take a 3D virtual tour of our research facilities and see how our AI models are developed.",
      icon: "🔬",
      features: [
        "360° lab experience",
        "Meet our research team",
        "See AI training process",
        "Behind-the-scenes access",
      ],
      cta: "Start Tour",
    },
    {
      title: "Free Training Course",
      description:
        "Complete our comprehensive course on AI in hepatology and earn a certificate of completion.",
      icon: "🎓",
      features: [
        "10+ hours of content",
        "Expert-led sessions",
        "Hands-on exercises",
        "Professional certificate",
      ],
      cta: "Enroll Free",
    },
  ];

  const testimonials = [
    {
      quote:
        "LiverLens has revolutionized our hepatology practice. The AI predictions help us identify at-risk patients weeks before traditional methods.",
      author: "Dr. Sarah Chen",
      role: "Chief of Hepatology",
      company: "Johns Hopkins Hospital",
      delay: "0.1s",
    },
    {
      quote:
        "The accuracy of LiverLens predictions has improved our patient outcomes by 40%. It's an essential tool in our liver transplant program.",
      author: "Dr. Marcus Rodriguez",
      role: "Transplant Surgeon",
      company: "Mayo Clinic",
      delay: "0.2s",
    },
    {
      quote:
        "As a researcher, LiverLens provides invaluable insights into liver disease progression. The data analytics are exceptional.",
      author: "Dr. Emily Watson",
      role: "Research Director",
      company: "Cleveland Clinic",
      delay: "0.3s",
    },
  ];

  const faqs = [
    {
      question: "How accurate are the liver disease predictions?",
      answer:
        "Our AI model achieves 96% accuracy in predicting liver disease outcomes, trained on over 2 million anonymized patient records from leading medical institutions worldwide.",
    },
    {
      question: "Is patient data secure and HIPAA compliant?",
      answer:
        "Yes, LiverLens is fully HIPAA compliant with enterprise-grade security, end-to-end encryption, and regular security audits. Patient data never leaves your secure environment.",
    },
    {
      question: "What types of liver conditions can LiverLens predict?",
      answer:
        "LiverLens can predict outcomes for various conditions including hepatitis, cirrhosis, fatty liver disease, liver fibrosis, and transplant success rates.",
    },
    {
      question: "How does LiverLens integrate with existing EHR systems?",
      answer:
        "We support integration with major EHR systems including Epic, Cerner, and Allscripts through secure APIs and HL7 FHIR standards.",
    },
    {
      question: "Is LiverLens really free to use?",
      answer:
        "Yes! LiverLens is completely free for healthcare professionals, students, and researchers. We believe AI-powered healthcare tools should be accessible to everyone working to improve patient outcomes.",
    },
  ];

  return (
    <div className="liverlens-app">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-brand">
            <div className="nav-logo">
              <img
                src="/LiverenseLogo.png"
                alt="LiverLens Logo"
                className="logo-img"
              />
            </div>
            <span className="brand-text">LiverLens</span>
          </div>

          {/* Desktop Menu */}
          <div className="nav-menu desktop">
            {[
              "Home",
              "About",
              "Features",
              "Demo",
              "Testimonials",
              "FAQ",
              "Contact",
            ].map((item) => (
              <button
                key={item}
                className={`nav-link ${
                  activeSection === item.toLowerCase() ? "active" : ""
                }`}
                onClick={() => scrollToSection(item.toLowerCase())}
              >
                {item}
              </button>
            ))}
          </div>

          <a
            href="/register"
            className="nav-cta desktop"
            onClick={handleGetStarted}
          >
            Get Started
          </a>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn desktop"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="mobile-menu">
              {[
                "Home",
                "About",
                "Features",
                "Demo",
                "Testimonials",
                "FAQ",
                "Contact",
              ].map((item) => (
                <button
                  key={item}
                  className="mobile-menu-item"
                  onClick={() => scrollToSection(item.toLowerCase())}
                >
                  {item}
                </button>
              ))}
              <div className="mobile-cta">
                <a href="/register" onClick={handleGetStarted}>
                  Get Started
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* 3D Background Elements */}
      <div className="hero-3d-bg floating-3d">
        <div className="cube-3d">
          <div className="cube-face front"></div>
          <div className="cube-face back"></div>
          <div className="cube-face right"></div>
          <div className="cube-face left"></div>
          <div className="cube-face top"></div>
          <div className="cube-face bottom"></div>
        </div>
      </div>

      <div className="hero-3d-bg-left floating-3d delay-1">
        <div className="sphere-3d"></div>
      </div>

      <div className="hero-3d-bg-center floating-3d delay-2">
        <div className="pyramid-3d"></div>
      </div>

      {/* Hero Section */}
      <section id="home" className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <div className="hero-badge">
                🆓 Completely Free • AI-Powered Healthcare
              </div>
              <h1 className="hero-title">
                Predict Liver Health with{" "}
                <span className="hero-gradient">Confidence</span>
              </h1>
              <p className="hero-subtitle">
                Empower healthcare professionals with AI-driven insights to
                predict liver disease outcomes, enabling early intervention and
                improved patient care through advanced machine learning. Always
                free, always accessible.
              </p>

              <div className="hero-buttons">
                <a
                  href="/register"
                  className="btn-primary"
                  onClick={handleGetStarted}
                >
                  Start Free Analysis
                </a>
                <a
                  href="/register"
                  className="btn-secondary"
                  onClick={handleRegister}
                >
                  Create Account
                </a>
              </div>

              <div className="hero-stats">
                <div className="stat-item">
                  <span className="stat-number">96%</span>
                  <span className="stat-label">Prediction Accuracy</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">2M+</span>
                  <span className="stat-label">Patient Records</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">100%</span>
                  <span className="stat-label">Free Forever</span>
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <div className="dashboard-mockup">
                <div className="mockup-header">
                  <div className="mockup-dot dot-red"></div>
                  <div className="mockup-dot dot-yellow"></div>
                  <div className="mockup-dot dot-green"></div>
                </div>

                <div className="risk-assessment">
                  <div className="risk-header">
                    <span className="risk-label">Risk Assessment</span>
                    <div className="risk-badge">High Risk</div>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill"></div>
                  </div>
                </div>

                <div className="metrics-grid">
                  <div className="metric-card">
                    <div className="metric-value blue">87%</div>
                    <div className="metric-label">Fibrosis Risk</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-value cyan">23</div>
                    <div className="metric-label">MELD Score</div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="floating-element top-right">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <div className="floating-element bottom-left">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="container">
          <div className="about-content">
            <div>
              <h2 className="section-title">Empowering Healthcare Decisions</h2>
              <p className="section-subtitle">
                LiverLens helps doctors and researchers make early, informed
                decisions about liver health. Our AI-powered platform analyzes
                complex patient data to predict disease progression, enabling
                proactive treatment strategies and improved patient outcomes.
                Best of all, it's completely free for all healthcare
                professionals.
              </p>

              <div className="about-stats">
                <div className="stat-card">
                  <div className="stat-card-value blue">85%</div>
                  <p className="stat-card-label">Earlier Detection</p>
                </div>
                <div className="stat-card">
                  <div className="stat-card-value cyan">40%</div>
                  <p className="stat-card-label">Better Outcomes</p>
                </div>
                <div className="stat-card">
                  <div className="stat-card-value green">100%</div>
                  <p className="stat-card-label">Free Access</p>
                </div>
              </div>
            </div>

            <div className="about-visual">
              <div className="feature-list">
                <div className="feature-item">
                  <svg
                    className="feature-icon blue"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="feature-text">Clinical Excellence</span>
                </div>
                <div className="feature-item">
                  <svg
                    className="feature-icon cyan"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  <span className="feature-text">AI Innovation</span>
                </div>
                <div className="feature-item">
                  <svg
                    className="feature-icon green"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <span className="feature-text">Data Security</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              Advanced Features for Healthcare Professionals
            </h2>
            <p className="section-subtitle">
              Comprehensive tools designed to support clinical decision-making
              and improve patient outcomes
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-card-header">
                  <div className="feature-icon-wrapper">
                    <span style={{ fontSize: "1.5rem" }}>{feature.icon}</span>
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                </div>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section (Replaces Pricing) */}
      <section id="demo" className="demo-section">
        <div className="demo-3d-bg floating-3d delay-1">
          <div className="cube-3d">
            <div className="cube-face front"></div>
            <div className="cube-face back"></div>
            <div className="cube-face right"></div>
            <div className="cube-face left"></div>
            <div className="cube-face top"></div>
            <div className="cube-face bottom"></div>
          </div>
        </div>

        <div className="demo-3d-bg-left floating-3d delay-3">
          <div className="sphere-3d"></div>
        </div>

        <div className="container demo-container">
          <div className="demo-header">
            <div className="free-badge">🎉 100% Free Forever</div>
            <h2 className="demo-title">Experience LiverLens Interactive</h2>
            <p className="demo-subtitle">
              Dive deep into our AI-powered platform with hands-on experiences
              designed to showcase the power of machine learning in hepatology.
              No cost, no commitment - just cutting-edge healthcare technology.
            </p>
          </div>

          <div className="demo-grid">
            {demoFeatures.map((demo, index) => (
              <div key={index} className="demo-card">
                <div className="demo-card-icon">
                  <span>{demo.icon}</span>
                </div>
                <h3 className="demo-card-title">{demo.title}</h3>
                <p className="demo-card-description">{demo.description}</p>
                <div className="demo-features">
                  <ul>
                    {demo.features.map((feature, idx) => (
                      <li key={idx} className="demo-feature-item">
                        <svg
                          className="demo-check-icon"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="demo-feature-text">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <a
                  href="/register"
                  className="demo-cta"
                  onClick={handleRegister}
                >
                  {demo.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Trusted by Healthcare Leaders</h2>
            <p className="section-subtitle">
              See how medical professionals are improving patient outcomes with
              LiverLens
            </p>
          </div>

          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="star"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="testimonial-quote">
                  "{testimonial.quote}"
                </blockquote>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    {testimonial.author
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="author-info">
                    <div className="author-name">{testimonial.author}</div>
                    <div className="author-role">{testimonial.role}</div>
                    <div className="author-company">{testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="faq-section">
        <div className="faq-container">
          <div className="section-header">
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-subtitle">
              Everything you need to know about LiverLens
            </p>
          </div>

          <div className="faq-grid">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <h3 className="faq-question">{faq.question}</h3>
                <p className="faq-answer">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact/CTA Section */}
      <section id="contact" className="contact-section">
        <div className="contact-container">
          <h2 className="contact-title">Ready to Transform Liver Care?</h2>
          <p className="contact-subtitle">
            Join thousands of healthcare professionals using LiverLens to
            predict liver disease outcomes and improve patient care through
            AI-powered insights. Completely free, forever.
          </p>

          <div className="contact-form">
            <input
              type="email"
              placeholder="Enter your work email"
              className="email-input"
            />
            <a
              href="/register"
              className="btn-primary"
              onClick={handleRegister}
            >
              Start Free Account
            </a>
          </div>

          <p className="contact-note">
            No credit card required • Always free • HIPAA compliant
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="footer-logo">
                <div className="footer-logo-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span className="footer-brand-name">LiverLens</span>
              </div>
              <p className="footer-tagline">
                AI-Powered Liver Health Prediction Platform - Free Forever
              </p>
            </div>

            <div className="footer-column">
              <h4 className="footer-column-title">Product</h4>
              <div className="footer-links">
                <a href="#features" className="footer-link">
                  Features
                </a>
                <a href="#demo" className="footer-link">
                  Interactive Demo
                </a>
                <a href="/register" className="footer-link">
                  Free Account
                </a>
                <a href="#" className="footer-link">
                  API
                </a>
              </div>
            </div>

            <div className="footer-column">
              <h4 className="footer-column-title">Company</h4>
              <div className="footer-links">
                <a href="#about" className="footer-link">
                  About
                </a>
                <a href="#" className="footer-link">
                  Careers
                </a>
                <a href="#" className="footer-link">
                  Research
                </a>
                <a href="#" className="footer-link">
                  Press
                </a>
              </div>
            </div>

            <div className="footer-column">
              <h4 className="footer-column-title">Support</h4>
              <div className="footer-links">
                <a href="#" className="footer-link">
                  Help Center
                </a>
                <a href="#contact" className="footer-link">
                  Contact
                </a>
                <a href="#" className="footer-link">
                  Privacy
                </a>
                <a href="#" className="footer-link">
                  Terms
                </a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="footer-copyright">
              © 2024 LiverLens. All rights reserved. Free healthcare AI for
              everyone.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LiverLensLanding;

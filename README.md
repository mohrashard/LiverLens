````markdown
# 🩺 Liver Disease Risk Prediction System

## 🌟 Project Overview

This is a comprehensive web application designed to predict liver disease risk using machine learning, catering to different user roles: Doctors, Researchers, and Students. The system provides a personalized dashboard, real-time predictions, data analysis tools, and educational resources, all within a secure, role-based access control framework.

---

## ✨ Features

### 🌐 Universal Features (Available to All Users)
- **🔐 User Authentication:** Secure registration and login system with role-based access control (Doctor, Researcher, Student) using JWT. The backend uses the `werkzeug.security` module for password hashing and validation.
- **🏠 Dashboard:** A personalized landing page displaying a greeting, user statistics, last login date, and recent predictions.
- **🔍 Prediction History:** A searchable and filterable view of all past predictions made by the user.
- **🧭 Sidebar Navigation:** A clean, reusable, and role-aware sidebar with distinct icons for each section.
- **🔄 Profile Page:** A dedicated page to view and manage personal details such as name, email, role, join date, and last login.
- **🎨 Responsive UI:** A professional medical-themed user interface built with React and standard CSS, ensuring a seamless experience across all devices.
- **🤖 Prediction Page:** An interface for users to input patient data and receive an instant **High/Low Risk** prediction result in real time. The `predict.jsx` component handles form inputs and API calls.

### 🩺 Doctor Features
- **💉 Predict Liver Disease Risk:** Input clinical data for instant AI-powered risk prediction.
- **📤 Upload CSV for Bulk Prediction:** Upload a CSV file to perform predictions for multiple patients at once, improving clinical workflow efficiency.
- **📄 Report Builder:** Generate a detailed PDF report for any patient by entering their unique ID, which pulls data directly from the database.
- **🧾 Doctor’s Notes:** Add personal observations and notes directly to patient reports to enhance the clinical context.
- **📥 Downloadable Reports:** Export generated reports as printable PDF files.

### 🧪 Researcher Features
- **📂 Dataset Explorer:** Browse and analyze anonymized patient data, including inputs, predictions, and timestamps, with advanced filtering options.
- **🔎 Advanced Filtering:** Filter records by specific dates, data ranges, or risk levels.
- **📊 Summary Stats Panel:** View overall statistical insights such as averages, counts, and percentages for the entire dataset.
- **📈 Feature Distribution Charts:** Visualize the distribution of key clinical features (e.g., ALT, AST) across different patient groups.
- **🔥 Correlation Heatmap:** An interactive heatmap to visualize the relationships between various clinical features.
- **🧠 Feature Importance Analysis:** Understand which features the machine learning model considers most influential using SHAP/XGBoost visualizations.
- **⏳ Temporal Trends Chart:** Track how patient features and risk predictions change over time.
- **🧪 Subgroup Comparison Tool:** Compare statistics and trends across different demographic or patient subgroups.
- **📥 Export Data and Charts:** Download filtered datasets or generated graphs for further analysis.
- **🛡️ Researcher Access Control:** Restricted access to researcher-specific tools, available only to authenticated researcher accounts.

### 🎓 Student Features
- **📘 Learn Page:** A resource center with plain-language explanations of liver disease and its clinical features.
- **🖼️ Visual Tab:** Annotated images and charts to help students understand complex clinical data.
- **🤖 How the AI Works:** Explanations of the machine learning model's decision-making process.
- **🧪 Case Study Explorer:** An interactive tool to work on simulated or real-world cases and practice making predictions.
- **🎯 Quiz Generator:** Create custom quizzes based on saved notes or educational explanations.
- **🛡️ Student Access Control:** Access to student-specific educational tools, available only to authenticated student accounts.

---

## 🔒 Security & AI Features (Cross-Role)
- **🔐 Role-Based Routing:** Both frontend and backend enforce strict access rules based on user roles, with role checks implemented in route handlers.
- **🧠 XGBoost Model Integration:** The system uses a highly optimized XGBoost machine learning model for structured data prediction, chosen for its robustness with imbalanced data, high performance, and ability to handle missing values.
- **📈 Confidence Scores:** Each prediction is accompanied by a probability score to indicate the model's confidence.
- **⚖️ Feature Importance:** The model provides feature importance scores to display which features had the most significant influence on a given prediction.

---

## 🛠️ Technology Stack

- **Frontend:** React, Normal CSS
- **Backend:** Flask, Python
- **Database:** MongoDB
- **Machine Learning:** XGBoost (version 3.0.2), scikit-learn
- **Authentication:** JWT (JSON Web Tokens)
- **Deployment:** The model and preprocessing components are loaded at backend startup using `joblib`.

---

## 🧠 Machine Learning Approach

The project involved a comprehensive exploratory data analysis (EDA) of a liver disease dataset from Kaggle. The XGBoost model was trained using StratifiedKFold cross-validation and its hyperparameters were tuned using RandomizedSearchCV to optimize for generalization and reduce log loss. The model was evaluated using several metrics, including:

- **Accuracy:** 81.2%
- **ROC AUC:** 0.865
- **Log Loss:** 0.40

XGBoost was chosen over other models like Random Forest and Decision Tree due to its superior performance. The model's interpretability is enhanced using SHAP.

## 📂 Data Storage

The system uses MongoDB to store data in separate collections for modularity and scalability.
- **`users` collection:** Stores user profiles, hashed passwords, roles, and timestamps.
- **`predictions` collection:** Manages prediction requests, storing unique IDs, input data, model predictions, confidence scores, risk levels, and timestamps.

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.x:** Ensure you have Python installed.
- **Node.js & npm:** Required for the React frontend.
- **MongoDB:** A running instance of MongoDB is needed for the database.

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository_url>
   cd <repository_name>
````

2.  **Backend Setup:**

    ```bash
    cd backend
    pip install -r requirements.txt
    ```

      - **Configure Environment Variables:** Create a `.env` file and add your MongoDB connection string, JWT secret key, and any other necessary configuration.

3.  **Frontend Setup:**

    ```bash
    cd frontend
    npm install
    ```

### Running the Application

1.  **Start the Backend:**

    ```bash
    cd backend
    python app.py
    ```

      - The backend will run on `http://localhost:5000` (or the port you configure).

2.  **Start the Frontend:**

    ```bash
    cd frontend
    npm start
    ```

      - The frontend will run on `http://localhost:3000`.

-----

## ✍️ Contribution

Details on how to contribute will be added here.

```
```
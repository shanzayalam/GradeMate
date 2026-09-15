# Frontend Module Documentation (`Grademate-main`)

The GradeMate frontend is a modern Single Page Application (SPA) built using **React 18**, **Vite**, and **Tailwind CSS**.

---

## 📂 Component Directory Structure

```
Grademate-main/
├── src/
│   ├── api/                  # Template utilities
│   ├── components/
│   │   ├── dashboard/        # Dashboard components (QuizDetailsModal)
│   │   └── ui/               # Reusable UI elements (Button, Card, InputField, Header, Layout)
│   ├── context/
│   │   ├── AuthContext.jsx   # Global user state, login, signup, JWT token persistence
│   │   └── ProcessingContext.jsx # Quiz submission, grading context, plagiarism analysis API wrapper
│   ├── pages/
│   │   ├── Login.jsx         # Sign-in page
│   │   ├── SignUp.jsx        # Registration page
│   │   ├── Dashboard.jsx     # Instructor overview & statistics page
│   │   ├── GradingPage.jsx   # Quiz creation, solution upload & grading interface
│   │   ├── PlagiarismPage.jsx # Cross-submission plagiarism comparison page
│   │   ├── ForgotPassword.jsx # Email prompt for password reset
│   │   └── ResetPassword.jsx  # Token-based new password entry
│   ├── App.jsx               # React Router configuration & route protection
│   └── main.jsx              # Application entry point
├── package.json              # Frontend dependencies
├── tailwind.config.js        # Tailwind styling configuration
└── vite.config.js            # Vite build & proxy settings
```

---

## 🔑 Key Features & State Management

### 1. `AuthContext`
- Manages authentication state (`user`, `token`, `isAuthenticated`, `loading`).
- Persists JWT tokens in `localStorage`.
- Sets default `Authorization: Bearer <token>` header for Axios requests.

### 2. `ProcessingContext`
- Encapsulates API calls for quiz upload, grading, plagiarism analysis, and report generation.
- Transforms backend JSON responses into UI data structures.
- Generates downloadable Excel reports (`xlsx` package integration).

### 3. Route Protection (`PrivateRoute`)
- Ensures `/dashboard`, `/grading`, and `/plagiarism` are accessible only to authenticated users.
- Redirects unauthenticated users to `/`.

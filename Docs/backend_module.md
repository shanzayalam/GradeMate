# Backend Module Documentation (`gradeMate-backend`)

The backend is built with **Django 4.2+** and **Django REST Framework**.

---

## 📂 Module Structure

```
gradeMate-backend/
├── accounts/               # User authentication & profile management
│   ├── auth_utils.py       # JWT token generation, decoding & refreshing
│   ├── models.py           # User model schema
│   ├── urls.py             # Auth URL routes
│   └── views.py            # Login, Signup, Reset Password endpoints
├── quize/                  # Core quiz, OCR & AST grading engine
│   ├── AST_Levenshtein.py  # LLVM Clang AST parser & Levenshtein metrics
│   ├── models.py           # Quiz, StudentSubmission, Plagiarism models
│   ├── ocr.py              # OpenCV preprocessing & EasyOCR extraction
│   ├── urls.py             # Quiz URL routes
│   └── views.py            # Quiz upload, grading, stats & plagiarism views
├── gradeMate/              # Main Django project settings & URL routing
│   ├── settings.py         # Config, env vars, CORS, logging, security
│   └── urls.py             # Versioned API routes (/api/v1/)
└── utils/                  # Common helper utilities
    ├── decorators.py       # JWT authentication decorator
    └── emails.py           # Email templates & transactional email handler
```

---

## 🛡 Authentication & Security Standards

- **JWT Authentication**: JWT tokens are signed using HMAC SHA-256 (`HS256`) with `SECRET_KEY`.
- **Password Hashing**: Passwords are hashed using `BCryptSHA256PasswordHasher` (min 12 rounds) or fallback PBKDF2. Plaintext passwords are never stored.
- **Header Format**: Protected endpoints require `Authorization: Bearer <token>`.
- **Input Validation**: Request bodies are validated for required fields, types, and constraints before processing.
- **Environment Variables**: Confidential settings (`SECRET_KEY`, email credentials) are loaded dynamically from environment files (`.env`). No fallback defaults for sensitive keys.

---

## ⚡ API Endpoints Specification

### 1. Authentication (`/api/v1/auth/`)

- `POST /api/v1/auth/signup/`
  - Body: `{"email": "string", "password": "string", "name": "string"}`
  - Returns: `201 Created`

- `POST /api/v1/auth/login/`
  - Body: `{"email": "string", "password": "string"}`
  - Returns: `200 OK` with `token` and `user` profile data.

- `POST /api/v1/auth/search_email/`
  - Body: `{"email": "string"}`
  - Sends password reset token email.

- `POST /api/v1/auth/set_new_password/`
  - Body: `{"token": "string", "password": "string"}`
  - Updates account password.

### 2. Quizzes & Grading Engine (`/api/v1/quizzes/`)

- `POST /api/v1/quizzes/upload_quiz/` (JWT Required)
  - Content-Type: `multipart/form-data`
  - Form Fields: `quizName`, `logicWeight`, `similarityThreshold`, `total`, `solutionImage`, `studentNames` (array), `studentImages` (array)
  - Processing: Performs OCR on solution and student images, builds AST tree, calculates Levenshtein score, saves submissions, and returns structured student results.

- `POST /api/v1/quizzes/dashboard-stats/` (JWT Required)
  - Returns total quizzes count and recent quiz submission statistics.

- `POST /api/v1/quizzes/get_all_quizes/` (JWT Required)
  - Returns array of all quizzes created by authenticated user.

- `POST /api/v1/quizzes/quiz_view/` (JWT Required)
  - Body: `{"quiz_id": int}`
  - Returns detailed grade breakdown, highest/lowest scores, and passing rate.

- `POST /api/v1/quizzes/check_plagiarism/` (JWT Required)
  - Body: `{"quizId": int}`
  - Compares every pair of student submissions and returns similarity percentages with plagiarism flags.

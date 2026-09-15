# Database Module Documentation & Schema

GradeMate uses a relational database schema (SQLite for local dev, PostgreSQL for production).

---

## 📐 Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USER ||--o{ QUIZ : "creates"
    QUIZ ||--o| QUIZ_SOLUTION : "has"
    QUIZ ||--o{ STUDENT_SUBMISSION : "contains"
    USER ||--o{ PLAGIARISM_RESULT : "student1"
    USER ||--o{ PLAGIARISM_RESULT : "student2"

    USER {
        int id PK
        string email UK
        string password
        string name
        boolean active_status
        boolean email_verified
        string token_secret
        datetime created_at
        datetime updated_at
    }

    QUIZ {
        int id PK
        string name
        int created_by_id FK
        date date
        float logic_weight
        float similarity_threshold
        datetime created_at
        datetime updated_at
    }

    QUIZ_SOLUTION {
        int id PK
        int quiz_id FK, UK
        string solution_image
        text extracted_solution_text
    }

    STUDENT_SUBMISSION {
        int id PK
        int quiz_id FK
        string student
        string submission_image
        text extracted_text
        float score
        boolean graded
        datetime created_at
    }

    PLAGIARISM_RESULT {
        int id PK
        int quiz_id FK
        int student1_id FK
        int student2_id FK
        float similarity_score
        json comparison_details
        datetime created_at
    }
```

---

## 🗄 Model Specifications

### 1. `accounts_user`
- Stores user credentials, hashed passwords (bcrypt), and account state.

### 2. `quize_quiz`
- Stores quiz metadata, instructor ownership (`created_by`), logic weight, and similarity threshold.

### 3. `quize_quizsolution`
- Stores the reference solution image and its OCR-extracted C++ code.

### 4. `quize_studentsubmission`
- Stores individual student submission images, OCR-extracted code, calculated scores, and grading state.

### 5. `quize_plagiarismresult`
- Stores pairwise plagiarism comparisons and detailed match matrices between student submissions.

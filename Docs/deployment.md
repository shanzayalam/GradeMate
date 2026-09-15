# Deployment & Setup Guide

This guide covers step-by-step instructions for running GradeMate locally and deploying with Docker.

---

## 🛠 Local Development Setup

### 1. Backend Environment Setup

```bash
cd gradeMate-backend

# 1. Create Virtual Environment
python -m venv venv

# Activate on Windows:
venv\Scripts\activate
# Activate on Linux/macOS:
source venv/bin/activate

# 2. Install Dependencies
pip install -r requirements.txt

# 3. Configure Environment File
cp .env.example .env
```

Ensure `.env` contains:
```ini
SECRET_KEY=your-secure-django-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0
CORS_ALLOWED_ORIGINS=http://localhost:5173
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

Run database migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

Start the Django API server:
```bash
python manage.py runserver 0.0.0.0:8000
```

---

### 2. Frontend Setup

```bash
cd Grademate-main

# 1. Install Node Dependencies
npm install

# 2. Configure Environment File
cp .env.example .env
```

Ensure `.env` contains:
```ini
VITE_API_URL=http://127.0.0.1:8000
```

Start the Vite React development server:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🐳 Docker Deployment

To launch the full stack in isolated Docker containers:

```bash
docker-compose up --build -d
```

### Checking Logs

```bash
# Backend logs
docker-compose logs -f backend

# Frontend logs
docker-compose logs -f frontend
```

### Stopping Services

```bash
docker-compose down
```

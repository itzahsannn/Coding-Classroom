# AGENT.md — Coding Classroom

## Project Overview

**Coding Classroom** is a web-based platform for programming education. It combines Supabase (auth + database) with a minimal Express server (Docker code execution + LLM evaluation) and a React frontend.

**Course:** Web Programming — Spring 2026, BCS-6B, FAST-NUCES Lahore  
**Instructor:** Muhammad Kamran  
**Team:** Muhammad Ahsan (23L-0621), Abdullah Mushtaq (23L-0892)  
**Repo:** https://github.com/itzahsannn/Coding-Classroom

---

## Current State of the Codebase

The **frontend** (`coding-classroom-frontend/`) is built with React 18 + Vite + TypeScript + Tailwind CSS. The following pages and components are already implemented:

- Auth: `LoginPage`, `SignupPage`
- Dashboard: `DashboardHome` (Enrolled & Teaching course cards)
- Student flow: `CoursePage`, `AnnouncementPage`, `AssignmentPage`
- Instructor flow: `TeacherCoursePage`, `TeacherAnnouncementPage`, `AssignmentCreationPage`
- Shared: `CodingPlaygroundPage`, `CalendarPage`
- Layout: `DashboardLayout`, `DashboardTopBar`, `Navbar`, `Footer`

All API calls currently use **in-memory mock data** (`src/api/index.ts`, `src/utils/mockData.ts`). The `src/services/api.ts` generic HTTP client exists but is not wired to any real backend yet.

**Neither the backend nor Supabase is connected yet.** That is the primary remaining task.

---

## Architecture

The frontend talks to two places:

```
Frontend (React + Vite)
  ├── @supabase/supabase-js  →  Supabase  (auth + all CRUD)
  └── fetch (src/services/api.ts)  →  Express  (execute code, LLM evaluate only)

Express Server (Node.js)
  ├── POST /api/submissions/:id/execute   — runs code in Docker sandbox
  └── POST /api/submissions/:id/evaluate  — calls LLM via OpenRouter
  (verifies Supabase JWT on both routes)

Supabase
  ├── Auth       — register, login, session management, JWT
  ├── Database   — all tables (PostgreSQL)
  └── Storage    — optional, for storing .py file uploads
```

Express is **not** a general API server. It exists only for the two operations Supabase cannot perform: spawning Docker containers and calling external LLM APIs.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS |
| Auth + Database | Supabase (`@supabase/supabase-js`) |
| Express server | Node.js + Express (execution + LLM only) |
| Code execution | Docker (`python:3.11-alpine` containers) |
| LLM integration | OpenRouter API |
| Validation (Express) | `express-validator` |

---

## Project Structure

```
coding-classroom-frontend/        # Existing React/Vite frontend
  src/
  ├── api/index.ts                # Currently mock — replace with supabase-js calls
  ├── services/api.ts             # Generic fetch client — use for Express endpoints only
  ├── lib/
  │   └── supabaseClient.ts       # Supabase client singleton (to be created)
  └── ...

backend/                          # Minimal Express server (to be created)
  src/
  ├── middleware/
  │   ├── auth.js                 # Verifies Supabase JWT using SUPABASE_JWT_SECRET
  │   ├── validate.js             # express-validator error handler
  │   └── errorHandler.js        # Global error handler
  ├── routes/
  │   └── execution.js            # POST /execute and POST /evaluate
  ├── adapters/
  │   ├── dockerRunner.js         # Docker container spawn logic
  │   └── llmClient.js            # OpenRouter API call
  ├── config/
  │   └── env.js                  # Loads + validates all env vars, exits on missing
  ├── app.js                      # Express app setup
  └── server.js                   # HTTP server entry point
```

---

## Environment Variables

### Frontend (`coding-classroom-frontend/.env.local`)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

VITE_API_BASE_URL=http://localhost:5000/api
```

Use the **anon key** in the frontend — it is safe to expose and Supabase RLS policies enforce access control.

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development

# Supabase — used to verify JWTs on Express routes
SUPABASE_JWT_SECRET=your_supabase_jwt_secret

# LLM
LLM_API_URL=https://openrouter.ai/api/v1/chat/completions
LLM_API_KEY=your_openrouter_key
LLM_MODEL=meta-llama/llama-3.3-70b-instruct:free

# Docker Execution
DOCKER_IMAGE=python:3.11-alpine
EXEC_TIMEOUT_MS=10000
EXEC_MEMORY_LIMIT=128m
EXEC_CPU_LIMIT=0.5
```

Use the **JWT secret** (not service role key) on the backend — it is only used to verify tokens, never to query the DB.

---

## Supabase Setup

### Supabase Client (frontend)

Create `src/lib/supabaseClient.ts`:
```ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

Import and use `supabase` everywhere in the frontend instead of the mock `api` object.

### Auth

Use Supabase Auth for all authentication. Replace the mock login/signup in `LoginPage` and `SignupPage`:

```ts
// Register
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: { data: { name, role } }  // role: 'student' | 'instructor'
})

// Login
const { data, error } = await supabase.auth.signInWithPassword({ email, password })

// Logout
await supabase.auth.signOut()

// Get current user
const { data: { user } } = await supabase.auth.getUser()
```

Store `role` in `user_metadata` at signup. Access it anywhere via `user.user_metadata.role`.

### Database Tables

Create these tables in the Supabase SQL editor:

```sql
-- Classrooms
CREATE TABLE classrooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  section VARCHAR(100),
  instructor_id UUID NOT NULL REFERENCES auth.users(id),
  class_code VARCHAR(20) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enrollments
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id),
  classroom_id UUID NOT NULL REFERENCES classrooms(id),
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (student_id, classroom_id)
);

-- Assignments
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID NOT NULL REFERENCES classrooms(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  deadline TIMESTAMPTZ,
  points INTEGER DEFAULT 100,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Submissions
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES assignments(id),
  student_id UUID NOT NULL REFERENCES auth.users(id),
  filename VARCHAR(255) NOT NULL,
  code TEXT NOT NULL,
  llm_feedback TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (assignment_id, student_id)
);

-- Grades
CREATE TABLE grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID UNIQUE NOT NULL REFERENCES submissions(id),
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  comment TEXT,
  graded_by UUID NOT NULL REFERENCES auth.users(id),
  graded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Announcements
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID NOT NULL REFERENCES classrooms(id),
  author_id UUID NOT NULL REFERENCES auth.users(id),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID NOT NULL REFERENCES announcements(id),
  author_id UUID NOT NULL REFERENCES auth.users(id),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security (RLS)

Enable RLS on every table. These policies replace the role-based middleware you would have written in Express.

```sql
-- Enable RLS
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Classrooms: instructors manage their own; students see enrolled ones
CREATE POLICY "Instructors manage own classrooms"
  ON classrooms FOR ALL
  USING (instructor_id = auth.uid());

CREATE POLICY "Students see enrolled classrooms"
  ON classrooms FOR SELECT
  USING (id IN (
    SELECT classroom_id FROM enrollments WHERE student_id = auth.uid()
  ));

-- Enrollments: students see their own; instructors see their classroom's
CREATE POLICY "Students manage own enrollment"
  ON enrollments FOR ALL
  USING (student_id = auth.uid());

CREATE POLICY "Instructors see their classroom enrollments"
  ON enrollments FOR SELECT
  USING (classroom_id IN (
    SELECT id FROM classrooms WHERE instructor_id = auth.uid()
  ));

-- Assignments: instructors manage theirs; students see published ones in enrolled classrooms
CREATE POLICY "Instructors manage own assignments"
  ON assignments FOR ALL
  USING (classroom_id IN (
    SELECT id FROM classrooms WHERE instructor_id = auth.uid()
  ));

CREATE POLICY "Students see published assignments"
  ON assignments FOR SELECT
  USING (
    status = 'published' AND
    classroom_id IN (
      SELECT classroom_id FROM enrollments WHERE student_id = auth.uid()
    )
  );

-- Submissions: students manage own; instructors see submissions for their assignments
CREATE POLICY "Students manage own submissions"
  ON submissions FOR ALL
  USING (student_id = auth.uid());

CREATE POLICY "Instructors see submissions for their assignments"
  ON submissions FOR SELECT
  USING (assignment_id IN (
    SELECT a.id FROM assignments a
    JOIN classrooms c ON a.classroom_id = c.id
    WHERE c.instructor_id = auth.uid()
  ));

-- Grades: instructors insert/update; students read own
CREATE POLICY "Instructors manage grades"
  ON grades FOR ALL
  USING (graded_by = auth.uid());

CREATE POLICY "Students read own grades"
  ON grades FOR SELECT
  USING (submission_id IN (
    SELECT id FROM submissions WHERE student_id = auth.uid()
  ));

-- Announcements: instructors manage theirs; enrolled students read
CREATE POLICY "Instructors manage announcements"
  ON announcements FOR ALL
  USING (classroom_id IN (
    SELECT id FROM classrooms WHERE instructor_id = auth.uid()
  ));

CREATE POLICY "Students read announcements in enrolled classrooms"
  ON announcements FOR SELECT
  USING (classroom_id IN (
    SELECT classroom_id FROM enrollments WHERE student_id = auth.uid()
  ));

-- Comments: authenticated users in the classroom can comment and read
CREATE POLICY "Authenticated users manage own comments"
  ON comments FOR ALL
  USING (author_id = auth.uid());

CREATE POLICY "Anyone in classroom can read comments"
  ON comments FOR SELECT
  USING (announcement_id IN (
    SELECT id FROM announcements WHERE classroom_id IN (
      SELECT classroom_id FROM enrollments WHERE student_id = auth.uid()
      UNION
      SELECT id FROM classrooms WHERE instructor_id = auth.uid()
    )
  ));
```

---

## Frontend CRUD via Supabase

Replace mock functions in `src/api/index.ts` with real Supabase calls. Examples:

```ts
import { supabase } from '@/lib/supabaseClient'

// Get all classrooms for current user
const { data, error } = await supabase
  .from('classrooms')
  .select('*')

// Create assignment
const { data, error } = await supabase
  .from('assignments')
  .insert({ classroom_id, title, description, deadline, points, status: 'published' })
  .select()
  .single()

// Submit code
const { data, error } = await supabase
  .from('submissions')
  .upsert({ assignment_id, student_id: user.id, filename, code })

// Enroll via class code
const { data: classroom } = await supabase
  .from('classrooms')
  .select('id')
  .eq('class_code', code)
  .single()

await supabase
  .from('enrollments')
  .insert({ student_id: user.id, classroom_id: classroom.id })
```

---

## Express Server (Execution + LLM only)

The Express backend handles exactly two routes. It must verify the Supabase JWT on both.

### JWT Verification Middleware

```js
// middleware/auth.js
import jwt from 'jsonwebtoken'

export function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ success: false, error: { code: 'AUTH_ERROR', message: 'No token provided.' } })

  try {
    req.user = jwt.verify(token, process.env.SUPABASE_JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ success: false, error: { code: 'AUTH_ERROR', message: 'Invalid token.' } })
  }
}
```

The frontend passes the Supabase session token:
```ts
const { data: { session } } = await supabase.auth.getSession()
const token = session.access_token

await fetch(`${import.meta.env.VITE_API_BASE_URL}/submissions/${id}/execute`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` }
})
```

### Express Routes

```
POST /api/submissions/:id/execute   — verifyToken → dockerRunner
POST /api/submissions/:id/evaluate  — verifyToken → llmClient
```

### Validation Rules (Express only)

**Execute:** Submission `:id` must be a valid UUID. Fetch the code from Supabase using the service role key server-side before passing to Docker.

**Evaluate:** Submission `:id` must be a valid UUID. Fetch both the assignment description and the submission code from Supabase before calling the LLM.

### Error Response Shape

```json
{
  "success": false,
  "error": {
    "code": "EXECUTION_TIMEOUT",
    "message": "Code execution exceeded the time limit."
  }
}
```

---

## Code Execution Engine

The adapter at `adapters/dockerRunner.js` must:

1. Fetch submission code from Supabase (using service role key) by submission ID.
2. Write the code to a temp file.
3. Spawn `docker run` with:
   - Image: `DOCKER_IMAGE` env var
   - `--memory`, `--cpus` from env vars
   - `--network none`
   - `--rm`
4. Kill the container if it exceeds `EXEC_TIMEOUT_MS`.
5. Capture stdout and stderr and return both.
6. Delete the temp file after execution regardless of outcome.
7. Never expose host filesystem paths in the response.

---

## LLM Integration

The adapter at `adapters/llmClient.js` must:

1. Fetch the submission code and its assignment description from Supabase by submission ID.
2. Send both to the OpenRouter API with a prompt requesting evaluation of correctness, code quality, logic errors, and improvement suggestions.
3. Save the LLM response text back to `submissions.llm_feedback` in Supabase (using service role key).
4. Return the feedback text in the HTTP response.

The LLM evaluation is advisory only — it does not set a grade.

---

## Running the Project

```bash
# Frontend
cd coding-classroom-frontend
cp .env.example .env.local      # fill in Supabase URL, anon key, and Express base URL
npm install
npm run dev                     # Vite on PORT=5173

# Backend
cd backend
cp .env.example .env            # fill in Supabase JWT secret, LLM key, Docker config
npm install
npm run dev                     # nodemon on PORT=5000
```

Create tables and enable RLS in the Supabase SQL editor before running either service.

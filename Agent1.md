# AI Agent Context: Coding Classroom

> **Purpose:** This file provides dense, high-signal context for AI agents working on this repository to save token context window.

## Architecture Stack
- **Frontend:** React 18, TypeScript, Vite, TailwindCSS. (`/frontend`)
- **Backend:** Node.js, Express. (`/backend`)
- **Database & Auth:** Supabase (PostgreSQL, Storage, Auth).
- **Code Execution:** Docker daemon (via Express backend).
- **AI Feedback:** OpenRouter LLM integration.

## Key Technical Decisions & Gotchas

### 1. Authentication (Supabase)
- **Role-based:** Users are either `instructor` or `student`. Role is stored in `session.user.user_metadata.role`.
- **Server Validation:** Backend validates tokens using `supabase.auth.getUser(token)` (Supabase uses ES256). **Do not use manual `jwt.verify()` with HS256.**
- **Frontend State:** Managed via `AuthContext.tsx`. UI elements use `isTeacher` boolean checks to hide/show features (e.g. grading, creating assignments).

### 2. Code Execution Engine
- **Sandboxing:** Express backend (`backend/src/adapters/dockerRunner.js`) intercepts code.
- **Runtimes:** Auto-detects by extension (`.py` -> `python:3.11-alpine`, `.js`/`.ts` -> `node:20-alpine`).
- **Fallback:** If Docker daemon is unresponsive/unavailable, falls back to local machine execution (`child_process.execFile`).

### 3. Coding Playground & Submissions
- **Editor:** Uses `Monaco Editor` for syntax highlighting and VS Code parity.
- **Run vs Submit:**
  - **Run:** Sends code to `POST /api/run`. Executes directly. Does not require a valid assignment ID. Does not save to DB.
  - **Submit:** Prompts for filename, saves via Supabase to `submissions` table, requires valid `assignmentId`. (Hidden for teachers).
- **AI Feedback:** Available via `POST /api/submissions/:id/evaluate` only *after* code is submitted to the DB.

### 4. Database Schema
- **Assignments:** Contains `id`, `title`, `instructions`, `topic`, `due`, `points`, `classroom_id`.
- **Submissions:** Contains code execution artifacts linked to `assignment_id` and `student_id`.
- **Storage Buckets:** `attachments` (for instructions, accepts docx/pdf/etc) and `submissions` (raw code files). Must have RLS policies applied.

## Testing Credentials
*If you need to test UI roles via Puppeteer/Browser tools:*
- **Teacher:** `teacher@example.com` / `password123`
- **Student:** `student@example.com` / `password123`

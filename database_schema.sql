-- ============================================================
-- Coding Classroom — Complete Supabase Database Schema
-- Run this entire script in the Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 1. TABLES
-- ============================================================

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
  topic VARCHAR(255) DEFAULT NULL,
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

-- ============================================================
-- 2. SECURITY DEFINER FUNCTIONS (Prevents RLS Recursion)
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_enrolled(p_classroom_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM enrollments
    WHERE classroom_id = p_classroom_id
      AND student_id = p_user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_instructor(p_classroom_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM classrooms
    WHERE id = p_classroom_id
      AND instructor_id = p_user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_member(p_classroom_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM classrooms WHERE id = p_classroom_id AND instructor_id = p_user_id
  ) OR EXISTS (
    SELECT 1 FROM enrollments WHERE classroom_id = p_classroom_id AND student_id = p_user_id
  );
$$;

-- Securely join a classroom by code bypassing RLS read restrictions
CREATE OR REPLACE FUNCTION public.join_classroom(p_class_code TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_classroom_id UUID;
  v_student_id UUID;
BEGIN
  -- Find the classroom bypassing RLS
  SELECT id INTO v_classroom_id FROM classrooms WHERE class_code = p_class_code;
  
  IF v_classroom_id IS NULL THEN
    RAISE EXCEPTION 'Invalid class code';
  END IF;

  v_student_id := auth.uid();
  IF v_student_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Insert enrollment
  INSERT INTO enrollments (student_id, classroom_id)
  VALUES (v_student_id, v_classroom_id);
  
  RETURN v_classroom_id;
END;
$$;

-- ============================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Classrooms
CREATE POLICY "classrooms_insert"
  ON classrooms FOR INSERT
  WITH CHECK (instructor_id = auth.uid());

CREATE POLICY "classrooms_select"
  ON classrooms FOR SELECT
  USING (
    instructor_id = auth.uid()
    OR public.is_enrolled(id, auth.uid())
  );

CREATE POLICY "classrooms_update"
  ON classrooms FOR UPDATE
  USING (instructor_id = auth.uid())
  WITH CHECK (instructor_id = auth.uid());

CREATE POLICY "classrooms_delete"
  ON classrooms FOR DELETE
  USING (instructor_id = auth.uid());

-- Enrollments
CREATE POLICY "enrollments_insert"
  ON enrollments FOR INSERT
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "enrollments_select"
  ON enrollments FOR SELECT
  USING (
    student_id = auth.uid()
    OR public.is_instructor(classroom_id, auth.uid())
  );

CREATE POLICY "enrollments_delete"
  ON enrollments FOR DELETE
  USING (student_id = auth.uid());

-- Assignments
CREATE POLICY "assignments_instructor_all"
  ON assignments FOR ALL
  USING (public.is_instructor(classroom_id, auth.uid()));

CREATE POLICY "assignments_student_select"
  ON assignments FOR SELECT
  USING (
    status = 'published'
    AND public.is_enrolled(classroom_id, auth.uid())
  );

-- Submissions
CREATE POLICY "submissions_student_all"
  ON submissions FOR ALL
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "submissions_instructor_select"
  ON submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assignments a
      WHERE a.id = submissions.assignment_id
        AND public.is_instructor(a.classroom_id, auth.uid())
    )
  );

-- Grades
CREATE POLICY "grades_instructor_all"
  ON grades FOR ALL
  USING (graded_by = auth.uid())
  WITH CHECK (graded_by = auth.uid());

CREATE POLICY "grades_student_select"
  ON grades FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM submissions s
      WHERE s.id = grades.submission_id
        AND s.student_id = auth.uid()
    )
  );

-- Announcements
CREATE POLICY "announcements_instructor_all"
  ON announcements FOR ALL
  USING (public.is_instructor(classroom_id, auth.uid()));

CREATE POLICY "announcements_member_select"
  ON announcements FOR SELECT
  USING (public.is_member(classroom_id, auth.uid()));

-- Comments
CREATE POLICY "comments_author_all"
  ON comments FOR ALL
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "comments_member_select"
  ON comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM announcements a
      WHERE a.id = comments.announcement_id
        AND public.is_member(a.classroom_id, auth.uid())
    )
  );

-- ============================================================
-- 4. STORAGE BUCKETS & POLICIES
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('submissions', 'submissions', false),
  ('attachments', 'attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies — submissions bucket
CREATE POLICY "Students upload submissions"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'submissions'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Students read own submissions"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'submissions'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Students delete own submissions"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'submissions'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Instructors read all submissions"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'submissions'
    AND EXISTS (
      SELECT 1 FROM public.classrooms c
      WHERE c.instructor_id = auth.uid()
    )
  );

-- Storage Policies — attachments bucket
CREATE POLICY "Instructors upload attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'attachments'
    AND EXISTS (
      SELECT 1 FROM public.classrooms c
      WHERE c.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Instructors delete attachments"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'attachments'
    AND EXISTS (
      SELECT 1 FROM public.classrooms c
      WHERE c.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users read attachments"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'attachments'
    AND auth.role() = 'authenticated'
  );

-- ============================================================
-- Coding Classroom — Migration Script
-- ============================================================

-- ─── 1. PROFILES TABLE ─────────────────────────────────────
-- Stores public user info (name, role) for every signed-up user

CREATE TABLE IF NOT EXISTS public.profiles (
  id   UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  role TEXT CHECK (role IN ('student', 'instructor')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Everyone can read profiles (needed for name lookups)
CREATE POLICY "profiles_select_all"
  ON public.profiles FOR SELECT
  USING (true);

-- Users can only update their own profile
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ─── 2. TRIGGER: auto-create profile on signup ──────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'role'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Drop trigger if it already exists, then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── 3. BACKFILL existing users into profiles ──────────────
-- This inserts profiles for all users who signed up before the trigger existed
INSERT INTO public.profiles (id, name, role)
SELECT
  id,
  raw_user_meta_data->>'name',
  raw_user_meta_data->>'role'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ─── 4. ASSIGNMENT ATTACHMENTS TABLE ───────────────────────
-- Stores file paths in Supabase Storage linked to assignments

CREATE TABLE IF NOT EXISTS public.assignment_attachments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  file_path     TEXT NOT NULL,
  file_name     TEXT NOT NULL,
  file_size     BIGINT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.assignment_attachments ENABLE ROW LEVEL SECURITY;

-- Instructors can insert attachments for their assignments
CREATE POLICY "attachments_instructor_insert"
  ON public.assignment_attachments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.assignments a
      JOIN public.classrooms c ON c.id = a.classroom_id
      WHERE a.id = assignment_id
        AND c.instructor_id = auth.uid()
    )
  );

-- Instructors can delete their attachments
CREATE POLICY "attachments_instructor_delete"
  ON public.assignment_attachments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.assignments a
      JOIN public.classrooms c ON c.id = a.classroom_id
      WHERE a.id = assignment_id
        AND c.instructor_id = auth.uid()
    )
  );

-- All authenticated members (instructor + enrolled students) can view attachments
CREATE POLICY "attachments_member_select"
  ON public.assignment_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.assignments a
      WHERE a.id = assignment_id
        AND public.is_member(a.classroom_id, auth.uid())
    )
  );

-- ─── 5. UPDATE join_classroom RPC ──────────────────────────
-- Adds a guard so instructors cannot enroll in their own classroom

CREATE OR REPLACE FUNCTION public.join_classroom(p_class_code TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_classroom_id   UUID;
  v_student_id     UUID;
  v_instructor_id  UUID;
BEGIN
  -- Find the classroom bypassing RLS
  SELECT id, instructor_id
  INTO v_classroom_id, v_instructor_id
  FROM classrooms
  WHERE class_code = p_class_code;

  IF v_classroom_id IS NULL THEN
    RAISE EXCEPTION 'Invalid class code';
  END IF;

  v_student_id := auth.uid();
  IF v_student_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Block instructor from joining their own class
  IF v_student_id = v_instructor_id THEN
    RAISE EXCEPTION 'You are the instructor of this class';
  END IF;

  -- Insert enrollment (UNIQUE constraint handles duplicate joins)
  INSERT INTO enrollments (student_id, classroom_id)
  VALUES (v_student_id, v_classroom_id);

  RETURN v_classroom_id;
END;
$$;

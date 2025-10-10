-- Fix student profile creation: ensure students can INSERT their own student profiles
DROP POLICY IF EXISTS "Admins can insert student profiles" ON public.student_profiles;
DROP POLICY IF EXISTS "Students can view their own student profile" ON public.student_profiles;
DROP POLICY IF EXISTS "Students can update their own student profile" ON public.student_profiles;

-- Allow students to insert their own profiles
CREATE POLICY "Students can create their own profile" 
ON public.student_profiles 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Allow students to view their own profiles
CREATE POLICY "Students can view own profile" 
ON public.student_profiles 
FOR SELECT 
USING (user_id = auth.uid());

-- Allow students to update their own profiles
CREATE POLICY "Students can update own profile" 
ON public.student_profiles 
FOR UPDATE 
USING (user_id = auth.uid());

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.student_profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to insert profiles for students
CREATE POLICY "Admins can create student profiles" 
ON public.student_profiles 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
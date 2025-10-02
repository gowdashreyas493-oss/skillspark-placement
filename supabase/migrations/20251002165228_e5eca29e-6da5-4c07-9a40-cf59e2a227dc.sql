-- CRITICAL SECURITY FIX: Move roles to separate table to prevent privilege escalation

-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'student');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user's role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Migrate existing data from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, role::text::app_role
FROM public.profiles
ON CONFLICT (user_id, role) DO NOTHING;

-- Update handle_new_user to create role entry
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User')
  );
  
  -- Insert role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'student')
  );
  
  RETURN NEW;
END;
$$;

-- Remove role column from profiles (keep for now, will update policies first)
-- We'll update the RLS policies to use the new user_roles table

-- Update profiles RLS policies to use new role system
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Update student_profiles policies
DROP POLICY IF EXISTS "Admins can view all student profiles" ON public.student_profiles;
CREATE POLICY "Admins can view all student profiles"
ON public.student_profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can insert student profiles" ON public.student_profiles;
CREATE POLICY "Admins can insert student profiles"
ON public.student_profiles
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Update placement_drives policies
DROP POLICY IF EXISTS "Admins can manage drives" ON public.placement_drives;
CREATE POLICY "Admins can manage drives"
ON public.placement_drives
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update companies policies
DROP POLICY IF EXISTS "Admins can manage companies" ON public.companies;
CREATE POLICY "Admins can manage companies"
ON public.companies
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update assessments policies
DROP POLICY IF EXISTS "Admins can manage assessments" ON public.assessments;
CREATE POLICY "Admins can manage assessments"
ON public.assessments
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update student_applications policies
DROP POLICY IF EXISTS "Admins can manage applications" ON public.student_applications;
DROP POLICY IF EXISTS "Admins can view all applications" ON public.student_applications;

CREATE POLICY "Admins can manage applications"
ON public.student_applications
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update assessment_attempts policies
DROP POLICY IF EXISTS "Admins can view all attempts" ON public.assessment_attempts;
CREATE POLICY "Admins can view all attempts"
ON public.assessment_attempts
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));
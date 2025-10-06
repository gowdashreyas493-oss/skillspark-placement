-- Create storage bucket for resumes
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false);

-- Storage policies for resumes
CREATE POLICY "Students can upload their own resume"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'resumes' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Students can view their own resume"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'resumes' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Students can update their own resume"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'resumes' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all resumes"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'resumes' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Mock Interview Questions
CREATE TABLE public.mock_interview_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL,
  question TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  expected_answer TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.mock_interview_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view interview questions"
ON public.mock_interview_questions
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage interview questions"
ON public.mock_interview_questions
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Mock Interview Results
CREATE TABLE public.mock_interview_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.student_profiles(id),
  domain TEXT NOT NULL,
  score NUMERIC,
  total_questions INTEGER,
  feedback TEXT,
  completed_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.mock_interview_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own interview results"
ON public.mock_interview_results
FOR SELECT
USING (student_id IN (
  SELECT id FROM public.student_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Students can create their own interview results"
ON public.mock_interview_results
FOR INSERT
WITH CHECK (student_id IN (
  SELECT id FROM public.student_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Admins can view all interview results"
ON public.mock_interview_results
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Aptitude Test Questions
CREATE TABLE public.aptitude_test_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.aptitude_test_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view aptitude questions"
ON public.aptitude_test_questions
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage aptitude questions"
ON public.aptitude_test_questions
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Aptitude Test Results
CREATE TABLE public.aptitude_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.student_profiles(id),
  category TEXT NOT NULL,
  score INTEGER,
  total_questions INTEGER,
  accuracy NUMERIC,
  time_taken INTEGER,
  rank INTEGER,
  completed_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.aptitude_test_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own aptitude results"
ON public.aptitude_test_results
FOR SELECT
USING (student_id IN (
  SELECT id FROM public.student_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Students can create their own aptitude results"
ON public.aptitude_test_results
FOR INSERT
WITH CHECK (student_id IN (
  SELECT id FROM public.student_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Admins can view all aptitude results"
ON public.aptitude_test_results
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Code Submissions
CREATE TABLE public.code_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.student_profiles(id),
  language TEXT NOT NULL,
  code TEXT NOT NULL,
  output TEXT,
  status TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.code_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own code submissions"
ON public.code_submissions
FOR SELECT
USING (student_id IN (
  SELECT id FROM public.student_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Students can create their own code submissions"
ON public.code_submissions
FOR INSERT
WITH CHECK (student_id IN (
  SELECT id FROM public.student_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Admins can view all code submissions"
ON public.code_submissions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Announcements
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  priority TEXT DEFAULT 'normal',
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view announcements"
ON public.announcements
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage announcements"
ON public.announcements
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert sample mock interview questions
INSERT INTO public.mock_interview_questions (domain, question, difficulty, expected_answer) VALUES
('Technical', 'Explain the difference between REST and GraphQL APIs.', 'Medium', 'REST uses multiple endpoints while GraphQL uses a single endpoint with flexible queries'),
('Technical', 'What is the time complexity of Quick Sort?', 'Easy', 'O(n log n) average case, O(n²) worst case'),
('Technical', 'Explain polymorphism in OOP.', 'Medium', 'Ability of objects to take multiple forms through inheritance and interfaces'),
('HR', 'Tell me about yourself.', 'Easy', 'Brief professional background, skills, and career goals'),
('HR', 'What are your strengths and weaknesses?', 'Easy', 'Honest self-assessment with examples'),
('Communication', 'How would you explain a complex technical concept to a non-technical person?', 'Medium', 'Use analogies and simple language');

-- Insert sample aptitude test questions
INSERT INTO public.aptitude_test_questions (category, question, option_a, option_b, option_c, option_d, correct_answer, difficulty) VALUES
('Quantitative', 'If a product costs $120 after a 20% discount, what was the original price?', '$144', '$150', '$160', '$140', 'B', 'Easy'),
('Quantitative', 'What is 15% of 240?', '30', '36', '40', '32', 'B', 'Easy'),
('Logical', 'Complete the series: 2, 6, 12, 20, 30, ?', '40', '42', '44', '46', 'B', 'Medium'),
('Logical', 'If all roses are flowers and some flowers are red, then:', 'All roses are red', 'Some roses may be red', 'No roses are red', 'None of the above', 'B', 'Medium'),
('Verbal', 'Synonym of "Abundant":', 'Scarce', 'Plentiful', 'Limited', 'Rare', 'B', 'Easy'),
('Verbal', 'Antonym of "Transparent":', 'Clear', 'Opaque', 'Visible', 'Bright', 'B', 'Easy');
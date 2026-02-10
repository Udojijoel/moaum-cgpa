-- Create enums
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
CREATE TYPE public.gender_type AS ENUM ('male', 'female');

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    matric_number TEXT,
    full_name TEXT NOT NULL,
    gender gender_type NOT NULL,
    faculty TEXT NOT NULL,
    department TEXT NOT NULL,
    level TEXT,
    admission_year TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);

-- Create semesters table
CREATE TABLE public.semesters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    level TEXT NOT NULL,
    session TEXT NOT NULL,
    tcr INTEGER NOT NULL DEFAULT 0,
    tce INTEGER NOT NULL DEFAULT 0,
    twgp NUMERIC NOT NULL DEFAULT 0,
    gpa NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create courses table
CREATE TABLE public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    semester_id UUID REFERENCES public.semesters(id) ON DELETE CASCADE NOT NULL,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    credit_units INTEGER NOT NULL,
    score INTEGER NOT NULL,
    grade TEXT NOT NULL,
    grade_point NUMERIC NOT NULL,
    weighted_grade_point NUMERIC NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Create has_role function (security definer to avoid recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
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

-- Profiles RLS policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- User roles RLS policies
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Semesters RLS policies
CREATE POLICY "Users can view their own semesters"
ON public.semesters FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own semesters"
ON public.semesters FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own semesters"
ON public.semesters FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own semesters"
ON public.semesters FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all semesters"
ON public.semesters FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Courses RLS policies
CREATE POLICY "Users can view their own courses"
ON public.courses FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.semesters s
    WHERE s.id = semester_id AND s.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own courses"
ON public.courses FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.semesters s
    WHERE s.id = semester_id AND s.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own courses"
ON public.courses FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.semesters s
    WHERE s.id = semester_id AND s.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own courses"
ON public.courses FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.semesters s
    WHERE s.id = semester_id AND s.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all courses"
ON public.courses FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, gender, faculty, department)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE((NEW.raw_user_meta_data->>'gender')::gender_type, 'male'),
    COALESCE(NEW.raw_user_meta_data->>'faculty', 'Unknown'),
    COALESCE(NEW.raw_user_meta_data->>'department', 'Unknown')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
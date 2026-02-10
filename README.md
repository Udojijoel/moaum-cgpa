<!-- @format -->

# BSU GPA Guru - CGPA Tracker

A comprehensive CGPA tracking application for university students with admin dashboard capabilities.

## Features

- 📊 **GPA/CGPA Calculation** - Track your academic progress across semesters
- 📈 **Visual Charts** - View GPA trends and performance analytics
- 👤 **User Profiles** - Manage your academic information
- 🔐 **Authentication** - Secure login/signup with email verification
- 👨‍💼 **Admin Dashboard** - View all student statistics and data

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Lovable Cloud (Supabase)
- **Database**: PostgreSQL
- **Authentication**: Supabase Auth

---

## Database Schema

### Tables

#### `profiles`

Stores user profile information.

| Column           | Type        | Description                        |
| ---------------- | ----------- | ---------------------------------- |
| `id`             | UUID        | Primary key, references auth.users |
| `matric_number`  | TEXT        | Student matriculation number       |
| `full_name`      | TEXT        | Student's full name                |
| `gender`         | ENUM        | 'male' or 'female'                 |
| `faculty`        | TEXT        | Faculty name                       |
| `department`     | TEXT        | Department name                    |
| `level`          | TEXT        | Current academic level             |
| `admission_year` | TEXT        | Year of admission                  |
| `created_at`     | TIMESTAMPTZ | Record creation timestamp          |
| `updated_at`     | TIMESTAMPTZ | Last update timestamp              |

#### `semesters`

Stores semester information for each user.

| Column       | Type        | Description                            |
| ------------ | ----------- | -------------------------------------- |
| `id`         | UUID        | Primary key                            |
| `user_id`    | UUID        | References auth.users                  |
| `name`       | TEXT        | Semester name (e.g., "First Semester") |
| `level`      | TEXT        | Academic level (e.g., "100")           |
| `session`    | TEXT        | Academic session (e.g., "2024/2025")   |
| `tcr`        | INTEGER     | Total Credit Registered                |
| `tce`        | INTEGER     | Total Credit Earned                    |
| `twgp`       | NUMERIC     | Total Weighted Grade Points            |
| `gpa`        | NUMERIC     | Grade Point Average                    |
| `created_at` | TIMESTAMPTZ | Record creation timestamp              |

#### `courses`

Stores course information for each semester.

| Column                 | Type        | Description                     |
| ---------------------- | ----------- | ------------------------------- |
| `id`                   | UUID        | Primary key                     |
| `semester_id`          | UUID        | References semesters table      |
| `code`                 | TEXT        | Course code (e.g., "CSC101")    |
| `title`                | TEXT        | Course title                    |
| `credit_units`         | INTEGER     | Number of credit units          |
| `score`                | INTEGER     | Score obtained (0-100)          |
| `grade`                | TEXT        | Letter grade (A, B, C, D, E, F) |
| `grade_point`          | NUMERIC     | Grade point value               |
| `weighted_grade_point` | NUMERIC     | Credit units × grade point      |
| `created_at`           | TIMESTAMPTZ | Record creation timestamp       |

#### `user_roles`

Manages user roles for access control.

| Column    | Type | Description                     |
| --------- | ---- | ------------------------------- |
| `id`      | UUID | Primary key                     |
| `user_id` | UUID | References auth.users           |
| `role`    | ENUM | 'admin', 'moderator', or 'user' |

### Database Functions

- `has_role(user_id, role)` - Check if a user has a specific role
- `handle_new_user()` - Trigger function to create profile on signup
- `update_updated_at_column()` - Trigger to auto-update timestamps

---

## Deployment

### Environment Variables

For all deployments, you'll need these environment variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

---

### Deploy to Vercel

1. **Connect Repository**
   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Build Settings**

   ```
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

3. **Add Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically deploy on every push to main

#### vercel.json (Optional)

Create this file for SPA routing:

```json
{
	"rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

---

### Deploy to Render

1. **Create New Web Service**
   - Go to [Render](https://render.com)
   - Click "New" → "Static Site"
   - Connect your GitHub repository

2. **Configure Build Settings**

   ```
   Name: bsu-gpa-guru
   Branch: main
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```

3. **Add Environment Variables**
   - Go to Environment tab
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`

4. **Configure Redirects**
   - Add a rewrite rule for SPA routing:
   - Source: `/*`
   - Destination: `/index.html`
   - Action: Rewrite

5. **Deploy**
   - Click "Create Static Site"
   - Render will auto-deploy on every push

---

### Deploy to Netlify

1. **Connect Repository**
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Select your repository

2. **Configure Build Settings**

   ```
   Build Command: npm run build
   Publish Directory: dist
   ```

3. **Add Environment Variables**
   - Go to Site Settings → Environment Variables
   - Add your Supabase credentials

4. **Create `netlify.toml`** (Optional)

   ```toml
   [build]
     command = "npm run build"
     publish = "dist"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

---

## Local Development

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev
```

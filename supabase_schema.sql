-- ============================================
-- CareerBoost Database Schema for Supabase
-- ============================================

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  tier VARCHAR(50) DEFAULT 'basic',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Usage Tracking
CREATE TABLE IF NOT EXISTS user_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resume_analyses INT DEFAULT 0,
  skill_gaps INT DEFAULT 0,
  career_advice_count INT DEFAULT 0,
  mock_interviews INT DEFAULT 0,
  job_applications_count INT DEFAULT 0,
  learning_plans INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Resumes Table
CREATE TABLE IF NOT EXISTS resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  file_url VARCHAR(500),
  score INT,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Skill Gaps Table
CREATE TABLE IF NOT EXISTS skill_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_role VARCHAR(255) NOT NULL,
  current_skills TEXT,
  required_skills TEXT,
  gap_analysis TEXT,
  recommendations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Learning Plans Table
CREATE TABLE IF NOT EXISTS learning_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal VARCHAR(500) NOT NULL,
  duration_weeks INT,
  content TEXT,
  courses TEXT,
  progress INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Career Advice Table
CREATE TABLE IF NOT EXISTS career_advice (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic VARCHAR(255) NOT NULL,
  question TEXT NOT NULL,
  advice TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Mock Interviews Table
CREATE TABLE IF NOT EXISTS mock_interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  score INT,
  feedback TEXT,
  transcript TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Job Applications Table
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  position VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'applied',
  salary VARCHAR(100),
  location VARCHAR(255),
  notes TEXT,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_usage_user_id ON user_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_gaps_user_id ON skill_gaps(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_plans_user_id ON learning_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_career_advice_user_id ON career_advice(user_id);
CREATE INDEX IF NOT EXISTS idx_mock_interviews_user_id ON mock_interviews(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON job_applications(user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_advice ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own data
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can view their own usage" ON user_usage
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view their own resumes" ON resumes
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view their own skill gaps" ON skill_gaps
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view their own learning plans" ON learning_plans
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view their own career advice" ON career_advice
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view their own mock interviews" ON mock_interviews
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view their own job applications" ON job_applications
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- ============================================
-- Dummy Data (Demo Users)
-- ============================================

-- Insert dummy users
INSERT INTO users (id, email, name, tier) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'rohith@careerboost.com', 'Rohith', 'basic'),
('550e8400-e29b-41d4-a716-446655440002', 'sravan@careerboost.com', 'Sravan', 'medium'),
('550e8400-e29b-41d4-a716-446655440003', 'sreekar@careerboost.com', 'Sreekar', 'premium'),
('550e8400-e29b-41d4-a716-446655440004', 'demo@careerboost.com', 'Demo User', 'basic')
ON CONFLICT (email) DO NOTHING;

-- Insert user usage tracking
INSERT INTO user_usage (user_id, resume_analyses, skill_gaps, career_advice_count, mock_interviews, job_applications_count, learning_plans) VALUES
('550e8400-e29b-41d4-a716-446655440001', 2, 3, 5, 1, 8, 1),
('550e8400-e29b-41d4-a716-446655440002', 3, 5, 10, 3, 15, 1),
('550e8400-e29b-41d4-a716-446655440003', 3, 5, 10, 5, 25, 1),
('550e8400-e29b-41d4-a716-446655440004', 1, 2, 3, 0, 2, 0)
ON CONFLICT (user_id) DO NOTHING;

-- Insert sample resumes for Rohith
INSERT INTO resumes (user_id, title, content, score, feedback) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Senior Software Engineer Resume', 
'Rohith K | Senior Software Engineer | rohith@careerboost.com | +91-9876543210
EXPERIENCE:
TechCorp | Senior Engineer (2021-Present)
- Led team of 5 engineers, delivering 3 major features
- Improved system performance by 40%
Amazon | Software Engineer (2019-2021)
- Developed microservices using Go and Python
- Implemented CI/CD pipelines reducing deployment time by 60%
SKILLS: Go, Python, Java, AWS, Kubernetes, Docker
EDUCATION: B.Tech CS, IIT Bombay (2019)', 85,
'Strong resume with clear achievements. Consider adding metrics for Amazon role as well.'
);

-- Insert sample skill gaps for Rohith
INSERT INTO skill_gaps (user_id, target_role, current_skills, required_skills, gap_analysis, recommendations) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Engineering Manager', 
'Go, Python, AWS, Docker, Kubernetes, System Design',
'Leadership, People Management, Strategy, Communication, Product Sense, Hiring, Budgeting',
'Strong technical foundation but lacks management experience. Need to develop soft skills.',
'1. Take online leadership courses (Coursera, Udemy)
2. Mentor junior developers
3. Lead a cross-functional project
4. Read management books (High Output Management, etc.)
5. Practice public speaking and presentations'
);

-- Insert sample resume for Sravan
INSERT INTO resumes (user_id, title, content, score, feedback) VALUES
('550e8400-e29b-41d4-a716-446655440002', 'Full Stack Developer Resume',
'Sravan Kumar | Full Stack Developer | sravan@careerboost.com | +91-9876543211
EXPERIENCE:
WebSolutions | Full Stack Developer (2020-Present)
- Built 5+ web applications using React and Node.js
- Managed PostgreSQL and MongoDB databases
- Implemented authentication and payment systems
Startup XYZ | Junior Developer (2018-2020)
- Developed responsive UI components
- Fixed 200+ bugs and improved code quality
SKILLS: React, Node.js, Express, PostgreSQL, MongoDB, AWS
EDUCATION: B.Sc CS, University of Hyderabad (2018)', 78,
'Good coverage of full stack skills. Add more specific project impact metrics.'
);

-- Insert sample learning plan for Sravan
INSERT INTO learning_plans (user_id, goal, duration_weeks, content, courses, progress) VALUES
('550e8400-e29b-41d4-a716-446655440002', 'Master System Design & Backend Architecture',
12,
'Deep dive into system design principles, scalable architecture, distributed systems',
'Udemy System Design Course, AlgoExpert, Reading papers on distributed systems',
45
);

-- Insert sample data for Sreekar
INSERT INTO resumes (user_id, title, content, score, feedback) VALUES
('550e8400-e29b-41d4-a716-446655440003', 'Tech Lead Resume',
'Sreekar Reddy | Tech Lead | sreekar@careerboost.com | +91-9876543212
EXPERIENCE:
Enterprise Solutions | Tech Lead (2022-Present)
- Leading 8-member engineering team
- Architected microservices platform handling 1M+ requests/day
- Mentored 12 junior developers to senior positions
Microsoft | Senior Engineer (2019-2022)
- Built cloud infrastructure for Azure services
- 3 patents filed in distributed computing
SKILLS: Java, Go, Kubernetes, Cloud Architecture, Team Leadership
EDUCATION: B.Tech CS, BITS Pilani (2019), MBA IIM Ahmedabad (2023)', 92,
'Excellent resume with strong leadership metrics. Very impressive.'
);

-- Insert mock interview data for Sreekar
INSERT INTO mock_interviews (user_id, role, company, score, feedback) VALUES
('550e8400-e29b-41d4-a716-446655440003', 'Engineering Director', 'Tech Giant',
88,
'Strong leadership answers. Work on strategic thinking. Great communication overall.'
);

-- Insert job applications for demo
INSERT INTO job_applications (user_id, company_name, position, status, salary, location) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Google', 'Senior Software Engineer', 'interview', '200000-250000', 'Mountain View, CA'),
('550e8400-e29b-41d4-a716-446655440001', 'Meta', 'Staff Engineer', 'applied', '220000-280000', 'Menlo Park, CA'),
('550e8400-e29b-41d4-a716-446655440002', 'Stripe', 'Full Stack Engineer', 'applied', '150000-200000', 'San Francisco, CA'),
('550e8400-e29b-41d4-a716-446655440003', 'Apple', 'Engineering Director', 'interview', '300000-400000', 'Cupertino, CA'),
('550e8400-e29b-41d4-a716-446655440003', 'Netflix', 'Senior Engineering Manager', 'offer', '350000-450000', 'Los Gatos, CA');

-- Insert career advice
INSERT INTO career_advice (user_id, topic, question, advice) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Career Growth', 'How to transition from IC to Manager?',
'Great question! Here''s a roadmap:
1. Start mentoring junior developers NOW
2. Take on leadership responsibilities in projects
3. Improve communication and presentation skills
4. Read books on management
5. Find a mentor who''s done the transition
6. Be patient - typically takes 1-2 years
Key: Show you can lead before taking the title!'
);

-- Create a view for user dashboard summary
CREATE OR REPLACE VIEW user_dashboard_summary AS
SELECT 
  u.id,
  u.email,
  u.name,
  u.tier,
  uu.resume_analyses,
  uu.skill_gaps,
  uu.career_advice_count,
  uu.mock_interviews,
  uu.job_applications_count,
  uu.learning_plans,
  COUNT(DISTINCT r.id) as total_resumes,
  COUNT(DISTINCT ja.id) as total_job_applications
FROM users u
LEFT JOIN user_usage uu ON u.id = uu.user_id
LEFT JOIN resumes r ON u.id = r.user_id
LEFT JOIN job_applications ja ON u.id = ja.user_id
GROUP BY u.id, u.email, u.name, u.tier, uu.resume_analyses, uu.skill_gaps, 
         uu.career_advice_count, uu.mock_interviews, uu.job_applications_count, uu.learning_plans;

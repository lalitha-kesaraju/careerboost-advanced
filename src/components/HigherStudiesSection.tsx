import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GraduationCap, Globe, BookOpen, ClipboardList, ArrowLeft, Loader2, Sparkles, CheckCircle2, MapPin, FileText, Brain, Zap, Trophy, ChevronDown, User, AlertCircle } from 'lucide-react';
import { callGemini } from '../lib/geminiApi';

interface Props { data?: any; }

type StudyGoal = 'masters' | 'phd' | 'mba' | 'law' | 'medicine' | 'govt-exam' | 'certification';

// ── Static hardcoded plans ─────────────────────────────────────────────────
const PLANS: Record<StudyGoal, any> = {
  masters: {
    overview: "A Master's degree accelerates your career into senior/research roles globally. The prep timeline spans 12–16 months from decision to joining.",
    timelineMonths: 14,
    phases: [
      { phase: "Research & Shortlisting", duration: "2 months", tasks: ["Shortlist 12–15 target universities by ranking & research fit", "Check program requirements, deadlines, and tuition", "Identify faculty/research groups to contact"] },
      { phase: "Test Preparation", duration: "4 months", tasks: ["GRE General (target Quant 165+, Verbal 155+)", "IELTS Academic 7.0+ or TOEFL iBT 100+", "GATE 90+ percentile (for IITs, IISc, Germany)", "2 full mocks per week"] },
      { phase: "Application Building", duration: "3 months", tasks: ["Write Statement of Purpose — 5+ drafts", "Collect 3 Letters of Recommendation", "Update academic CV", "Compile transcripts, certificates"] },
      { phase: "Submit & Follow-up", duration: "3 months", tasks: ["Submit on rolling/fixed deadlines", "Track portal statuses weekly", "Respond to interview calls promptly"] },
      { phase: "Pre-Departure", duration: "2 months", tasks: ["Accept offer & pay seat deposit", "Apply for student visa (F-1 / Tier-4)", "Arrange accommodation and travel insurance"] },
    ],
    keyExams: [
      { name: "GRE General Test", targetScore: "320+ (Quant 165+)", prep: "Magoosh / Manhattan Prep; 60-day intensive; quant is non-negotiable for STEM" },
      { name: "IELTS Academic", targetScore: "7.0+ overall", prep: "Cambridge Practice Tests series; speaking mock calls with a native speaker" },
      { name: "TOEFL iBT", targetScore: "100+ (27+ in Writing)", prep: "ETS Official Prep; Integrated Writing is the hardest section for Indians" },
      { name: "GATE", targetScore: "90+ percentile", prep: "Best gateway to IITs, IISc, and tuition-free German universities; 6-month plan" },
    ],
    topPrograms: [
      { name: "MIT EECS / CSAIL", location: "Cambridge, USA", why: "World #1 for CS/EE; unmatched research output and industry connections" },
      { name: "Stanford CS / EE", location: "Stanford, USA", why: "Silicon Valley pipeline; strongest startup ecosystem in academia" },
      { name: "IIT Bombay / Delhi MTech", location: "India", why: "Top Indian option; affordable; excellent peer network; GATE required" },
      { name: "TU Munich (TUM)", location: "Munich, Germany", why: "Free tuition for all nationalities; Europe's top technical university" },
      { name: "NUS School of Computing", location: "Singapore", why: "Asia's best; strong industry ties; English medium; affordable living" },
    ],
    scholarships: [
      "Fulbright-Nehru Master's Fellowship (USA — fully funded)",
      "DAAD Scholarship (Germany — covers tuition + €850/month living)",
      "Erasmus Mundus Joint Master (Europe — €1,400/month stipend)",
      "Commonwealth Scholarship (UK — fully funded for developing countries)",
      "JN Tata Endowment Loan Scholarship",
      "Inlaks Shivdasani Foundation Grant",
    ],
    tips: [
      "Start your SOP 4 months before deadlines — plan for at least 7 revisions",
      "Email professors before applying — pre-application contact boosts admit rates significantly",
      "Apply to 2 reach / 4 match / 3 safety programs (9 total)",
      "GRE scores are valid 5 years — take it only when fully prepared",
    ],
  },
  phd: {
    overview: "A PhD is a 4–6 year research commitment. The key is finding the right advisor, not just the right university. Most programs are fully funded.",
    timelineMonths: 12,
    phases: [
      { phase: "Research Alignment", duration: "2 months", tasks: ["Define your research area and sub-field", "Read 20+ papers in your intended area", "Identify 5–8 potential advisors globally"] },
      { phase: "Test & Profile Building", duration: "4 months", tasks: ["GATE 95+ percentile or GRE 325+", "Publish or present at a conference if possible", "Build a strong research portfolio / GitHub"] },
      { phase: "Cold-emailing Professors", duration: "2 months", tasks: ["Personalised emails to 15–20 professors", "Reference their specific papers in emails", "Follow up once after 2 weeks"] },
      { phase: "Applications", duration: "3 months", tasks: ["Research Statement (most important document)", "3 LORs — at least one from a researcher", "Transcripts and publication list"] },
      { phase: "Interview & Decision", duration: "1 month", tasks: ["Technical and research-fit interviews", "Evaluate funding packages carefully", "Negotiate start date if needed"] },
    ],
    keyExams: [
      { name: "GATE", targetScore: "95+ percentile", prep: "Mandatory for IITs, IISc, PMRF; also accepted by TU Munich and some European universities" },
      { name: "GRE General", targetScore: "325+ (Quant 167+)", prep: "Required for US/Canadian PhDs; quant score is heavily weighted" },
      { name: "CSIR-UGC NET", targetScore: "JRF rank", prep: "Required for Science/Math PhDs in India; opens funded positions at CSIR institutes" },
      { name: "TOEFL / IELTS", targetScore: "TOEFL 105+ / IELTS 7.5+", prep: "Required by most US/UK/Canadian universities for international applicants" },
    ],
    topPrograms: [
      { name: "IISc Bangalore", location: "Bangalore, India", why: "India's top research institution; funded positions via PMRF" },
      { name: "MIT / Harvard / Caltech", location: "USA", why: "Fully funded; cutting-edge labs; stipends of $35,000–45,000/year" },
      { name: "ETH Zurich / EPFL", location: "Switzerland", why: "Top European research; stipend CHF 50,000+/year; free tuition" },
      { name: "IIT Madras / Bombay", location: "India", why: "Strong funded programs; PMRF ₹70,000–80,000/month fellowship" },
      { name: "University of Cambridge", location: "UK", why: "Gates Cambridge and other full scholarships available" },
    ],
    scholarships: [
      "PM Research Fellowship (PMRF) — ₹70,000–80,000/month for IIT/IISc PhD",
      "CSIR-UGC JRF — ₹37,000/month for science PhDs",
      "NSF Graduate Research Fellowship (USA — $37,000/year stipend)",
      "Gates Cambridge Scholarship (UK — fully funded)",
      "DAAD PhD Scholarships (Germany — funded positions)",
      "Most US/European PhD programs come with TA/RA funding",
    ],
    tips: [
      "Research fit with your advisor matters more than university ranking",
      "A publication or strong research project before applying is a game-changer",
      "Never pay for a PhD — if a program isn't funded, research other options",
      "Read your potential advisor's last 3 years of papers before emailing them",
    ],
  },
  mba: {
    overview: "An MBA accelerates career transitions into management, consulting, and entrepreneurship. Top programs require 2+ years of work experience.",
    timelineMonths: 14,
    phases: [
      { phase: "Self-Assessment & Goal Setting", duration: "1 month", tasks: ["Define post-MBA goal clearly (consulting / VC / startup)", "Assess GMAT/CAT readiness", "Build 2-year career story for essays"] },
      { phase: "GMAT / CAT Preparation", duration: "4 months", tasks: ["GMAT 720+ (V38, Q49) or CAT 99+ %ile", "Enrol in coaching (IMS / TIME / Career Launcher)", "6 full-length mocks minimum"] },
      { phase: "School Research & Networking", duration: "2 months", tasks: ["Attend MBA fairs and information sessions", "Connect with alumni from target schools", "Visit campuses if possible"] },
      { phase: "Essay & Application", duration: "4 months", tasks: ["Draft 'Why MBA? Why now? Why this school?' essays", "Secure strong LORs from direct managers", "Update professional resume to 1 page"] },
      { phase: "GD-PI Preparation", duration: "2 months", tasks: ["Mock GDs twice a week", "Current affairs and business news daily", "Practice WAT (Written Ability Test)"] },
      { phase: "Pre-Joining", duration: "1 month", tasks: ["Negotiate salary / role with current employer", "Connect with batch on LinkedIn", "Prepare for pre-reads"] },
    ],
    keyExams: [
      { name: "CAT (Common Admission Test)", targetScore: "99+ percentile for IIM A/B/C", prep: "IMS / TIME coaching; 6-month prep; DILR and QA are deciding factors" },
      { name: "GMAT", targetScore: "720+ (top 10 global schools)", prep: "OG + Official Prep; GMAT Focus Edition; Verbal is often the bottleneck" },
      { name: "XAT (XLRI)", targetScore: "98+ percentile", prep: "Decision Making section is unique to XAT; practice separately" },
      { name: "NMAT (Narsee Monjee)", targetScore: "215+ (top 1%)", prep: "3 attempts allowed; Speed is key — 108 Qs in 120 mins" },
    ],
    topPrograms: [
      { name: "IIM Ahmedabad (PGP)", location: "Ahmedabad, India", why: "India's best; alumni lead Fortune 500 companies; average placement ₹35 LPA" },
      { name: "ISB Hyderabad (PGP)", location: "Hyderabad, India", why: "1-year MBA; international faculty; average salary $175K for international roles" },
      { name: "XLRI Jamshedpur (PGDM-BM)", location: "Jamshedpur, India", why: "Best HR+Business program; XAT required; strong corporate tie-ups" },
      { name: "Harvard Business School (MBA)", location: "Boston, USA", why: "Global network; case method; needs GMAT 730+ and exceptional work experience" },
      { name: "INSEAD (MBA)", location: "Fontainebleau, France / Singapore", why: "Most international MBA; 1-year intensive; dual campus advantage" },
    ],
    scholarships: [
      "Aditya Birla Scholarships (IIM A/B/C — ₹1.75 lakh)",
      "JN Tata Endowment (for overseas MBA)",
      "Forté Foundation Fellowships (women in business leadership)",
      "AACSB School Scholarships (merit-based, direct from schools)",
      "IIM Merit-cum-Means scholarships",
      "Loan options: SBI Scholar Loan, HDFC Credila at preferential rates",
    ],
    tips: [
      "Work experience is more important than GMAT score for top programs",
      "Start GMAT/CAT prep at least 5 months before target test date",
      "The 'Why MBA? Why now?' essay is the most important — spend 30% of time on it",
      "Alumni interviews carry significant weight — prepare thoroughly",
    ],
  },
  law: {
    overview: "Law programs open careers in litigation, corporate law, policy, and academia. CLAT is the gateway for top NLUs; LSAT for global schools.",
    timelineMonths: 12,
    phases: [
      { phase: "Foundations", duration: "2 months", tasks: ["Map target colleges (NLUs vs private vs foreign)", "Understand 5-year BA LLB vs 3-year LLB path", "Read The Hindu + Live Law daily"] },
      { phase: "CLAT / LSAT Preparation", duration: "5 months", tasks: ["English & Reading Comprehension (max weightage)", "Legal Reasoning from previous year papers", "General Knowledge current affairs", "Quantitative Techniques (basic)"] },
      { phase: "Application & Counselling", duration: "2 months", tasks: ["Fill CLAT centralised counselling form", "Prepare for AILET separately (NLU Delhi)", "Backup: apply to private law schools directly"] },
      { phase: "Pre-Law School Prep", duration: "3 months", tasks: ["Mooting research and reading", "Internship at a law firm or NGO", "Build writing and argumentation skills"] },
    ],
    keyExams: [
      { name: "CLAT (Common Law Admission Test)", targetScore: "100+ (for top NLUs)", prep: "Legal Reasoning & Reading Comprehension are highest weightage; previous papers are the best resource" },
      { name: "AILET (NLU Delhi)", targetScore: "Top 200 rank", prep: "Separate exam for NLU Delhi — one of the most competitive; GK is crucial" },
      { name: "LSAT India", targetScore: "90+ percentile", prep: "Analytical Reasoning section is unique; use LSAC official practice tests" },
      { name: "DU LLB Entrance", targetScore: "75+ marks", prep: "Delhi University 3-year LLB; English and GK heavy" },
    ],
    topPrograms: [
      { name: "NLSIU Bangalore (CLAT #1)", location: "Bangalore, India", why: "India's top NLU; consistently top NIRF ranking; best corporate law placements" },
      { name: "NALSAR Hyderabad (CLAT #2)", location: "Hyderabad, India", why: "Strong litigation and academic track; excellent moot court culture" },
      { name: "NLU Delhi (AILET)", location: "Delhi, India", why: "Separate exam; best connections in Delhi High Court and Supreme Court bar" },
      { name: "Harvard Law School (LLM)", location: "Boston, USA", why: "World's most prestigious LLM; requires top LLB + work experience + LSAT" },
      { name: "Oxford (BCL / LLM)", location: "Oxford, UK", why: "Best for international and comparative law; Chevening Scholarship available" },
    ],
    scholarships: [
      "Bar Council of India scholarships for meritorious students",
      "Rhodes Scholarship (Oxford — fully funded; highly competitive)",
      "Chevening Scholarship (UK government — fully funded LLM)",
      "NLU internal merit scholarships (10–20% of fees)",
      "Increasing number of NLU fee waivers for EWS/SC/ST categories",
      "Corporate law firm bond programs (NCLAT, Cyril Amarchand, etc.)",
    ],
    tips: [
      "CLAT English RC has increased to 40% — treat it like UPSC-level reading",
      "Follow 'The Hindu' and 'Live Law' from Day 1 — GK is tested implicitly everywhere",
      "Moot court wins in law school matter more than grades for placements",
      "Start interning from 1st year — law is entirely relationship-driven",
    ],
  },
  medicine: {
    overview: "Medicine is the longest career path — MBBS takes 5.5 years plus a 1-year internship. PG specialization requires NEET PG. International paths require USMLE or PLAB.",
    timelineMonths: 18,
    phases: [
      { phase: "NEET UG Foundation", duration: "12 months", tasks: ["Complete NCERT Physics, Chemistry, Biology (11th & 12th)", "Enroll in AAKASH / Allen / Unacademy NEET batch", "Chapter-wise tests + full mocks every 2 weeks"] },
      { phase: "NEET Revision", duration: "3 months", tasks: ["Topic-wise revision from high-yield chapters", "Previous 10 years NEET papers", "Focus on Biology (90 Qs — maximum impact)"] },
      { phase: "Counselling & Admission", duration: "2 months", tasks: ["MCC centralized counselling for government seats", "State quota counselling separately", "Management quota counselling for private colleges"] },
      { phase: "Internship & PG Prep", duration: "12 months (concurrent)", tasks: ["MBBS internship (mandatory 1 year)", "Start NEET PG prep from 3rd year of MBBS", "MarrowApp / DAMS / Dr. Bhatia notes"] },
      { phase: "PG Specialization", duration: "NEET PG year", tasks: ["NEET PG 700+ for MD/MS at AIIMS", "INI CET for AIIMS, JIPMER, PGI Chandigarh", "Super-specialty via NEET SS or AIIMS SS"] },
    ],
    keyExams: [
      { name: "NEET UG", targetScore: "700+ (600+ minimum for govt seats)", prep: "NCERT is the bible; Biology dominates; AAKASH/Allen/Unacademy top coaching; 2-year prep minimum" },
      { name: "NEET PG", targetScore: "700+ for AIIMS/top MD/MS", prep: "MarrowApp, DAMS Video Lectures; previous years; subject-wise integration" },
      { name: "INI CET", targetScore: "Top 500 rank", prep: "Harder than NEET PG; AIIMS, JIPMER, NIMHANS, PGI Chandigarh; clinical case-based questions" },
      { name: "USMLE Step 1/2/3", targetScore: "230+ for competitive residency", prep: "Amboss + First Aid; for US residency after MBBS; 2-year preparation" },
    ],
    topPrograms: [
      { name: "AIIMS New Delhi (MBBS)", location: "Delhi, India", why: "India's premier medical institution; lowest fees; most competitive NEET cutoff" },
      { name: "CMC Vellore (MBBS)", location: "Vellore, India", why: "Best clinical training in India; has its own entrance test separate from NEET" },
      { name: "JIPMER Puducherry (MBBS)", location: "Puducherry, India", why: "Top government medical college; INI-CET for PG; stunning campus" },
      { name: "Harvard Medical School (MD)", location: "Boston, USA", why: "Top US medical school; requires USMLE + residency; exceptional research opportunities" },
      { name: "St. George's University (MBBS)", location: "Grenada + USA/UK rotations", why: "Popular route to US/UK residency for Indian students" },
    ],
    scholarships: [
      "AIIMS merit-based scholarship for top academic performers",
      "ICMR Junior Research Fellowship (for medical research after MBBS)",
      "DBT-JRF in Biotechnology/Life Sciences",
      "WHO Fellowships for public health postgrad programs",
      "State government bonds for MBBS (service-linked scholarships)",
      "US residency stipends: PGY1 ~$60,000–70,000/year",
    ],
    tips: [
      "NEET Biology: NCERT lines are directly lifted for questions — memorise every line",
      "Start NEET PG prep from 2nd year MBBS — don't wait until internship",
      "CMC Vellore has its own exam — don't ignore it even with a high NEET score",
      "For USMLE: Pathology and Pharmacology carry the most weight in Step 1",
    ],
  },
  'govt-exam': {
    overview: "Indian civil services offer prestige, stability, and impact. UPSC CSE is the hardest exam in India — typically takes 3–5 attempts. Banking and SSC are faster tracks.",
    timelineMonths: 18,
    phases: [
      { phase: "Foundation Reading", duration: "3 months", tasks: ["Complete NCERT 6–12 for History, Geography, Polity, Economy", "Start The Hindu daily reading", "Understand UPSC CSE syllabus in detail"] },
      { phase: "Optional Subject & GS", duration: "6 months", tasks: ["Choose Optional subject (PSIR / History / Sociology most popular)", "Complete GS Paper 1–4 standard sources", "Essay practice fortnightly"] },
      { phase: "Prelims Intensive", duration: "3 months", tasks: ["Previous 10 years UPSC Prelims papers", "Monthly Current Affairs from Vision IAS", "CSAT Paper 2 (qualifying — don't neglect)"] },
      { phase: "Mains Writing Practice", duration: "4 months", tasks: ["Answer writing daily — 5 Qs per day", "Mock mains tests from Vision IAS / InsightIAS", "Ethics case studies practice"] },
      { phase: "Interview Preparation", duration: "2 months", tasks: ["DAF (Detailed Application Form) deep analysis", "Mock interviews from coaching institutes", "Current affairs mastery for interview panel"] },
    ],
    keyExams: [
      { name: "UPSC CSE (IAS/IPS/IFS)", targetScore: "Prelims 115+, Mains rank under 100 for IAS", prep: "Minimum 1.5 year full-time; Vision IAS + InsightIAS; newspaper mandatory" },
      { name: "SSC CGL (Tier 1–4)", targetScore: "Tier 1 190+ (online mock-based)", prep: "Faster track than UPSC; 6-month prep; Reasoning and Maths are deciding factors" },
      { name: "IBPS PO (Bank PO)", targetScore: "90+ (Prelims), 80+ (Mains)", prep: "Quant and Reasoning heavy; Testbook / Adda247 for mocks; 4-month prep" },
      { name: "RBI Grade B", targetScore: "Phase 1 130+, Phase 2 for merit", prep: "Hardest banking exam; Economics + Finance awareness required; 8-month prep" },
    ],
    topPrograms: [
      { name: "IAS (Indian Administrative Service)", location: "All India", why: "The apex civil service; district collector to secretary-level positions" },
      { name: "IPS (Indian Police Service)", location: "All India", why: "SP and above positions; law enforcement leadership" },
      { name: "IFS (Indian Foreign Service)", location: "New Delhi + World", why: "Diplomatic corps; embassies and consulates; international postings" },
      { name: "SSC CGL (Central Govt Jobs)", location: "All India", why: "Faster entry to central government; Inspector CBI, Income Tax Officer, etc." },
      { name: "IBPS PO (Public Sector Banks)", location: "All India", why: "Stable career; banking officer; promotion to manager in 4–5 years" },
    ],
    scholarships: [
      "PM Scholarship Scheme for central govt employees' wards",
      "State government UPSC coaching scholarships (free coaching for EWS)",
      "DR BR Ambedkar Foundation coaching assistance",
      "Lal Bahadur Shastri National Academy: in-service training stipend",
      "Many state PSC coaching centers funded by state government",
      "IAS Foundation course stipend (₹45,000/month during training at LBSNAA)",
    ],
    tips: [
      "Read The Hindu every single day — skip it once and you're a week behind",
      "Answer writing is the key differentiator in UPSC Mains — practice from Day 1",
      "Vision IAS Yearly Current Affairs magazine is the best revision resource",
      "UPSC tests depth + breadth — don't rely on coaching notes alone; read original sources",
    ],
  },
  certification: {
    overview: "Professional certifications validate specific skills and can provide 20–40% salary boosts. Most can be completed in 3–6 months alongside full-time work.",
    timelineMonths: 4,
    phases: [
      { phase: "Choose & Plan", duration: "2 weeks", tasks: ["Identify cert aligned with career goal (AWS/CFA/PMP/etc.)", "Check employer support / reimbursement policies", "Schedule exam date 3 months out to create deadline"] },
      { phase: "Foundation Study", duration: "6 weeks", tasks: ["Complete official study guide or video course", "Understand exam blueprint and weightage", "Take notes with active recall"] },
      { phase: "Practice Tests", duration: "4 weeks", tasks: ["Minimum 5 full-length practice tests", "Review every wrong answer — don't just re-read", "Topic-wise weak area focused revision"] },
      { phase: "Final Revision", duration: "2 weeks", tasks: ["Flashcards for formulas and key concepts", "Official practice exams if available", "Review exam-day strategy and time management"] },
    ],
    keyExams: [
      { name: "AWS Solutions Architect Associate", targetScore: "720+ (pass threshold)", prep: "Adrian Cantrill or Stephane Maarek course on Udemy + 6 Whizlabs practice tests; 2-month prep" },
      { name: "CFA Level 1", targetScore: "Above MPS (varies, ~65%)", prep: "CFA Institute curriculum + Schweser; 300+ hours of study; June/November exam windows" },
      { name: "PMP (Project Management Prof.)", targetScore: "Above target (no published pass score)", prep: "PMI's PMBOK + PrepCast Simulator; 35 PDUs required before applying; 3-month prep" },
      { name: "CompTIA Security+", targetScore: "750+ (pass at 750/900)", prep: "Professor Messer free course + Jason Dion practice tests; 6-week prep; entry-level cybersecurity" },
    ],
    topPrograms: [
      { name: "AWS Certification Path", location: "Online / Prometric", why: "Cloud skills are #1 in demand; SAA-C03 is the best ROI first cert" },
      { name: "CFA Program (L1–L3)", location: "Online / Test Centers", why: "Gold standard in finance; opens portfolio management, IB, research analyst roles" },
      { name: "PMP Certification", location: "Online / Test Centers", why: "35% salary premium for project managers; recognized in 200+ countries" },
      { name: "Google Cloud Professional", location: "Online / Test Centers", why: "Growing demand; Google Cloud's market share is accelerating" },
      { name: "CISSP (Security)", location: "Online / Test Centers", why: "Premier cybersecurity cert; 5 years experience required but highest salary bump" },
    ],
    scholarships: [
      "Most employers have L&D budgets — request reimbursement before paying",
      "AWS offers $300 exam vouchers through re/Start and community programs",
      "CFA Institute diversity scholarships (women + underrepresented communities)",
      "PMI membership ($139) reduces exam fee by $200 — always worth it",
      "Google Career Certificates financial assistance via Coursera",
      "LinkedIn Learning has most prep courses included with Premium subscription",
    ],
    tips: [
      "Schedule the exam first — having a deadline forces commitment",
      "Practice tests are more valuable than reading — aim for 80%+ before the real exam",
      "Most employer L&D budgets are 'use it or lose it' — ask your manager now",
      "Combine certs: AWS SAA → AWS Developer → AWS DevOps forms a powerful cloud stack",
    ],
  },
};

// ── Static hardcoded exam guides ───────────────────────────────────────────
const EXAM_GUIDES: Record<string, any> = {
  'GRE': {
    overview: "Graduate Record Examination — required for most US/Canadian Master's and PhD programs. Tests Verbal Reasoning, Quantitative Reasoning, and Analytical Writing.",
    format: { sections: ["Verbal Reasoning (2 sections)", "Quant Reasoning (2 sections)", "Analytical Writing (2 essays)"], totalMarks: "340 (V+Q) + 6 (AW)", duration: "3 hr 45 min", frequency: "Year-round, 5 times a year" },
    syllabus: [
      { topic: "Quantitative Reasoning", weightage: "40%", subtopics: ["Arithmetic", "Algebra", "Geometry", "Data Analysis"] },
      { topic: "Verbal Reasoning", weightage: "40%", subtopics: ["Text Completion", "Sentence Equivalence", "Reading Comprehension"] },
      { topic: "Analytical Writing", weightage: "20%", subtopics: ["Issue Essay", "Argument Essay"] },
    ],
    strategy: [
      { week: "Weeks 1–3", focus: "Quant Foundation", resources: ["Manhattan Prep 5 lb book", "Khan Academy for gaps"] },
      { week: "Weeks 4–6", focus: "Verbal Vocabulary + RC", resources: ["Magoosh Flashcards (1000 words)", "GRE Big Book RCs"] },
      { week: "Weeks 7–8", focus: "Full Mocks + AW", resources: ["ETS Official Practice Tests (free)", "ScoreItNow for AW"] },
    ],
    resources: { books: ["ETS Official GRE Super Power Pack", "Manhattan Prep GRE Set"], online: ["Magoosh GRE (best value)", "Gregmat (for verbal)"], mockTests: ["ETS Official Tests 1 & 2 (free)", "Manhattan Prep 6 CATs"] },
    cutoffs: "For top US programs: Quant 165+, Verbal 155+. Top CS/STEM programs want Quant 167+. AW 4.5+ is competitive.",
    tips: ["Do Quant first in each section — it's more time-controllable", "Learn the top 500 GRE words before test day", "ETS Official Tests are the most accurate predictors", "Retakes allowed after 21 days; best score is used by most programs"],
  },
  'GATE': {
    overview: "Graduate Aptitude Test in Engineering — premier Indian exam for MTech at IITs/IISc and funded PhD positions. Also accepted by TU Munich and some European schools.",
    format: { sections: ["Technical Subject (72 marks)", "Engineering Mathematics (13 marks)", "General Aptitude (15 marks)"], totalMarks: "100", duration: "3 hours", frequency: "Once a year (February)" },
    syllabus: [
      { topic: "Core Technical Subject (CS/EC/EE/ME etc.)", weightage: "72%", subtopics: ["Algorithms & DS", "OS", "DBMS", "Computer Networks (for CS)"] },
      { topic: "Engineering Mathematics", weightage: "13%", subtopics: ["Linear Algebra", "Calculus", "Probability", "Graph Theory"] },
      { topic: "General Aptitude", weightage: "15%", subtopics: ["Verbal Ability", "Numerical Ability"] },
    ],
    strategy: [
      { week: "Months 1–3", focus: "Core Subject Mastery", resources: ["NPTEL lectures", "Gate Smashers (YouTube)"] },
      { week: "Months 4–5", focus: "Previous Papers + Mathematics", resources: ["GATE previous 15 years papers", "Ravindra Babu Ravula lectures"] },
      { week: "Month 6", focus: "Mock Tests + Weak Areas", resources: ["Made Easy test series", "GATE Virtual Calculator practice"] },
    ],
    resources: { books: ["Made Easy handbooks by subject", "Geeks for Geeks (CS theory)"], online: ["NPTEL free courses", "Gate Smashers YouTube"], mockTests: ["Made Easy Test Series", "ACE Academy Test Series"] },
    cutoffs: "IIT/IISc MTech: 700–850 GATE score (95+ percentile). PSUs (ONGC, BHEL): cutoff varies 60–75 percentile. Germany TU Munich: 90+ percentile.",
    tips: ["GATE score is valid for 3 years — plan PSU applications alongside", "General Aptitude is easy free marks — don't ignore it", "Negative marking for MCQs but NOT for NAT questions — attempt all NATs", "Practice on virtual GATE calculator from Day 1"],
  },
  'CAT': {
    overview: "Common Admission Test — India's most competitive MBA entrance exam. Gateway to IIMs and 200+ top B-schools. 2.5 lakh+ candidates compete for ~4,000 IIM seats.",
    format: { sections: ["VARC — Verbal Ability & RC (40 mins)", "DILR — Data Interpretation & Logical Reasoning (40 mins)", "QA — Quantitative Ability (40 mins)"], totalMarks: "198 (66 Qs × 3 marks)", duration: "2 hours (40 min/section)", frequency: "Once a year (November/December)" },
    syllabus: [
      { topic: "Verbal Ability & Reading Comprehension", weightage: "34%", subtopics: ["Reading Comprehension (5 passages)", "Para-jumbles", "Para-summary", "Odd sentence out"] },
      { topic: "Data Interpretation & Logical Reasoning", weightage: "33%", subtopics: ["Tables, Bar Graphs, Pie Charts", "Caselets", "Logical Puzzles", "Sets & Grid"] },
      { topic: "Quantitative Ability", weightage: "33%", subtopics: ["Arithmetic (40%)", "Algebra", "Geometry", "Number System"] },
    ],
    strategy: [
      { week: "Months 1–2", focus: "Concept Building per section", resources: ["IMS Study Material", "Arun Sharma books (QA + LR)"] },
      { week: "Months 3–4", focus: "Previous CAT Papers + Sectional Tests", resources: ["CAT 2004–2023 papers (free online)", "TIME sectional tests"] },
      { week: "Month 5–6", focus: "Full Mocks + DILR Specialization", resources: ["IMS / TIME full CAT mocks", "2IIM free resources for DILR"] },
    ],
    resources: { books: ["Arun Sharma QA + LR (Tata McGraw Hill)", "Nishit Sinha VA+RC"], online: ["2IIM free resources", "Career Launcher mock tests"], mockTests: ["IMS SimCAT series", "TIME mocks", "CATKing"] },
    cutoffs: "IIM A/B/C: 99+ percentile overall + 95+ in each section. IIM L/K/I: 97–98 percentile. Top private schools: 90–95 percentile.",
    tips: ["DILR is the differentiator — practice 2 DILR sets daily from Month 1", "Attempt RC first within VARC — skip VA questions that feel risky", "Accuracy matters more than attempts — 40 questions at 90% > 55 at 70%", "Mock analysis is more valuable than taking the mock itself"],
  },
  'NEET UG': {
    overview: "National Eligibility cum Entrance Test (UG) — India's single entrance for all government and private medical colleges. 22 lakh+ candidates for ~1 lakh MBBS seats.",
    format: { sections: ["Physics (45 Qs)", "Chemistry (45 Qs)", "Biology — Botany (50 Qs) + Zoology (50 Qs)"], totalMarks: "720 (180 Qs × 4 marks, -1 for wrong)", duration: "3 hours 20 minutes", frequency: "Once a year (May)" },
    syllabus: [
      { topic: "Biology (Botany + Zoology)", weightage: "50% — 360 marks", subtopics: ["Cell Biology", "Genetics", "Human Physiology", "Plant Physiology", "Ecology"] },
      { topic: "Chemistry", weightage: "25% — 180 marks", subtopics: ["Physical Chemistry", "Organic Chemistry", "Inorganic Chemistry (NCERT dominant)"] },
      { topic: "Physics", weightage: "25% — 180 marks", subtopics: ["Mechanics", "Electrostatics & Magnetism", "Modern Physics", "Optics"] },
    ],
    strategy: [
      { week: "Months 1–8", focus: "NCERT Complete + Coaching", resources: ["AAKASH / Allen / Unacademy NEET batch", "HC Verma for Physics concepts"] },
      { week: "Months 9–10", focus: "Previous Years + Revision", resources: ["NEET previous 20 years papers", "DC Pandey Physics for NEET"] },
      { week: "Months 11–12", focus: "Mock Tests + Biology Deep Revision", resources: ["NTA Abhyas App (official free mocks)", "Biology Rapid Revision notes"] },
    ],
    resources: { books: ["NCERT 11th & 12th (all 4 subjects — primary)", "HC Verma Physics Vol 1 & 2", "Cengage / DC Pandey for Physics"], online: ["Unacademy NEET batch", "Vedantu NEET Pro"], mockTests: ["NTA Abhyas App (free, official)", "AAKASH iTutor mock tests"] },
    cutoffs: "AIIMS Delhi: 715–718. Top government medical colleges (state quota): 600–650. Private MBBS (management quota): 400–500.",
    tips: ["Biology NCERT is the Holy Bible — every line, every diagram is a potential question", "Target 160+ in Biology — it's the safest section to maximise", "Don't skip inorganic chemistry — it's 40% of chemistry and mostly direct from NCERT", "Attempt previous 10 years papers topic-by-topic before full mocks"],
  },
  'UPSC CSE': {
    overview: "Union Public Service Commission Civil Services Exam — India's most prestigious exam. Selects for IAS, IPS, IFS, and 22 other services. 10 lakh applicants for ~1,000 selections.",
    format: { sections: ["Prelims: GS Paper 1 (200 marks) + CSAT Paper 2 (qualifying 33%)", "Mains: 9 papers — 4 GS + 2 Optional + Essay + Language", "Interview: 275 marks personality test"], totalMarks: "2025 (Mains) + 275 (Interview) = 2300", duration: "Prelims: 2+2 hrs | Mains: 3 hrs each paper | Interview: 30–45 min", frequency: "Once a year (Prelims: May, Mains: September)" },
    syllabus: [
      { topic: "GS Paper 1 (History, Geography, Culture, Society)", weightage: "Mains 250 marks", subtopics: ["Indian History & Freedom Struggle", "World History", "Indian & World Geography", "Indian Society"] },
      { topic: "GS Paper 2 (Polity, Governance, IR)", weightage: "Mains 250 marks", subtopics: ["Indian Polity & Constitution", "Governance", "Social Justice", "International Relations"] },
      { topic: "GS Paper 3 (Economy, Environment, Science)", weightage: "Mains 250 marks", subtopics: ["Indian Economy", "Agriculture", "Environment & Ecology", "Science & Technology"] },
      { topic: "GS Paper 4 (Ethics)", weightage: "Mains 250 marks", subtopics: ["Ethics & Human Interface", "Attitude", "Aptitude & Foundational Values", "Case Studies"] },
    ],
    strategy: [
      { week: "Months 1–4", focus: "NCERT Foundation + Polity/History/Geography", resources: ["NCERT 6–12 (History, Geo, Polity, Economy)", "Laxmikanth Polity", "Bipin Chandra Modern History"] },
      { week: "Months 5–10", focus: "Standard Books + Current Affairs", resources: ["The Hindu + Indian Express daily", "Vision IAS Monthly CA Magazine", "Economic Survey + India Yearbook"] },
      { week: "Months 11–15", focus: "Mains Answer Writing + Optional", resources: ["InsightIAS Answer Writing Program", "Vision IAS PT 365 for Prelims"] },
    ],
    resources: { books: ["Laxmikanth Indian Polity", "Bipin Chandra Modern India", "Spectrum Modern History"], online: ["Vision IAS (best overall)", "InsightIAS for Mains"], mockTests: ["Vision IAS Prelims Test Series", "Forum IAS Mains Test Series"] },
    cutoffs: "Prelims GS 1 cutoff: 88–100 (varies). Final cut-off for IAS: typically Mains + Interview combined 950+ out of 2300.",
    tips: ["Read The Hindu without fail — 2 missed days = significant CA gap", "Ethics GS4 — answer writing practice from Month 1, not Month 12", "Prelims negative marking: attempt only when 60%+ confident", "Interview: your DAF is your interviewer's script — know every line of it"],
  },
  'IELTS': {
    overview: "International English Language Testing System — accepted by 10,000+ institutions in 140 countries. Required for Master's, immigration, and professional licensing.",
    format: { sections: ["Listening (40 Qs, 30 min)", "Reading (40 Qs, 60 min)", "Writing (2 tasks, 60 min)", "Speaking (11–14 min interview)"], totalMarks: "9.0 band scale (0–9)", duration: "2 hr 45 min + Speaking (separate day)", frequency: "Year-round at test centres; IELTS Online available" },
    syllabus: [
      { topic: "Reading Comprehension", weightage: "25%", subtopics: ["True/False/Not Given", "Matching Headings", "Summary Completion", "Multiple Choice"] },
      { topic: "Writing Task 1 & 2", weightage: "25%", subtopics: ["Task 1: Describe graphs/charts/maps/processes", "Task 2: Academic essay (minimum 250 words)"] },
      { topic: "Listening", weightage: "25%", subtopics: ["Monologues", "Conversations", "Lectures", "Note completion"] },
      { topic: "Speaking", weightage: "25%", subtopics: ["Part 1: Personal Questions", "Part 2: Cue Card", "Part 3: Discussion"] },
    ],
    strategy: [
      { week: "Weeks 1–2", focus: "Baseline test + weakness ID", resources: ["Cambridge IELTS Book 1 (free online)", "British Council band score calculator"] },
      { week: "Weeks 3–6", focus: "Reading & Writing Intensive", resources: ["Cambridge IELTS 14–18 books", "IELTS Liz (free website — best for Writing)"] },
      { week: "Weeks 7–8", focus: "Speaking + Listening", resources: ["IELTS Speaking Part 2 topics practice", "IELTS Advantage podcast"] },
    ],
    resources: { books: ["Cambridge IELTS Official Practice Tests 14–18", "Barron's IELTS Superpack"], online: ["IELTS Liz (free, excellent)", "British Council IELTS preparation"], mockTests: ["IDP / British Council official mock", "IELTS Prep App (official)"] },
    cutoffs: "Most Master's programs: 6.5–7.0 overall, no band below 6.0. Top UK/Australian universities: 7.0+. Nursing/Medicine: 7.5+ in all bands.",
    tips: ["Speaking Part 2: Always speak for the full 2 minutes — keep talking even if you repeat slightly", "Writing Task 2 carries more weight than Task 1 — spend 40 minutes on it", "Reading: Read the questions first, then scan the text", "Listening: Spellings matter — practice British English spelling variants"],
  },
  'GMAT': {
    overview: "Graduate Management Admission Test — standard exam for global MBA and business Master's programs. The 2023 GMAT Focus Edition is shorter and more skills-focused.",
    format: { sections: ["Quantitative Reasoning (45 min, 21 Qs)", "Verbal Reasoning (45 min, 23 Qs)", "Data Insights (45 min, 20 Qs)"], totalMarks: "205–805 total score", duration: "2 hr 15 min (Focus Edition)", frequency: "Year-round, up to 5 times/year" },
    syllabus: [
      { topic: "Quantitative Reasoning", weightage: "33%", subtopics: ["Problem Solving (arithmetic, algebra, geometry)", "No Data Sufficiency in Focus Edition"] },
      { topic: "Verbal Reasoning", weightage: "33%", subtopics: ["Reading Comprehension", "Critical Reasoning", "No Sentence Correction in Focus Edition"] },
      { topic: "Data Insights", weightage: "34%", subtopics: ["Data Sufficiency", "Multi-Source Reasoning", "Table Analysis", "Graphics Interpretation", "Two-Part Analysis"] },
    ],
    strategy: [
      { week: "Weeks 1–3", focus: "OG Study + Concept Review", resources: ["GMAT Official Guide 2024", "Target Test Prep (Quant) — best resource"] },
      { week: "Weeks 4–6", focus: "Verbal + Data Insights", resources: ["GMAT Club forum explanations", "Manhattan Prep Critical Reasoning"] },
      { week: "Weeks 7–8", focus: "Full Mocks + Timing Strategy", resources: ["Official GMAT Focus Exam Prep (2 free CATs)", "Scholaranium for practice Qs"] },
    ],
    resources: { books: ["GMAT Official Guide 2024 (must-have)", "Manhattan Prep GMAT Strategy Guides"], online: ["Target Test Prep (best for Quant)", "e-GMAT (best for Verbal)"], mockTests: ["Official GMAT Focus Exam Prep (2 free)", "Manhattan Prep CATs (6 paid)"] },
    cutoffs: "Harvard / Wharton / Booth / Sloan: 730+ average. ISB Hyderabad: 710+ average. IIM Calcutta PGPEX: 700+. 650+ competitive for most top programs.",
    tips: ["Data Insights is the new differentiator — practice it the most", "IR and AWA don't affect the 800 score but are read by adcoms", "Retake policy: 3 attempts in 12 months; schools see all scores unless score preview used", "Book test appointment 3 weeks early — popular slots fill fast"],
  },
  'CLAT': {
    overview: "Common Law Admission Test — gateway to 24 National Law Universities (NLUs) for the 5-year Integrated BA LLB program. 70,000+ candidates for ~3,200 seats.",
    format: { sections: ["English Language (22–26 Qs)", "Current Affairs + GK (28–32 Qs)", "Legal Reasoning (35–39 Qs)", "Logical Reasoning (28–32 Qs)", "Quantitative Techniques (13–17 Qs)"], totalMarks: "120 (−0.25 negative marking)", duration: "2 hours", frequency: "Once a year (May)" },
    syllabus: [
      { topic: "English Language & Reading Comprehension", weightage: "22%", subtopics: ["Inference-based RC passages", "Vocabulary in context", "Para-completion"] },
      { topic: "Current Affairs & GK", weightage: "25%", subtopics: ["Legal + constitutional developments", "International affairs", "Awards, appointments, sports"] },
      { topic: "Legal Reasoning", weightage: "30%", subtopics: ["Principle-Fact pattern questions", "Legal maxims", "Constitutional law basics"] },
      { topic: "Logical Reasoning", weightage: "20%", subtopics: ["Critical reasoning", "Inference", "Assumption identification"] },
    ],
    strategy: [
      { week: "Months 1–3", focus: "Legal Reasoning Foundations + Newspaper habit", resources: ["Lexis Nexis CLAT guide", "The Hindu + Live Law daily"] },
      { week: "Months 4–5", focus: "RC + GK Current Affairs", resources: ["Lawctopus free materials", "GK Today monthly magazine"] },
      { week: "Month 6", focus: "Full Mocks + Speed Improvement", resources: ["CLAT previous 10 years papers (official)", "CLATapult test series"] },
    ],
    resources: { books: ["Universal's CLAT Guide", "Previous 15 years CLAT papers"], online: ["Lawctopus (free resources)", "CLATapult online coaching"], mockTests: ["CLATapult test series", "CLAT official website practice"] },
    cutoffs: "NLSIU Bangalore: 111–116 out of 120. NALSAR Hyderabad: 108–112. NLU Delhi (AILET separate): top 100 rank.",
    tips: ["Legal Reasoning requires zero prior law knowledge — it's about applying given principles", "Read The Hindu legal affairs section every day from Month 1", "Quantitative Techniques is basic class 10 maths — don't over-invest", "Time management: average 1 minute per question — practice with timer always"],
  },
};

const STUDY_GOALS: { id: StudyGoal; label: string; icon: string }[] = [
  { id: 'masters', label: "Master's Degree", icon: '🎓' },
  { id: 'phd', label: 'PhD / Research', icon: '🔬' },
  { id: 'mba', label: 'MBA', icon: '💼' },
  { id: 'law', label: 'Law School', icon: '⚖️' },
  { id: 'medicine', label: 'Medicine', icon: '🏥' },
  { id: 'govt-exam', label: 'Govt / Civil Services', icon: '🏛️' },
  { id: 'certification', label: 'Professional Cert', icon: '📜' },
];

const EXAMS_BY_GOAL: Record<StudyGoal, string[]> = {
  masters: ['GRE', 'IELTS', 'GATE'],
  phd: ['GRE', 'GATE'],
  mba: ['CAT', 'GMAT'],
  law: ['CLAT'],
  medicine: ['NEET UG'],
  'govt-exam': ['UPSC CSE'],
  certification: [],
};

const COUNTRIES = ['India', 'USA', 'UK', 'Canada', 'Germany', 'Australia', 'Singapore', 'Other'];

// ── Resume → goal inference ────────────────────────────────────────────────
function inferGoal(data: any): StudyGoal {
  if (!data) return 'masters';
  const role = (data.targetRole || '').toLowerCase();
  const skills = (data.skills || []).join(' ').toLowerCase();
  if (role.includes('research') || role.includes('scientist')) return 'phd';
  if (role.includes('manager') || role.includes('product') || role.includes('business') || role.includes('consultant')) return 'mba';
  if (role.includes('doctor') || role.includes('medical') || role.includes('mbbs')) return 'medicine';
  if (role.includes('law') || role.includes('legal') || role.includes('lawyer')) return 'law';
  if (role.includes('civil') || role.includes('government') || role.includes('ias')) return 'govt-exam';
  if (skills.includes('aws') || skills.includes('cfa') || skills.includes('pmp')) return 'certification';
  return 'masters';
}

function inferBackground(data: any): string {
  if (!data) return '';
  const edu = data.education?.[0];
  if (edu?.degree && edu?.school) return `${edu.degree}, ${edu.school}`;
  if (edu?.degree) return edu.degree;
  if (data.targetRole) return `${data.targetRole} professional`;
  return '';
}

// ── Dropdown component ─────────────────────────────────────────────────────
function Dropdown({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full appearance-none px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-800 focus:outline-none focus:border-blue-500 cursor-pointer pr-10"
        >
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
      </div>
    </div>
  );
}

// ── Plan Display ───────────────────────────────────────────────────────────
function PlanDisplay({ plan, isPersonalised, loading }: { plan: any; isPersonalised: boolean; loading: boolean }) {
  if (loading) return (
    <div className="flex items-center gap-3 py-12 justify-center text-zinc-500">
      <Loader2 className="w-5 h-5 animate-spin text-blue-700" />
      <span className="font-bold text-sm">Personalising your roadmap with AI…</span>
    </div>
  );

  return (
    <div className="space-y-6">
      {isPersonalised && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-100 rounded-xl w-fit">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <p className="text-xs font-black text-emerald-700 uppercase tracking-widest">AI Personalised</p>
        </div>
      )}

      <p className="text-zinc-600 text-sm font-medium leading-relaxed">{plan.overview}</p>

      <div className="space-y-3">
        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Roadmap — {plan.timelineMonths} months</p>
        {plan.phases.map((p: any, i: number) => (
          <div key={i} className="flex gap-4 p-5 bg-zinc-50 rounded-2xl">
            <div className="w-8 h-8 bg-blue-700 text-white rounded-xl flex items-center justify-center font-black text-xs shrink-0">{i + 1}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <p className="font-black text-zinc-900 text-sm">{p.phase}</p>
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest shrink-0">{p.duration}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {p.tasks.map((t: string, j: number) => (
                  <span key={j} className="text-xs bg-white border border-zinc-200 text-zinc-700 px-2.5 py-1 rounded-lg font-medium">{t}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="p-5 bg-white rounded-2xl border border-zinc-100 space-y-3">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Key Exams</p>
          {plan.keyExams.map((e: any, i: number) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-zinc-50 rounded-xl">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <p className="font-bold text-zinc-900 text-sm">{e.name}</p>
                  <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full shrink-0">{e.targetScore}</span>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">{e.prep}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-5 bg-white rounded-2xl border border-zinc-100 space-y-3">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Top Programs</p>
          {plan.topPrograms.map((p: any, i: number) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-zinc-50 rounded-xl">
              <Trophy className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-zinc-900 text-sm">{p.name}</p>
                <p className="text-xs text-zinc-500 flex items-center gap-1"><MapPin className="w-3 h-3 shrink-0" />{p.location}</p>
                <p className="text-xs text-zinc-600 mt-0.5">{p.why}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-2">
          <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Scholarships</p>
          {plan.scholarships.map((s: string, i: number) => (
            <p key={i} className="text-xs text-emerald-800 font-medium flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />{s}</p>
          ))}
        </div>
        <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl space-y-2">
          <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Success Tips</p>
          {plan.tips.map((t: string, i: number) => (
            <p key={i} className="text-xs text-blue-900 font-medium flex items-start gap-2"><Zap className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />{t}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Exam Guide Display ─────────────────────────────────────────────────────
function ExamGuideDisplay({ guide, loading }: { guide: any; loading: boolean }) {
  if (loading) return (
    <div className="flex items-center gap-3 py-12 justify-center text-zinc-500">
      <Loader2 className="w-5 h-5 animate-spin text-blue-700" />
      <span className="font-bold text-sm">Generating personalised exam tips…</span>
    </div>
  );

  return (
    <div className="space-y-5">
      <p className="text-zinc-600 text-sm font-medium">{guide.overview}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {guide.format.sections.map((s: string, i: number) => (
          <div key={i} className="p-4 bg-zinc-50 rounded-xl text-center">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Section {i + 1}</p>
            <p className="font-bold text-zinc-900 text-xs leading-tight">{s}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="p-5 bg-white rounded-2xl border border-zinc-100 space-y-3">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Syllabus & Weightage</p>
          {guide.syllabus.map((s: any, i: number) => (
            <div key={i}>
              <div className="flex justify-between items-center mb-1">
                <p className="font-bold text-zinc-800 text-sm">{s.topic}</p>
                <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">{s.weightage}</span>
              </div>
              <p className="text-xs text-zinc-500">{s.subtopics.join(' · ')}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="p-5 bg-white rounded-2xl border border-zinc-100 space-y-3">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Study Strategy</p>
            {guide.strategy.map((s: any, i: number) => (
              <div key={i} className="p-3 bg-zinc-50 rounded-xl">
                <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-1">{s.week}</p>
                <p className="font-bold text-zinc-900 text-xs">{s.focus}</p>
                {s.resources.map((r: string, j: number) => <p key={j} className="text-xs text-zinc-500">· {r}</p>)}
              </div>
            ))}
          </div>
          <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl">
            <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-2">Cutoffs</p>
            <p className="text-xs text-amber-900 font-medium">{guide.cutoffs}</p>
          </div>
        </div>
      </div>

      <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl grid md:grid-cols-2 gap-2">
        {guide.tips.map((t: string, i: number) => (
          <p key={i} className="text-xs text-blue-900 font-medium flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />{t}</p>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export function HigherStudiesSection({ data }: Props) {
  const resumeBackground = useMemo(() => inferBackground(data), [data]);
  const suggestedGoal = useMemo(() => inferGoal(data), [data]);

  // Planner state
  const [planGoal, setPlanGoal] = useState<StudyGoal>(suggestedGoal);
  const [planCountry, setPlanCountry] = useState('India');
  const [planBackground, setPlanBackground] = useState(resumeBackground);
  const [aiPlan, setAiPlan] = useState<any>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [planPersonalised, setPlanPersonalised] = useState(false);

  // Exam guide state
  const [examGoal, setExamGoal] = useState<StudyGoal>(suggestedGoal);
  const [selectedExam, setSelectedExam] = useState<string>(EXAMS_BY_GOAL[suggestedGoal]?.[0] || '');
  const [aiExamGuide, setAiExamGuide] = useState<any>(null);
  const [examLoading, setExamLoading] = useState(false);

  // Tracker state
  const [showTracker, setShowTracker] = useState(false);
  const [trackerItems, setTrackerItems] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('cb_higher_tracker') || '[]'); } catch { return []; }
  });
  const [newApp, setNewApp] = useState({ school: '', program: '', deadline: '', notes: '' });

  const saveTracker = (items: any[]) => {
    setTrackerItems(items);
    localStorage.setItem('cb_higher_tracker', JSON.stringify(items));
  };

  const activePlan = aiPlan || PLANS[planGoal];
  const activeGuide = aiExamGuide || (selectedExam ? EXAM_GUIDES[selectedExam] : null);

  const personaliseWithAI = async () => {
    setPlanLoading(true);
    setAiPlan(null);
    setPlanPersonalised(false);
    try {
      const resumeCtx = data ? `
Name: ${data.personalInfo?.fullName || 'not specified'}
Current Role / Target: ${data.targetRole || 'not specified'}
Skills: ${(data.skills || []).join(', ') || 'not specified'}
Education: ${(data.education || []).map((e: any) => `${e.degree} from ${e.school} (${e.year})`).join('; ') || 'not specified'}
Experience: ${(data.experience || []).map((e: any) => `${e.title} at ${e.company}`).join('; ') || 'not specified'}
Missing Skills: ${(data.missingSkills || []).join(', ') || 'not specified'}
` : 'No resume uploaded.';

      const goalLabel = STUDY_GOALS.find(g => g.id === planGoal)?.label || planGoal;
      const prompt = `You are a higher education counsellor. Create a personalised study roadmap for this student:

RESUME CONTEXT:
${resumeCtx}

GOAL: ${goalLabel} in ${planCountry}
CURRENT BACKGROUND: ${planBackground || 'not specified'}

Return ONLY valid JSON (no markdown fences):
{
  "overview": "2-3 sentence personalised summary referencing their specific background",
  "timelineMonths": number,
  "phases": [{ "phase": "string", "duration": "string", "tasks": ["string"] }],
  "keyExams": [{ "name": "string", "targetScore": "string", "prep": "string" }],
  "topPrograms": [{ "name": "string", "location": "string", "why": "string" }],
  "scholarships": ["string"],
  "tips": ["string"]
}`;

      const res = await callGemini(prompt);
      const json = res.text.replace(/```json\n?|\n?```/g, '').trim();
      setAiPlan(JSON.parse(json));
      setPlanPersonalised(true);
    } catch (e) {
      console.error(e);
    } finally {
      setPlanLoading(false);
    }
  };

  const getAIExamTips = async () => {
    if (!selectedExam) return;
    setExamLoading(true);
    setAiExamGuide(null);
    try {
      const resumeCtx = data ? `Background: ${data.targetRole || 'not specified'}, Skills: ${(data.skills || []).join(', ')}` : 'No resume data.';
      const prompt = `You are an expert exam coach. Provide a personalised guide for ${selectedExam}.
Student context: ${resumeCtx}

Return ONLY valid JSON (no markdown fences):
{
  "exam": "${selectedExam}",
  "overview": "string",
  "format": { "sections": ["string"], "totalMarks": "string", "duration": "string", "frequency": "string" },
  "syllabus": [{ "topic": "string", "weightage": "string", "subtopics": ["string"] }],
  "strategy": [{ "week": "string", "focus": "string", "resources": ["string"] }],
  "resources": { "books": ["string"], "online": ["string"], "mockTests": ["string"] },
  "cutoffs": "string",
  "tips": ["string", "string", "string", "string"]
}`;
      const res = await callGemini(prompt);
      const json = res.text.replace(/```json\n?|\n?```/g, '').trim();
      setAiExamGuide(JSON.parse(json));
    } catch (e) {
      console.error(e);
    } finally {
      setExamLoading(false);
    }
  };

  const STATUS_COLORS: Record<string, string> = {
    planning: 'bg-zinc-100 text-zinc-600',
    applied: 'bg-blue-50 text-blue-700',
    shortlisted: 'bg-amber-50 text-amber-700',
    rejected: 'bg-rose-50 text-rose-600',
    accepted: 'bg-emerald-50 text-emerald-700',
  };

  if (showTracker) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-32">
        <button onClick={() => setShowTracker(false)} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 font-bold transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Higher Studies
        </button>
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black text-zinc-900">Application Tracker</h2>
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{trackerItems.length} applications</span>
        </div>

        <div className="p-7 bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm space-y-4">
          <p className="text-sm font-black text-zinc-900 uppercase tracking-widest">Add Application</p>
          <div className="grid grid-cols-2 gap-3">
            <input value={newApp.school} onChange={e => setNewApp(p => ({ ...p, school: e.target.value }))} placeholder="University / Institute" className="px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 col-span-2 md:col-span-1" />
            <input value={newApp.program} onChange={e => setNewApp(p => ({ ...p, program: e.target.value }))} placeholder="Program / Course" className="px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 col-span-2 md:col-span-1" />
            <input type="date" value={newApp.deadline} onChange={e => setNewApp(p => ({ ...p, deadline: e.target.value }))} className="px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500" />
            <input value={newApp.notes} onChange={e => setNewApp(p => ({ ...p, notes: e.target.value }))} placeholder="Notes (optional)" className="px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500" />
          </div>
          <button
            onClick={() => {
              if (!newApp.school || !newApp.program) return;
              saveTracker([{ id: Date.now(), ...newApp, status: 'planning' }, ...trackerItems]);
              setNewApp({ school: '', program: '', deadline: '', notes: '' });
            }}
            className="px-6 py-3 bg-blue-700 text-white font-bold text-sm rounded-xl hover:bg-blue-800 transition-all"
          >Add</button>
        </div>

        <div className="space-y-3">
          {trackerItems.length === 0 && (
            <div className="p-16 text-center bg-white rounded-[2.5rem] border border-zinc-100">
              <ClipboardList className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
              <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">No applications tracked yet</p>
            </div>
          )}
          {trackerItems.map((item, i) => (
            <div key={item.id} className="p-6 bg-white rounded-[2rem] border border-zinc-100 flex items-center gap-6">
              <div className="flex-1">
                <p className="font-black text-zinc-900">{item.school}</p>
                <p className="text-sm text-zinc-500 font-medium">{item.program}</p>
                {item.notes && <p className="text-xs text-zinc-400 mt-1">{item.notes}</p>}
              </div>
              {item.deadline && (
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Deadline</p>
                  <p className="text-sm font-bold text-zinc-700">{new Date(item.deadline).toLocaleDateString()}</p>
                </div>
              )}
              <div className="relative">
                <select
                  value={item.status}
                  onChange={e => saveTracker(trackerItems.map((it, j) => j === i ? { ...it, status: e.target.value } : it))}
                  className={`appearance-none text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl cursor-pointer pr-6 ${STATUS_COLORS[item.status]}`}
                >
                  <option value="planning">Planning</option>
                  <option value="applied">Applied</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="rejected">Rejected</option>
                  <option value="accepted">Accepted</option>
                </select>
                <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-50" />
              </div>
              <button onClick={() => saveTracker(trackerItems.filter((_, j) => j !== i))} className="text-zinc-300 hover:text-rose-500 transition-colors text-lg font-bold">×</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-32">
      {/* Header */}
      <header className="flex items-start gap-5">
        <div className="w-16 h-16 bg-blue-700 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-blue-100 shrink-0">
          <GraduationCap className="w-9 h-9" />
        </div>
        <div className="flex-1">
          <h1 className="text-4xl font-black text-zinc-900 tracking-tight">Higher Studies</h1>
          <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mt-1">Instant roadmaps + AI personalisation for your next academic milestone</p>
        </div>
        <button onClick={() => setShowTracker(true)} className="flex items-center gap-2 px-5 py-3 bg-white border border-zinc-200 rounded-2xl text-sm font-bold text-zinc-700 hover:border-blue-500 hover:text-blue-700 transition-all">
          <ClipboardList className="w-4 h-4" /> Tracker
          {trackerItems.length > 0 && <span className="bg-blue-700 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">{trackerItems.length}</span>}
        </button>
      </header>

      {/* Resume banner */}
      {data?.targetRole && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-5 bg-blue-50 border border-blue-100 rounded-2xl">
          <User className="w-5 h-5 text-blue-700 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-blue-900">
              Based on your resume — targeting <span className="text-blue-700">{data.targetRole}</span> — we've pre-selected <span className="text-blue-700">{STUDY_GOALS.find(g => g.id === suggestedGoal)?.label}</span>.
            </p>
            <p className="text-xs text-blue-600 mt-0.5">You can change the goal or click "Personalise with AI" to tailor the full plan to your profile.</p>
          </div>
        </motion.div>
      )}

      {/* ── Section 1: Study Planner ───────────────────────────────────────── */}
      <section className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-zinc-50">
          <h2 className="text-sm font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2 mb-1">
            <BookOpen className="w-4 h-4 text-blue-700" /> Study Planner
          </h2>
          <p className="text-zinc-500 text-xs font-medium">Select your goal and country — roadmap loads instantly. Click Personalise to tailor it to your resume.</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <Dropdown
              label="Your Goal"
              value={planGoal}
              onChange={v => { setPlanGoal(v as StudyGoal); setAiPlan(null); setPlanPersonalised(false); }}
              options={STUDY_GOALS.map(g => ({ value: g.id, label: `${g.icon} ${g.label}` }))}
            />
            <Dropdown
              label="Target Country"
              value={planCountry}
              onChange={v => { setPlanCountry(v); setAiPlan(null); setPlanPersonalised(false); }}
              options={COUNTRIES.map(c => ({ value: c, label: c }))}
            />
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Your Background</label>
              <input
                value={planBackground}
                onChange={e => setPlanBackground(e.target.value)}
                placeholder="e.g. B.Tech CSE, 2 yrs exp"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={personaliseWithAI}
              disabled={planLoading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-700 text-white font-black text-xs rounded-xl hover:bg-blue-800 disabled:opacity-40 transition-all uppercase tracking-widest"
            >
              {planLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Personalise with AI
            </button>
            {planPersonalised && (
              <button onClick={() => { setAiPlan(null); setPlanPersonalised(false); }} className="text-xs font-bold text-zinc-400 hover:text-zinc-700 transition-colors">
                ← Back to standard
              </button>
            )}
          </div>

          <PlanDisplay plan={activePlan} isPersonalised={planPersonalised} loading={planLoading} />
        </div>
      </section>

      {/* ── Section 2: Exam Guide ─────────────────────────────────────────── */}
      <section className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-zinc-50">
          <h2 className="text-sm font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2 mb-1">
            <Brain className="w-4 h-4 text-blue-700" /> Exam Preparation Guide
          </h2>
          <p className="text-zinc-500 text-xs font-medium">Instant syllabus, strategy and cutoffs. Click "AI Tips" for a personalised guide using your resume.</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid md:grid-cols-3 gap-4 items-end">
            <Dropdown
              label="Goal Category"
              value={examGoal}
              onChange={v => { setExamGoal(v as StudyGoal); setSelectedExam(EXAMS_BY_GOAL[v as StudyGoal]?.[0] || ''); setAiExamGuide(null); }}
              options={STUDY_GOALS.map(g => ({ value: g.id, label: `${g.icon} ${g.label}` }))}
            />
            <Dropdown
              label="Select Exam"
              value={selectedExam}
              onChange={v => { setSelectedExam(v); setAiExamGuide(null); }}
              options={
                EXAMS_BY_GOAL[examGoal]?.length
                  ? EXAMS_BY_GOAL[examGoal].map(e => ({ value: e, label: e }))
                  : Object.values(EXAM_GUIDES).map(e => ({ value: e.exam, label: e.exam }))
              }
            />
            <button
              onClick={getAIExamTips}
              disabled={!selectedExam || examLoading}
              className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white font-black text-xs rounded-xl hover:bg-black disabled:opacity-30 transition-all uppercase tracking-widest h-fit"
            >
              {examLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              AI Tips
            </button>
          </div>

          {selectedExam && activeGuide ? (
            <ExamGuideDisplay guide={activeGuide} loading={examLoading} />
          ) : selectedExam && !EXAM_GUIDES[selectedExam] ? (
            <div className="flex items-center gap-3 p-5 bg-amber-50 border border-amber-100 rounded-2xl">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="font-bold text-amber-900 text-sm">No hardcoded guide for "{selectedExam}" yet.</p>
                <p className="text-xs text-amber-700 mt-0.5">Click <strong>AI Tips</strong> above to generate a complete guide instantly.</p>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-zinc-400">
              <Brain className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-bold">Select an exam above to see the preparation guide.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

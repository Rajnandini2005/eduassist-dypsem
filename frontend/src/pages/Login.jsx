import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock, Mail, Eye, EyeOff, ArrowRight,
  GraduationCap, UserCheck, ShieldCheck, AlertCircle, CheckCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Password strength checker
function getPasswordStrength(password) {
  let score = 0;
  if (!password) return { score: 0, label: '', color: '' };
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 2) return { score, label: 'Weak', color: 'bg-red-400' };
  if (score === 3) return { score, label: 'Fair', color: 'bg-yellow-400' };
  if (score === 4) return { score, label: 'Good', color: 'bg-blue-400' };
  return { score, label: 'Strong', color: 'bg-green-500' };
}

function validatePassword(password) {
  const errors = [];
  if (!password || password.length < 6) errors.push('At least 6 characters');
  return errors;
}

const FACULTY_DEPARTMENTS = [
  { id: 'dept-placement-001', code: 'PLACE', name: 'Placement Department (Placement Dept)' },
  { id: 'dept-scholarship-001', code: 'SCHOL', name: 'Scholarship Department (Scholarship Dept)' },
  { id: 'dept-academic-001', code: 'ACAD', name: 'Academic Department (Academic Dept)' },
  { id: 'dept-fee-001', code: 'FEE', name: 'Fee Department (Accounts & Fee Dept)' },
  { id: 'dept-library-001', code: 'LIB', name: 'Library Department (Library Dept)' },
  { id: '11111111-1111-1111-1111-111111111111', code: 'CSE', name: 'Computer Science & Engineering (CSE Dept)' },
  { id: '22222222-2222-2222-2222-222222222222', code: 'AIML', name: 'Artificial Intelligence & Machine Learning' },
  { id: '33333333-3333-3333-3333-333333333333', code: 'DS', name: 'Data Science' },
  { id: '44444444-4444-4444-4444-444444444444', code: 'BCA', name: 'Bachelor of Computer Applications' },
  { id: '55555555-5555-5555-5555-555555555555', code: 'MCA', name: 'Master of Computer Applications' },
  { id: '77777777-7777-7777-7777-777777777777', code: 'EXAM', name: 'Examination Cell (Exam Dept)' },
];

export default function Login() {
  const { login, register, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [signupRole, setSignupRole] = useState('student'); // student | faculty
  const [course, setCourse] = useState('B.Tech CSE');
  const [yearClass, setYearClass] = useState('F.Y. (1st Year)');
  const [rollNo, setRollNo] = useState('');
  const [facultyDeptId, setFacultyDeptId] = useState('dept-academic-001');
  const [facultyDesignation, setFacultyDesignation] = useState('Assistant Professor');
  const [facultyEmpId, setFacultyEmpId] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const passwordStrength = getPasswordStrength(password);
  const passwordErrors = mode === 'signup' ? validatePassword(password) : [];

  // ── LOGIN ────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate('/');
    } catch (err) {
      const msg = err.message || '';
      if (msg === 'BACKEND_UNAVAILABLE' || msg === 'BACKEND_SLOW') {
        setError('Server is starting up. Please try again in 30 seconds.');
      } else {
        setError('Email or password is wrong. Please check and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── SIGNUP — ALWAYS SUCCEEDS (local-first) ───────────────────────
  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Client-side validation only
    if (!fullName.trim()) { setError('Please enter your full name.'); return; }
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    const pwdErrors = validatePassword(password);
    if (pwdErrors.length > 0) {
      setError('Password needs: ' + pwdErrors.join(', '));
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      const isFemale = /sakshi|smita|vaishnavi|madhura|rajnandini|priya|pooja|snehal|patil|belwalkar|fatale|khot/i.test(fullName + ' ' + email);
      
      const selectedFacultyDept = FACULTY_DEPARTMENTS.find(d => d.id === facultyDeptId) || FACULTY_DEPARTMENTS[2];
      const deptName = signupRole === 'faculty'
        ? selectedFacultyDept.name
        : (course.includes('BCA') ? 'Bachelor of Computer Applications' : course.includes('MCA') ? 'Master of Computer Applications' : course.includes('AIML') ? 'Artificial Intelligence & Machine Learning' : course.includes('DS') ? 'Data Science' : 'Computer Science & Engineering');
      const deptId = signupRole === 'faculty' ? selectedFacultyDept.id : undefined;

      // register() ALWAYS succeeds locally — backend is optional
      await register({
        email: email.trim(),
        password,
        full_name: fullName.trim(),
        role: signupRole,
        gender: isFemale ? 'female' : 'male',
        avatar: isFemale ? '/avatar-girl.jpg' : '/avatar-boy.jpg',
        course: signupRole === 'student' ? course : (facultyDesignation || 'Faculty'),
        year_class: signupRole === 'student' ? yearClass : 'Staff',
        roll_no: signupRole === 'student' ? (rollNo.trim() || '2026-REG') : (facultyEmpId.trim() || 'EMP-' + Math.floor(100 + Math.random() * 900)),
        department: deptName,
        department_id: deptId,
      });
      // Success — go to dashboard
      navigate('/');
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('already registered') || msg.includes('already exists')) {
        setError('This email is already registered. Please sign in.');
      } else {
        // Should never reach here — but if it does, navigate anyway
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── QUICK ACCESS ─────────────────────────────────────────────────
  const handleDemoRole = async (roleId) => {
    setError('');
    setSuccess('');
    setSelectedRole(roleId);
    setLoading(true);
    try {
      await switchDemoRole(roleId);
      navigate('/');
    } catch {
      // switchDemoRole has its own fallback — should never fail
      navigate('/');
    } finally {
      setLoading(false);
      setSelectedRole(null);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccess('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setSignupRole('student');
  };

  const demoRoles = [
    {
      id: 'student',
      label: 'Student Account',
      sublabel: 'Student Portal',
      icon: <GraduationCap className="w-5 h-5" />,
      iconBg: 'bg-blue-100 text-blue-700',
      btnClass: 'bg-[#0f2d52] hover:bg-blue-900 text-white',
    },
    {
      id: 'faculty',
      label: 'Faculty Staff',
      sublabel: 'Faculty Portal',
      icon: <UserCheck className="w-5 h-5" />,
      iconBg: 'bg-amber-100 text-amber-700',
      btnClass: 'bg-amber-500 hover:bg-amber-600 text-white',
    },
    {
      id: 'admin',
      label: 'Administrator',
      sublabel: 'Admin Portal',
      icon: <ShieldCheck className="w-5 h-5" />,
      iconBg: 'bg-rose-100 text-rose-700',
      btnClass: 'bg-rose-600 hover:bg-rose-700 text-white',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0f2d52] flex flex-col">

      {/* Top Header */}
      <div className="relative bg-[#0f2d52] px-6 pt-10 pb-16 text-center overflow-hidden">
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute -top-8 -left-12 w-36 h-36 rounded-full bg-white/5" />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="w-40 h-24 flex items-center justify-center">
            <img
              src="/eduassist-logo-new.jpg"
              alt="EduAssist"
              className="max-h-24 max-w-full object-contain drop-shadow-lg rounded-xl"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
          <div className="mt-1 flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full">
            <img src="/dypsem-logo.jpg" alt="" className="w-5 h-5 object-contain rounded"
              style={{ filter: 'brightness(2)' }}
              onError={(e) => { e.target.style.display = 'none'; }} />
            <span className="text-white font-bold text-xs tracking-wide">DYPSEM · Kolhapur</span>
          </div>
          <div className="mt-1">
            <p className="text-white/90 text-base font-semibold">
              {mode === 'signup' ? '📝 Create Your Account' : '👋 Welcome Back!'}
            </p>
            <p className="text-blue-200 text-xs mt-0.5">
              {mode === 'signup' ? 'Select your role and register' : 'Sign in to continue'}
            </p>
          </div>
        </div>
      </div>

      {/* White card */}
      <div className="flex-1 bg-slate-50 rounded-t-3xl -mt-6 px-5 pt-6 pb-28 overflow-y-auto">

        {/* College strip */}
        <div className="flex items-center gap-3 mb-5 p-3.5 rounded-2xl bg-blue-50 border border-blue-100">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center flex-shrink-0 overflow-hidden shadow border border-blue-100">
            <img src="/dypsem-logo.jpg" alt="DYPSEM" className="w-full h-full object-contain p-0.5"
              onError={(e) => { e.target.style.display = 'none'; }} />
          </div>
          <div>
            <p className="text-[11px] font-black text-[#0f2d52] leading-tight">
              D. Y. Patil School of Engineering & Management
            </p>
            <p className="text-[9px] text-slate-500 mt-0.5">
              D. Y. Patil Education Society (Deemed to be University) · Kolhapur
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mb-4 flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700">
            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* ── LOGIN FORM ── */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 mb-5">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@dypsem.edu.in"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0f2d52] focus:ring-2 focus:ring-blue-100 shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0f2d52] focus:ring-2 focus:ring-blue-100 shadow-sm"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-4 rounded-xl bg-[#0f2d52] hover:bg-blue-900 text-white text-sm font-black shadow-lg shadow-blue-900/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Signing In...</span></>
              ) : (
                <><span>Login</span><ArrowRight className="w-4 h-4" /></>
              )}
            </button>

            <p className="text-center text-xs text-slate-500">
              New user?{' '}
              <button type="button" onClick={() => switchMode('signup')}
                className="text-[#0f2d52] font-bold hover:underline">
                Create Account
              </button>
            </p>
          </form>
        )}

        {/* ── SIGNUP FORM ── */}
        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-4 mb-5">

            {/* ROLE SELECTOR — big prominent buttons at top */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2">
                Select Your Role <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSignupRole('student')}
                  className={`flex flex-col items-center gap-1.5 py-4 rounded-2xl border-2 text-sm font-bold transition-all ${
                    signupRole === 'student'
                      ? 'bg-[#0f2d52] border-[#0f2d52] text-white shadow-lg scale-105'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300'
                  }`}
                >
                  <span className="text-2xl">🎓</span>
                  <span>Student</span>
                  <span className="text-[9px] opacity-70 font-normal">B.Tech / M.Tech / BCA / MCA</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSignupRole('faculty')}
                  className={`flex flex-col items-center gap-1.5 py-4 rounded-2xl border-2 text-sm font-bold transition-all ${
                    signupRole === 'faculty'
                      ? 'bg-amber-500 border-amber-500 text-white shadow-lg scale-105'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-amber-300'
                  }`}
                >
                  <span className="text-2xl">🏫</span>
                  <span>Faculty</span>
                  <span className="text-[9px] opacity-70 font-normal">Professor / HOD / Staff</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5 text-center">
                Selected: <span className="font-bold text-slate-600">{signupRole === 'student' ? '🎓 Student' : '🏫 Faculty'}</span>
              </p>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your Full Name"
                autoComplete="name"
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0f2d52] focus:ring-2 focus:ring-blue-100 shadow-sm"
              />
            </div>

            {/* PROGRAMME & CLASS / YEAR SELECTOR (Only for Students) */}
            {signupRole === 'student' && (
              <div className="space-y-3 p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Degree Programme / Course <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0f2d52] shadow-sm"
                  >
                    <option value="B.Tech CSE">B.Tech Computer Science & Engg. (CSE)</option>
                    <option value="B.Tech AIML">B.Tech Artificial Intelligence & ML (AIML)</option>
                    <option value="B.Tech DS">B.Tech Data Science (DS)</option>
                    <option value="BCA">BCA — Bachelor of Computer Applications</option>
                    <option value="MCA">MCA — Master of Computer Applications</option>
                    <option value="M.Tech CSE">M.Tech Computer Science & Engg.</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Academic Year / Class <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={yearClass}
                      onChange={(e) => setYearClass(e.target.value)}
                      className="w-full px-3 py-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0f2d52] shadow-sm"
                    >
                      <option value="F.Y. (1st Year)">F.Y. (1st Year)</option>
                      <option value="S.Y. (2nd Year)">S.Y. (2nd Year)</option>
                      <option value="T.Y. (3rd Year)">T.Y. (3rd Year)</option>
                      <option value="Final Year (4th Year)">Final Year (4th Year)</option>
                      <option value="BCA 1st Year">BCA 1st Year</option>
                      <option value="BCA 2nd Year">BCA 2nd Year</option>
                      <option value="BCA 3rd Year">BCA 3rd Year</option>
                      <option value="MCA 1st Year">MCA 1st Year</option>
                      <option value="MCA 2nd Year">MCA 2nd Year</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Roll No / PRN
                    </label>
                    <input
                      type="text"
                      value={rollNo}
                      onChange={(e) => setRollNo(e.target.value)}
                      placeholder="e.g. 24BCA102"
                      className="w-full px-3 py-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0f2d52] shadow-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* FACULTY DEPARTMENT & DESIGNATION SELECTOR (Only for Faculty) */}
            {signupRole === 'faculty' && (
              <div className="space-y-3 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-sm">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                    <span>🏢</span>
                    <span>Choose Faculty Department <span className="text-red-500">*</span></span>
                  </label>
                  <select
                    value={facultyDeptId}
                    onChange={(e) => setFacultyDeptId(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl border border-amber-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 shadow-sm"
                  >
                    {FACULTY_DEPARTMENTS.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-amber-800 font-medium mt-1">
                    ℹ️ You will be assigned to handle tickets submitted to this department.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Designation
                    </label>
                    <select
                      value={facultyDesignation}
                      onChange={(e) => setFacultyDesignation(e.target.value)}
                      className="w-full px-3 py-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-amber-500 shadow-sm"
                    >
                      <option value="Professor">Professor</option>
                      <option value="Associate Professor">Associate Professor</option>
                      <option value="Assistant Professor">Assistant Professor</option>
                      <option value="HOD / Dept Head">HOD / Dept Head</option>
                      <option value="Department Coordinator">Department Coordinator</option>
                      <option value="Administrative Staff">Administrative Staff</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Staff / Emp ID
                    </label>
                    <input
                      type="text"
                      value={facultyEmpId}
                      onChange={(e) => setFacultyEmpId(e.target.value)}
                      placeholder="e.g. EMP-104"
                      className="w-full px-3 py-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@dypsem.edu.in"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0f2d52] focus:ring-2 focus:ring-blue-100 shadow-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                Password
                <span className="ml-2 text-[9px] font-normal text-slate-400">
                  (minimum 6 characters)
                </span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="e.g. EduAssist@2025"
                  autoComplete="new-password"
                  className="w-full pl-10 pr-11 py-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0f2d52] focus:ring-2 focus:ring-blue-100 shadow-sm"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= passwordStrength.score ? passwordStrength.color : 'bg-slate-200'}`} />
                    ))}
                  </div>
                  <p className={`text-[10px] font-bold ${passwordStrength.score <= 2 ? 'text-red-500' : passwordStrength.score === 3 ? 'text-yellow-500' : passwordStrength.score === 4 ? 'text-blue-500' : 'text-green-500'}`}>
                    {passwordStrength.label} Password
                  </p>
                  {passwordErrors.length === 0 && (
                    <p className="flex items-center gap-1 text-[10px] text-green-500 mt-1">
                      <CheckCircle className="w-3 h-3" /> Password meets all requirements ✓
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  className={`w-full pl-10 pr-11 py-3.5 rounded-xl border bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 shadow-sm ${confirmPassword && password !== confirmPassword ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-[#0f2d52] focus:ring-blue-100'}`}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && password === confirmPassword && (
                <p className="mt-1.5 text-xs text-green-600 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Passwords match ✓
                </p>
              )}
              {confirmPassword && password !== confirmPassword && (
                <div className="mt-1.5 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
                  <span>Passwords do not match! Please make sure both passwords are identical.</span>
                </div>
              )}
            </div>

            {/* Error right above Submit button for mobile visibility */}
            {error && (
              <div className="p-3 bg-red-50 border-2 border-red-200 rounded-xl text-xs text-red-700 font-bold flex items-start gap-2 shadow-sm animate-shake">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading}
              className={`w-full py-4 rounded-xl text-white text-sm font-black shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 ${
                signupRole === 'faculty'
                  ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/25'
                  : 'bg-[#0f2d52] hover:bg-blue-900 shadow-blue-900/25'
              }`}>
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Creating Account...</span></>
              ) : (
                <><span>Create {signupRole === 'faculty' ? '🏫 Faculty' : '🎓 Student'} Account</span><ArrowRight className="w-4 h-4" /></>
              )}
            </button>

            <p className="text-center text-xs text-slate-500">
              Already have an account?{' '}
              <button type="button" onClick={() => switchMode('login')}
                className="text-[#0f2d52] font-bold hover:underline">
                Sign In
              </button>
            </p>
          </form>
        )}

        {/* OR divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400 font-semibold">QUICK ACCESS (DEMO ONLY)</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>
        <p className="text-[10px] text-slate-400 text-center mb-3">
          ⚠️ Demo mode — uses sample accounts. Create your own account above for real data.
        </p>

        {/* Quick Access Demo Buttons */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {demoRoles.map((role) => (
            <button
              key={role.id}
              onClick={() => handleDemoRole(role.id)}
              disabled={loading}
              className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-xs font-bold shadow transition-all disabled:opacity-60 ${role.btnClass}`}
            >
              {loading && selectedRole === role.id ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${role.iconBg}`}>
                  {role.icon}
                </div>
              )}
              <span>{role.label}</span>
              <span className="text-[8px] opacity-70 font-normal">{role.sublabel}</span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-slate-400">
          AI-Powered Helpdesk · DYPSEM · Kolhapur
        </p>
      </div>
    </div>
  );
}

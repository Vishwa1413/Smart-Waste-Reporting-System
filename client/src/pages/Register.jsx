import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-hot-toast';
import { UserPlus, Mail, Lock, User, Shield, Eye, EyeOff, Sparkles, CheckCircle2, ShieldCheck, ChevronRight, Key, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeSelector from '../components/ThemeSelector';

import { getApiUrl } from '../config';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    adminSecret: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { login } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  // Password strength logic
  const calculatePasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 25, label: 'Weak', color: 'bg-red-500', text: 'text-red-500' };
    if (score === 2) return { score: 50, label: 'Fair', color: 'bg-amber-500', text: 'text-amber-500' };
    if (score === 3) return { score: 75, label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-500' };
    return { score: 100, label: 'Ultra Secure 🛡️', color: 'bg-cyan-500', text: 'text-cyan-500' };
  };

  const passStrength = calculatePasswordStrength(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (formData.role === 'admin' && !formData.adminSecret.trim()) {
      toast.error('🔑 Admin Security Key is required to create an Admin account!');
      return;
    }

    setLoading(true);
    try {
      const baseUrl = getApiUrl();
      const response = await axios.post(`${baseUrl}/api/auth/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        adminSecret: formData.adminSecret
      });
      login(response.data.user, response.data.token);
      toast.success('Account created successfully! 🎉');
      navigate(response.data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed';
      setErrorMessage(msg);
      setShowErrorModal(true);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className={`min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-gradient-to-br ${theme.bgGradient} relative overflow-hidden transition-colors duration-500`}
    >
      {/* Mouse Spotlight Glow */}
      <div 
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 opacity-60 z-0"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(16, 185, 129, 0.12), transparent 40%)`
        }}
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl z-10 my-6"
      >
        <div className="grid md:grid-cols-5 gap-8 items-stretch">
          {/* Left - Benefits (2 Cols) */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden md:flex md:col-span-2 flex-col justify-between space-y-6"
          >
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 backdrop-blur shadow-sm border border-slate-200 text-xs font-bold text-slate-700">
                <Sparkles size={14} className={theme.accentText} /> Join Community
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 leading-tight">
                Be Part of the <span className={`bg-gradient-to-r ${theme.primaryGradient} bg-clip-text text-transparent`}>Clean City</span> Movement
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Create an account to report waste issues, track resolution live, and earn eco certificates.
              </p>
            </div>
            
            <div className="space-y-3">
              {[
                { icon: '📸', title: 'AI Waste Analysis', desc: 'Auto-fill hazard & category reports' },
                { icon: '🗺️', title: 'Map Geolocation', desc: 'Pinpoint precise location markers' },
                { icon: '🎯', title: 'Live Resolution Tracker', desc: 'Track municipal team status' },
                { icon: '🏆', title: 'Earn Eco-Points', desc: 'Collect rewards for active reports' }
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ scale: 1.03, x: 6 }}
                  className={`flex gap-3 p-3.5 rounded-2xl bg-white/70 backdrop-blur border border-slate-200/80 shadow-sm ${theme.cardHoverBorder} ${theme.cardHoverBg} transition-all duration-300 cursor-pointer group`}
                >
                  <span className="text-2xl group-hover:scale-125 transition-transform duration-300">{item.icon}</span>
                  <div>
                    <h3 className={`font-bold text-xs text-slate-900 group-hover:${theme.accentText} transition-colors`}>{item.title}</h3>
                    <p className="text-[11px] text-slate-500">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <ThemeSelector compact={false} />
          </motion.div>

          {/* Right - Form (3 Cols) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`md:col-span-3 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-slate-200/80 relative overflow-hidden group ${theme.cardHoverBorder} transition-all duration-500`}
          >
            {/* Top Gradient Bar */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${theme.primaryGradient}`} />

            <div className="flex items-center gap-3 mb-6">
              <motion.div 
                whileHover={{ scale: 1.15, rotate: 5 }}
                className={`w-12 h-12 ${theme.buttonClass} rounded-2xl flex items-center justify-center text-white shadow-lg`}
              >
                <UserPlus size={24} />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
                <p className="text-xs text-slate-500">Sign up to start reporting waste issues</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name</label>
                <div className="relative group">
                  <User className={`absolute left-4 top-3 text-slate-400 group-focus-within:${theme.accentText} transition-colors`} size={18} />
                  <input 
                    type="text" 
                    placeholder="John Doe"
                    className={`w-full pl-11 pr-4 py-2.5 text-sm border-2 border-slate-200 rounded-xl outline-none ${theme.ringColor} transition-all bg-slate-50/50 hover:bg-white`}
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
                <div className="relative group">
                  <Mail className={`absolute left-4 top-3 text-slate-400 group-focus-within:${theme.accentText} transition-colors`} size={18} />
                  <input 
                    type="email" 
                    placeholder="your@email.com"
                    className={`w-full pl-11 pr-4 py-2.5 text-sm border-2 border-slate-200 rounded-xl outline-none ${theme.ringColor} transition-all bg-slate-50/50 hover:bg-white`}
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
                <div className="relative group">
                  <Lock className={`absolute left-4 top-3 text-slate-400 group-focus-within:${theme.accentText} transition-colors`} size={18} />
                  <input 
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`w-full pl-11 pr-11 py-2.5 text-sm border-2 border-slate-200 rounded-xl outline-none ${theme.ringColor} transition-all bg-slate-50/50 hover:bg-white`}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-4 top-3 text-slate-400 hover:${theme.accentText} transition-colors`}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {formData.password && (
                  <div className="pt-1.5 space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-slate-400 uppercase">Security Level</span>
                      <span className={passStrength.text}>{passStrength.label}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${passStrength.score}%` }}
                        className={`h-full ${passStrength.color} transition-all duration-300`}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Confirm Password</label>
                <div className="relative group">
                  <Lock className={`absolute left-4 top-3 text-slate-400 group-focus-within:${theme.accentText} transition-colors`} size={18} />
                  <input 
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`w-full pl-11 pr-11 py-2.5 text-sm border-2 border-slate-200 rounded-xl outline-none ${theme.ringColor} transition-all bg-slate-50/50 hover:bg-white`}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`absolute right-4 top-3 text-slate-400 hover:${theme.accentText} transition-colors`}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Account Type Selector with Mouse Hover Shift */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Account Role</label>
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => setFormData({...formData, role: 'user', adminSecret: ''})}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 font-bold text-xs transition-all ${
                      formData.role === 'user' 
                        ? `${theme.cardHoverBorder} ${theme.accentBgLight} ${theme.accentTextDark} shadow-md` 
                        : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <User size={16} /> User Account
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => setFormData({...formData, role: 'admin'})}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 font-bold text-xs transition-all ${
                      formData.role === 'admin' 
                        ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-md' 
                        : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <Shield size={16} /> Admin Official
                  </motion.button>
                </div>
              </div>

              {/* Admin Security Key Field (Shown only when Admin role is selected) */}
              {formData.role === 'admin' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1.5 pt-1 bg-purple-50/70 p-3.5 rounded-2xl border border-purple-200"
                >
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Key size={14} className="text-purple-600" /> Admin Security Key
                    </label>
                    <span className="text-[10px] bg-purple-200 text-purple-800 font-extrabold px-2 py-0.5 rounded-full">
                      Passcode Required
                    </span>
                  </div>
                  <div className="relative group">
                    <Key className="absolute left-4 top-3 text-purple-400 group-focus-within:text-purple-600 transition-colors" size={18} />
                    <input 
                      type="password" 
                      placeholder="Enter official Admin Passcode"
                      className="w-full pl-11 pr-4 py-2.5 text-sm border-2 border-purple-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-400 transition-all bg-white font-mono"
                      value={formData.adminSecret}
                      onChange={(e) => setFormData({...formData, adminSecret: e.target.value})}
                      required={formData.role === 'admin'}
                    />
                  </div>
                  <p className="text-[11px] text-purple-700 font-medium">
                    🛡️ Official municipal verification passcode is required to create Admin privileges.
                  </p>
                </motion.div>
              )}

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                className={`w-full mt-4 py-3.5 ${theme.buttonClass} text-white rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2`}
                disabled={loading}
              >
                {loading ? 'Creating Account...' : (
                  <>
                    <UserPlus size={18} /> Register Account
                  </>
                )}
              </motion.button>
            </form>

            <p className="text-center mt-5 text-xs text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className={`font-bold ${theme.accentText} hover:underline inline-flex items-center gap-0.5`}>
                Sign In <ChevronRight size={14} />
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Centered Registration Error Popup Modal */}
      <AnimatePresence>
        {showErrorModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setShowErrorModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/95 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl max-w-md w-full border border-red-200 text-center relative overflow-hidden"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowErrorModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>

              {/* Warning Icon Badge */}
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner border border-red-200">
                <AlertCircle size={32} />
              </div>

              <h3 className="text-xl font-extrabold text-slate-900 mb-1">
                {errorMessage.toLowerCase().includes('already exists') ? 'Account Already Exists ⚠️' : 'Registration Error ⚠️'}
              </h3>
              <p className="text-xs text-slate-600 mb-6 leading-relaxed px-2 font-medium">
                {errorMessage.toLowerCase().includes('already exists')
                  ? 'An account with this email address is already registered in the system. Please sign in directly or use a different email.'
                  : errorMessage}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setShowErrorModal(false)}
                  className="py-3 px-4 rounded-xl border-2 border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700 font-bold text-xs transition-all"
                >
                  Try Again
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className={`py-3 px-4 rounded-xl ${theme.buttonClass} text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-1`}
                >
                  Sign In <ChevronRight size={14} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Register;

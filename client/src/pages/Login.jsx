import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-hot-toast';
import { LogIn, Mail, Lock, Eye, EyeOff, Sparkles, Shield, User, Zap, ChevronRight, CheckCircle, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeSelector from '../components/ThemeSelector';

import { getApiUrl } from '../config';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

            <form onSubmit={handleSubmit} className="space-y-4 font-sans">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
                <div className="relative group">
                  <Mail className={`absolute left-4 top-3.5 text-slate-400 group-focus-within:${theme.accentText} transition-colors`} size={18} />
                  <input 
                    type="email" 
                    placeholder="your@email.com"
                    className={`w-full pl-11 pr-4 py-3 text-sm border-2 border-slate-200 rounded-xl outline-none ${theme.ringColor} transition-all duration-300 bg-slate-50/50 hover:bg-white`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
                <div className="relative group">
                  <Lock className={`absolute left-4 top-3.5 text-slate-400 group-focus-within:${theme.accentText} transition-colors`} size={18} />
                  <input 
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`w-full pl-11 pr-11 py-3 text-sm border-2 border-slate-200 rounded-xl outline-none ${theme.ringColor} transition-all duration-300 bg-slate-50/50 hover:bg-white`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-4 top-3.5 text-slate-400 hover:${theme.accentText} transition-colors`}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                className={`w-full mt-4 py-3.5 ${theme.buttonClass} text-white rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 group`}
                disabled={loading}
              >
                {loading ? 'Signing in...' : (
                  <>
                    <LogIn size={18} className="group-hover:translate-x-1 transition-transform" />
                    Sign In to Account
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-200/80 text-center">
              <p className="text-xs text-slate-600">
                Don't have an account?{' '}
                <Link to="/register" className={`font-bold ${theme.accentText} hover:underline inline-flex items-center gap-0.5`}>
                  Create one <ChevronRight size={14} />
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Centered Invalid Credentials Popup Modal */}
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

              <h3 className="text-xl font-extrabold text-slate-900 mb-1">Invalid Credentials ⚠️</h3>
              <p className="text-xs text-slate-600 mb-6 leading-relaxed px-2 font-medium">
                {errorMessage}
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
                  onClick={() => navigate('/register')}
                  className={`py-3 px-4 rounded-xl ${theme.buttonClass} text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-1`}
                >
                  Create Account <ChevronRight size={14} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, Trash2, User as UserIcon, Menu, X, Shield, Sparkles, Cpu } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import ThemeSelector from './ThemeSelector';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const getHomePath = () => {
    if (!user) return '/login';
    return user.role === 'admin' ? '/admin' : '/dashboard';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className={`sticky top-0 z-50 bg-gradient-to-r ${theme.primaryGradient} text-white shadow-xl transition-colors duration-500`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={getHomePath()} className="flex items-center gap-3 group">
            <motion.div 
              whileHover={{ rotate: 180, scale: 1.1 }}
              transition={{ duration: 0.4 }}
              className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md"
            >
              <Trash2 size={24} className={theme.accentText} />
            </motion.div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight flex items-center gap-1.5">
                SmartWaste <Sparkles size={14} className="text-amber-300 animate-pulse" />
              </span>
              <span className="text-[10px] text-emerald-100 font-mono tracking-widest uppercase">AI Eco Platform</span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            {/* Live Theme Switcher Pill */}
            <ThemeSelector compact={true} />

            {user && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2.5 px-3.5 py-1.5 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur transition-all border border-white/30"
              >
                <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-inner">
                  {user.role === 'admin' ? (
                    <Shield size={16} className={theme.accentText} />
                  ) : (
                    <UserIcon size={16} className={theme.accentText} />
                  )}
                </div>
                <span className="font-bold text-xs">{user.name}</span>
                {user.role === 'admin' && (
                  <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-extrabold uppercase">ADMIN</span>
                )}
              </motion.div>
            )}
            
            {user ? (
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleLogout}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors text-white"
                title="Logout"
              >
                <LogOut size={20} />
              </motion.button>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all text-xs font-bold backdrop-blur border border-white/30">
                  Sign In
                </Link>
                <Link to="/register" className="px-4 py-2 rounded-xl bg-white text-slate-900 hover:bg-slate-100 transition-all text-xs font-extrabold shadow-md">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeSelector compact={true} />
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden pb-4 border-t border-white/20 pt-3 space-y-2"
          >
            {user && (
              <div className="px-4 py-3 flex items-center justify-between bg-white/10 rounded-xl">
                <div className="flex items-center gap-2">
                  <UserIcon size={18} />
                  <span className="font-bold text-sm">{user.name}</span>
                </div>
                {user.role === 'admin' && (
                  <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">ADMIN</span>
                )}
              </div>
            )}
            {user ? (
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 hover:bg-white/20 rounded-xl transition-colors flex items-center gap-2 text-sm font-bold"
              >
                <LogOut size={18} /> Logout
              </button>
            ) : (
              <div className="space-y-2">
                <Link to="/login" className="block px-4 py-2.5 text-center hover:bg-white/20 rounded-xl font-bold text-xs">Sign In</Link>
                <Link to="/register" className="block px-4 py-2.5 text-center bg-white text-slate-900 rounded-xl font-extrabold text-xs">Register</Link>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

import { useTheme, themes } from '../context/ThemeContext';
import { Palette, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const ThemeSelector = ({ compact = false }) => {
  const { currentTheme, setCurrentTheme, theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left z-40">
      {compact ? (
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur text-white text-xs font-semibold shadow-md transition-all border border-white/30 group"
            title="Change Application Theme"
          >
            <Palette size={15} className="animate-spin-slow group-hover:rotate-45 transition-transform" />
            <span className="hidden sm:inline">{theme.name}</span>
            <div 
              className="w-3 h-3 rounded-full border border-white shadow-sm" 
              style={{ backgroundColor: theme.dotColor }}
            />
          </motion.button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-48 rounded-2xl bg-white/95 backdrop-blur-xl shadow-2xl border border-slate-200 p-2 space-y-1 text-slate-800"
              >
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Theme Colors</span>
                  <Sparkles size={12} className="text-amber-500" />
                </div>
                {Object.values(themes).map((t) => (
                  <motion.button
                    key={t.id}
                    whileHover={{ x: 4, scale: 1.02 }}
                    onClick={() => {
                      setCurrentTheme(t.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      currentTheme === t.id 
                        ? 'bg-slate-100 font-bold border border-slate-300 shadow-sm' 
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-3.5 h-3.5 rounded-full shadow-inner border border-white"
                        style={{ backgroundColor: t.dotColor }}
                      />
                      <span>{t.name}</span>
                    </div>
                    {currentTheme === t.id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    )}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-md p-3 rounded-2xl border border-slate-200/80 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Palette size={14} className={theme.accentText} />
              Theme Accent
            </span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
              Mouse Hover Enabled
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {Object.values(themes).map((t) => {
              const isSelected = currentTheme === t.id;
              return (
                <motion.button
                  key={t.id}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentTheme(t.id)}
                  className={`relative flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all group ${
                    isSelected 
                      ? 'border-slate-800 bg-white shadow-md' 
                      : 'border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300'
                  }`}
                  title={`Switch to ${t.name} theme`}
                >
                  <div 
                    className="w-6 h-6 rounded-full shadow-md group-hover:shadow-lg transition-shadow border border-white"
                    style={{ backgroundColor: t.dotColor }}
                  />
                  <span className="text-[10px] font-semibold mt-1 text-slate-700 truncate w-full text-center">
                    {t.name.split(' ')[0]}
                  </span>
                  {isSelected && (
                    <motion.div 
                      layoutId="activeDot"
                      className="absolute -top-1 -right-1 w-3 h-3 bg-slate-900 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white font-bold"
                    >
                      ✓
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;

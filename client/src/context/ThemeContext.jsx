import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const themes = {
  emerald: {
    name: 'Emerald Bio',
    id: 'emerald',
    primaryGradient: 'from-emerald-600 to-teal-600',
    primaryHoverGradient: 'from-emerald-500 to-teal-500',
    bgGradient: 'from-slate-50 via-emerald-50 to-teal-50',
    cardHoverBorder: 'hover:border-emerald-400',
    cardHoverBg: 'hover:bg-emerald-50/50',
    cardHoverShadow: 'hover:shadow-emerald-500/20',
    accentText: 'text-emerald-600',
    accentBg: 'bg-emerald-500',
    accentBgLight: 'bg-emerald-100',
    accentTextDark: 'text-emerald-700',
    ringColor: 'focus:ring-emerald-400 focus:border-emerald-500',
    buttonClass: 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/25 hover:shadow-emerald-500/40',
    dotColor: '#10b981',
    badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-300'
  },
  ocean: {
    name: 'Ocean Cyber',
    id: 'ocean',
    primaryGradient: 'from-blue-600 to-cyan-600',
    primaryHoverGradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-slate-50 via-blue-50 to-cyan-50',
    cardHoverBorder: 'hover:border-blue-400',
    cardHoverBg: 'hover:bg-blue-50/50',
    cardHoverShadow: 'hover:shadow-blue-500/20',
    accentText: 'text-blue-600',
    accentBg: 'bg-blue-500',
    accentBgLight: 'bg-blue-100',
    accentTextDark: 'text-blue-700',
    ringColor: 'focus:ring-blue-400 focus:border-blue-500',
    buttonClass: 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 shadow-blue-500/25 hover:shadow-blue-500/40',
    dotColor: '#3b82f6',
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-300'
  },
  violet: {
    name: 'Neon Violet',
    id: 'violet',
    primaryGradient: 'from-violet-600 to-indigo-600',
    primaryHoverGradient: 'from-violet-500 to-indigo-500',
    bgGradient: 'from-slate-50 via-violet-50 to-indigo-50',
    cardHoverBorder: 'hover:border-violet-400',
    cardHoverBg: 'hover:bg-violet-50/50',
    cardHoverShadow: 'hover:shadow-violet-500/20',
    accentText: 'text-violet-600',
    accentBg: 'bg-violet-500',
    accentBgLight: 'bg-violet-100',
    accentTextDark: 'text-violet-700',
    ringColor: 'focus:ring-violet-400 focus:border-violet-500',
    buttonClass: 'bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 shadow-violet-500/25 hover:shadow-violet-500/40',
    dotColor: '#8b5cf6',
    badgeClass: 'bg-violet-100 text-violet-700 border-violet-300'
  },
  amber: {
    name: 'Solar Amber',
    id: 'amber',
    primaryGradient: 'from-amber-500 to-orange-600',
    primaryHoverGradient: 'from-amber-400 to-orange-500',
    bgGradient: 'from-slate-50 via-amber-50 to-orange-50',
    cardHoverBorder: 'hover:border-amber-400',
    cardHoverBg: 'hover:bg-amber-50/50',
    cardHoverShadow: 'hover:shadow-amber-500/20',
    accentText: 'text-amber-600',
    accentBg: 'bg-amber-500',
    accentBgLight: 'bg-amber-100',
    accentTextDark: 'text-amber-700',
    ringColor: 'focus:ring-amber-400 focus:border-amber-500',
    buttonClass: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-amber-500/25 hover:shadow-amber-500/40',
    dotColor: '#f59e0b',
    badgeClass: 'bg-amber-100 text-amber-700 border-amber-300'
  }
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('smartwaste_theme') || 'emerald';
  });

  useEffect(() => {
    localStorage.setItem('smartwaste_theme', currentTheme);
  }, [currentTheme]);

  const activeTheme = themes[currentTheme] || themes.emerald;

  return (
    <ThemeContext.Provider value={{ currentTheme, setCurrentTheme, theme: activeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { MapPin, CheckCircle, Clock, ExternalLink, Filter, Search, User, BarChart3, AlertCircle, Trash2, Sparkles, Eye, X, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { useTheme } from '../context/ThemeContext';
import { getApiUrl } from '../config';

const getImageUrl = (url) => {
  if (!url || url.startsWith('blob:')) return '';
  if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const baseUrl = getApiUrl();
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [completedHistory, setCompletedHistory] = useState([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, completed: 0 });
  const [lifetimeCompleted, setLifetimeCompleted] = useState(() => {
    return parseInt(localStorage.getItem('admin_lifetime_completed') || '0', 10);
  });
  const [selectedReport, setSelectedReport] = useState(null);
  const { theme } = useTheme();

  useEffect(() => {
    fetchComplaints();
    fetchCompletedHistory();
    const baseUrl = getApiUrl();
    const newSocket = io(baseUrl);

    newSocket.on('newComplaint', (complaint) => {
      setComplaints(prev => [complaint, ...prev]);
      toast.success('New waste report received! 🗑️', { duration: 3 });
    });

    newSocket.on('complaintDeletedAdmin', ({ id }) => {
      setComplaints(prev => prev.filter(c => c.id !== id));
      if (selectedReport?.id === id) {
        setSelectedReport(null);
      }
    });

    newSocket.on('complaintDeletedGlobal', ({ id }) => {
      setComplaints(prev => prev.filter(c => c.id !== id));
      setCompletedHistory(prev => prev.filter(c => c.id !== id));
      if (selectedReport?.id === id) {
        setSelectedReport(null);
      }
    });

    newSocket.on('statusUpdated', (updatedComplaint) => {
      if (updatedComplaint.status === 'Completed') {
        fetchCompletedHistory();
      }
    });

    return () => newSocket.close();
  }, [selectedReport]);

  useEffect(() => {
    const total = complaints.length;
    const pending = complaints.filter(c => c.status === 'Pending').length;
    const inProgress = complaints.filter(c => c.status === 'In Progress').length;
    const completed = complaints.filter(c => c.status === 'Completed').length;
    
    setStats({ total, pending, inProgress, completed });
  }, [complaints]);

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = getApiUrl();
      const response = await axios.get(`${baseUrl}/api/complaints/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComplaints(response.data);
    } catch (error) {
      toast.error('Failed to fetch complaints');
    }
  };

  const fetchCompletedHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = getApiUrl();
      const response = await axios.get(`${baseUrl}/api/complaints/completed-history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCompletedHistory(response.data);
      setLifetimeCompleted(prev => {
        const next = Math.max(prev, response.data.length);
        localStorage.setItem('admin_lifetime_completed', next.toString());
        return next;
      });
    } catch (error) {
      console.log('Failed to fetch completed history');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = getApiUrl();
      await axios.patch(`${baseUrl}/api/complaints/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`✓ Marked as ${status}`);

      if (status === 'Completed') {
        fetchCompletedHistory();
      }

      setComplaints(prev => prev.map(c => c.id === id ? { ...c, status } : c));
      if (selectedReport?.id === id) {
        setSelectedReport(prev => ({ ...prev, status }));
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteComplaint = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      const baseUrl = getApiUrl();
      await axios.delete(`${baseUrl}/api/complaints/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComplaints(prev => prev.filter(c => c.id !== id));
      if (selectedReport?.id === id) {
        setSelectedReport(null);
      }
      toast.success('Report removed from active feed! 🗑️');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete report');
    }
  };

  const handleStatCardClick = (filterType) => {
    setFilter(filterType);
    if (filterType === 'Completed') {
      fetchCompletedHistory();
    }
  };

  // Combine completedHistory and any active completed complaints into a unified list
  const allCompletedItems = Array.from(
    new Map(
      [...completedHistory, ...complaints.filter(c => c.status === 'Completed')].map(item => [item.id, item])
    ).values()
  );

  const sourceList = filter === 'Completed' ? allCompletedItems : complaints;

  const filteredComplaints = sourceList.filter(c => {
    const matchesSearch = c.description.toLowerCase().includes(search.toLowerCase()) || 
                         c.User?.name?.toLowerCase().includes(search.toLowerCase());

    if (filter === 'Completed') {
      return matchesSearch;
    }

    const matchesFilter = filter === 'All' || c.status === filter;
    return matchesFilter && matchesSearch;
  });

  const statusConfig = {
    'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: AlertCircle },
    'In Progress': { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock },
    'Completed': { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle }
  };

  const StatCard = ({ label, value, icon: Icon, color, filterType, badgeText }) => {
    const isActive = filter === filterType;
    return (
      <motion.div 
        whileHover={{ scale: 1.04, y: -4 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => handleStatCardClick(filterType)}
        className={`p-6 rounded-3xl text-white shadow-xl bg-gradient-to-br ${color} relative overflow-hidden cursor-pointer transition-all ${
          isActive ? 'ring-4 ring-emerald-400 ring-offset-2 ring-offset-slate-900 shadow-2xl scale-[1.02]' : 'opacity-90 hover:opacity-100'
        }`}
      >
        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-[11px] font-bold uppercase opacity-90 flex items-center gap-1.5 tracking-wider">
              {label}
              {isActive && (
                <span className="bg-emerald-400 text-slate-950 text-[9px] px-2 py-0.5 rounded-full font-black uppercase shadow-sm">
                  Active Filter
                </span>
              )}
            </p>
            <p className="text-3xl font-black mt-2">{value}</p>
            <p className="text-[10px] text-white/70 mt-1 font-medium">{badgeText || `Click to view (${value})`}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur shadow-inner shrink-0">
            <Icon size={24} />
          </div>
        </div>
      </motion.div>
    );
  };

  const totalCompletedCount = Math.max(lifetimeCompleted, allCompletedItems.length);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-r ${theme.primaryGradient} text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur shadow-inner">
              <Trash2 size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold flex items-center gap-2">
                Admin Dispatch Command <Sparkles size={22} className="text-amber-300" />
              </h1>
              <p className="text-emerald-100 text-sm mt-1">Real-time waste complaint dispatch & resolution tracking</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Interactive Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Feed" value={complaints.length} icon={BarChart3} color="from-slate-700 to-slate-800" filterType="All" badgeText="Current active dispatch feed" />
        <StatCard label="Pending" value={stats.pending} icon={AlertCircle} color="from-amber-500 to-amber-600" filterType="Pending" badgeText="Awaiting action" />
        <StatCard label="In Progress" value={stats.inProgress} icon={Clock} color="from-blue-500 to-blue-600" filterType="In Progress" badgeText="Cleanup in progress" />
        <StatCard label="Completed" value={totalCompletedCount} icon={CheckCircle} color="from-emerald-500 to-emerald-600" filterType="Completed" badgeText="View all completed reports" />
      </div>

      {/* Filters & Search */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-slate-200/80 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Filter size={18} className={theme.accentText} /> 
            {filter === 'Completed' ? 'Completed Reports History' : 'Search & Status Filters'}
          </h2>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            Showing {filteredComplaints.length} reports
          </span>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by description or reporter name..."
              className={`pl-11 w-full py-3 text-sm border-2 border-slate-200 rounded-xl outline-none ${theme.ringColor} transition-all bg-slate-50/50 hover:bg-white`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select 
            className={`py-3 px-4 text-sm font-bold border-2 border-slate-200 rounded-xl outline-none ${theme.ringColor} transition-all bg-slate-50/50 hover:bg-white`}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">Active Feed ({complaints.length})</option>
            <option value="Pending">Pending ({stats.pending})</option>
            <option value="In Progress">In Progress ({stats.inProgress})</option>
            <option value="Completed">Completed ({totalCompletedCount})</option>
          </select>
        </div>
      </motion.div>

      {/* Complaints Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredComplaints.map((complaint) => {
            const status = complaint.status || 'Pending';
            const config = statusConfig[status];
            return (
              <motion.div 
                key={complaint.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -5 }}
                className={`bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg border border-slate-200/80 overflow-hidden ${theme.cardHoverBorder} hover:shadow-2xl transition-all duration-300 group flex flex-col justify-between`}
              >
                <div>
                  {/* Image Header */}
                  <div 
                    onClick={() => setSelectedReport(complaint)}
                    className="relative h-48 overflow-hidden bg-slate-900 cursor-pointer"
                  >
                    {complaint.imageUrl ? (
                      <img 
                        src={getImageUrl(complaint.imageUrl)} 
                        className="w-full h-full object-contain p-1 transition-transform duration-500 group-hover:scale-105"
                        alt="Waste Report"
                        onError={(e) => { console.error('Admin image load error:', complaint.imageUrl); }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500">
                        <Trash2 size={48} className="opacity-30" />
                      </div>
                    )}
                    
                    <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[11px] font-bold uppercase shadow-lg ${config.bg} ${config.text}`}>
                      {status}
                    </div>

                    <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-4 py-2 rounded-xl bg-white/90 backdrop-blur text-slate-900 font-extrabold text-xs flex items-center gap-1.5 shadow-xl">
                        <Eye size={16} /> View Full Report Details
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 space-y-4">
                    <div>
                      <p className="text-slate-800 text-sm font-semibold line-clamp-3 mb-3 leading-relaxed">{complaint.description}</p>
                      <div className="space-y-1.5 text-xs text-slate-500 font-medium">
                        <div className="flex items-center gap-2">
                          <User size={14} className={theme.accentText} />
                          <span>Reporter: {complaint.User?.name || 'Anonymous User'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-blue-500" />
                          <span>Reported: {new Date(complaint.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Location Action */}
                    <div className="bg-slate-50 p-3 rounded-2xl flex items-center justify-between text-xs font-bold text-slate-700 border border-slate-200">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className={theme.accentText} />
                        <span>GPS Geotag</span>
                      </div>
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${complaint.lat},${complaint.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className={`font-bold ${theme.accentText} hover:underline flex items-center gap-1`}
                      >
                        Maps <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Status Action Buttons */}
                <div className="p-5 pt-0 space-y-2">
                  <button
                    type="button"
                    onClick={() => setSelectedReport(complaint)}
                    className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200/80 mb-1"
                  >
                    <Eye size={14} /> Inspect Full Report Details
                  </button>

                  <div className="border-t border-slate-100 pt-2">
                    {status === 'Pending' && (
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => updateStatus(complaint.id, 'In Progress')}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                      >
                        <Clock size={16} /> Start Dispatch Process
                      </motion.button>
                    )}
                    {status === 'In Progress' && (
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => updateStatus(complaint.id, 'Completed')}
                        className={`w-full ${theme.buttonClass} text-white py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5`}
                      >
                        <CheckCircle size={16} /> Mark Cleanup Complete
                      </motion.button>
                    )}
                    {status === 'Completed' && (
                      <div className="flex gap-2">
                        <div className="flex-1 bg-emerald-100 text-emerald-800 py-2.5 rounded-xl font-bold text-xs text-center flex items-center justify-center gap-1.5 shadow-sm font-extrabold">
                          <CheckCircle size={16} /> Resolved & Closed
                        </div>
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => handleDeleteComplaint(complaint.id, e)}
                          className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl transition-colors flex items-center justify-center shadow-sm"
                          title="Remove from Active Feed"
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredComplaints.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 bg-white rounded-3xl border-2 border-dashed border-slate-200">
          <Search size={64} className="mb-4 opacity-20" />
          <p className="text-base font-bold text-slate-700">No matching waste reports found under '{filter}'</p>
          <p className="text-xs text-slate-400 mt-1">Click any Stat Card above or search to view other report status categories</p>
        </div>
      )}

      {/* Full Report Details Modal */}
      <AnimatePresence>
        {selectedReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedReport(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 shadow-2xl max-w-xl w-full border border-slate-200 relative max-h-[90vh] overflow-y-auto flex flex-col space-y-4"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${theme.accentBgLight} ${theme.accentText} flex items-center justify-center`}>
                    <Eye size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      Waste Report Details #{selectedReport.id}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Reporter: <strong className="text-slate-800">{selectedReport.User?.name || 'Anonymous'}</strong> ({selectedReport.User?.email || 'N/A'})
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Waste Image Evidence */}
              {selectedReport.imageUrl && (
                <div className="rounded-2xl overflow-hidden bg-slate-950 h-72 border-2 border-slate-800 shadow-inner shrink-0 relative flex items-center justify-center">
                  <img
                    src={getImageUrl(selectedReport.imageUrl)}
                    alt="Waste Evidence"
                    className="w-full h-full object-contain p-1"
                  />
                  <div className="absolute bottom-3 right-3 px-3 py-1 bg-slate-900/80 backdrop-blur rounded-lg text-[10px] text-white font-mono">
                    Report ID #{selectedReport.id}
                  </div>
                </div>
              )}

              {/* Status Banner */}
              <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-2xl border border-slate-200 shrink-0">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Current Status:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase shadow-sm ${statusConfig[selectedReport.status || 'Pending'].bg} ${statusConfig[selectedReport.status || 'Pending'].text}`}>
                  {selectedReport.status || 'Pending'}
                </span>
              </div>

              {/* Full Description */}
              <div className="space-y-1 shrink-0">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Issue Description</label>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-slate-800 text-xs font-medium leading-relaxed">
                  {selectedReport.description}
                </div>
              </div>

              {/* Location & GPS Geotag */}
              <div className="space-y-1 shrink-0">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">GPS Geotag Location</label>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-700">
                    <MapPin size={16} className={theme.accentText} />
                    <span>{parseFloat(selectedReport.lat).toFixed(4)}, {parseFloat(selectedReport.lng).toFixed(4)}</span>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${selectedReport.lat},${selectedReport.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className={`px-3.5 py-2 rounded-xl ${theme.buttonClass} text-white font-bold text-xs flex items-center gap-1.5 shadow-md`}
                  >
                    Open Google Maps <ExternalLink size={14} />
                  </a>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3 border-t border-slate-100 shrink-0">
                {selectedReport.status !== 'Completed' && (
                  <button
                    type="button"
                    onClick={() => {
                      const nextStatus = selectedReport.status === 'Pending' ? 'In Progress' : 'Completed';
                      updateStatus(selectedReport.id, nextStatus);
                    }}
                    className={`flex-1 py-3 rounded-xl ${theme.buttonClass} text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2`}
                  >
                    Mark as {selectedReport.status === 'Pending' ? 'In Progress' : 'Completed'}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleDeleteComplaint(selectedReport.id)}
                  className="px-4 py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Trash2 size={16} /> Delete Record
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;

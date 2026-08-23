import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Camera, MapPin, Send, Clock, CheckCircle, AlertCircle, Trash2, X, Sparkles, Cpu, Award, Leaf, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MapPicker from '../components/MapPicker';
import AiWasteScanner from '../components/AiWasteScanner';
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

const UserDashboard = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAiScanner, setShowAiScanner] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    fetchComplaints();
    const baseUrl = getApiUrl();
    const newSocket = io(baseUrl);

    newSocket.on('statusUpdated', (updatedComplaint) => {
      setComplaints(prev => prev.map(c => c.id === updatedComplaint.id ? updatedComplaint : c));
      toast.success(`✓ Status updated to ${updatedComplaint.status}!`);
    });

    newSocket.on('complaintDeletedUser', ({ id }) => {
      setComplaints(prev => prev.filter(c => c.id !== id));
    });

    newSocket.on('complaintDeletedGlobal', ({ id }) => {
      setComplaints(prev => prev.filter(c => c.id !== id));
      toast.success('Pending report cancelled');
    });

    return () => newSocket.close();
  }, []);

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = getApiUrl();
      const response = await axios.get(`${baseUrl}/api/complaints/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComplaints(response.data);
    } catch (error) {
      toast.error('Failed to fetch complaints');
    }
  };

  const handleDeleteReport = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      const baseUrl = getApiUrl();
      await axios.delete(`${baseUrl}/api/complaints/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComplaints(prev => prev.filter(c => c.id !== id));
      toast.success('Report deleted successfully 🗑️');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete report');
    }
  };

  const compressImageFile = (file, maxWidth = 1024, maxHeight = 1024, quality = 0.7) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => resolve('');
        img.src = e.target.result;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size should be less than 10MB');
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleApplyAiResult = (result) => {
    setDescription(result.description);
    if (result.imageUrl) {
      setImagePreview(result.imageUrl);
      fetch(result.imageUrl)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'ai-sample.jpg', { type: 'image/jpeg' });
          setImage(file);
        })
        .catch(() => {});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error('Please enter a description for the waste report');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Session expired. Please log out and sign in again.');
      navigate('/login');
      return;
    }

    setLoading(true);
    const lat = position ? position.lat : 11.6643;
    const lng = position ? position.lng : 78.1460;
    const baseUrl = getApiUrl();

    try {
      let base64Image = '';
      if (image) {
        base64Image = await compressImageFile(image);
      } else if (imagePreview && !imagePreview.startsWith('blob:')) {
        base64Image = imagePreview;
      }

      await axios.post(`${baseUrl}/api/complaints`, {
        description,
        image: base64Image,
        lat,
        lng,
        address: 'Selected Location'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      toast.success('✓ Waste report submitted successfully!');
      setDescription('');
      setImage(null);
      setImagePreview(null);
      setPosition(null);
      fetchComplaints();
    } catch (error) {
      console.error('Submit report error:', error);
      const errMsg = error.response?.data?.message || 'Failed to submit report. Please re-login.';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: AlertCircle },
    'In Progress': { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock },
    'Completed': { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle }
  };

  // Stats calculation
  const totalReports = complaints.length;
  const ecoPoints = totalReports * 50 + complaints.filter(c => c.status === 'Completed').length * 50;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8">
      {/* Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-r ${theme.primaryGradient} text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur shadow-inner">
              <Trash2 size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold flex items-center gap-2">
                Waste Reporting Dashboard <Sparkles size={22} className="text-amber-300 animate-bounce" />
              </h1>
              <p className="text-emerald-100 text-sm mt-1">AI-Powered Waste Hazard Detection & Live Dispatch Tracking</p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAiScanner(true)}
            className="px-5 py-3 rounded-2xl bg-white text-slate-900 font-bold text-sm shadow-xl flex items-center gap-2 border border-white/50 hover:bg-slate-50 transition-all self-start md:self-auto"
          >
            <Cpu size={18} className={theme.accentText} /> Open AI Scanner
          </motion.button>
        </div>
      </motion.div>

      {/* Eco Stats Overview Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div 
          whileHover={{ scale: 1.03, y: -4 }}
          className={`p-5 rounded-2xl bg-white/80 backdrop-blur border border-slate-200/80 shadow-md ${theme.cardHoverBorder} transition-all duration-300 cursor-pointer flex items-center justify-between`}
        >
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">My Total Reports</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{totalReports}</h3>
          </div>
          <div className={`w-12 h-12 rounded-2xl ${theme.accentBgLight} ${theme.accentText} flex items-center justify-center`}>
            <Trash2 size={24} />
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.03, y: -4 }}
          className={`p-5 rounded-2xl bg-white/80 backdrop-blur border border-slate-200/80 shadow-md ${theme.cardHoverBorder} transition-all duration-300 cursor-pointer flex items-center justify-between`}
        >
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Eco-Reward Points</p>
            <h3 className="text-3xl font-extrabold text-amber-500 mt-1">{ecoPoints} PTS</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <Award size={24} />
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.03, y: -4 }}
          className={`p-5 rounded-2xl bg-white/80 backdrop-blur border border-slate-200/80 shadow-md ${theme.cardHoverBorder} transition-all duration-300 cursor-pointer flex items-center justify-between`}
        >
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Est. CO₂ Offset</p>
            <h3 className="text-3xl font-extrabold text-emerald-600 mt-1">{(totalReports * 4.2).toFixed(1)} kg</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <Leaf size={24} />
          </div>
        </motion.div>
      </div>

      {/* AI Scanner Modal Popup */}
      <AnimatePresence>
        {showAiScanner && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <AiWasteScanner 
              onApplyScanResult={handleApplyAiResult} 
              onClose={() => setShowAiScanner(false)} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Report Form (2 Cols) */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          <div className={`bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/80 p-8 relative overflow-hidden ${theme.cardHoverBorder} transition-all`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                <div className={`w-10 h-10 ${theme.accentBgLight} ${theme.accentText} rounded-xl flex items-center justify-center`}>
                  <Trash2 size={22} />
                </div>
                Report a Waste Issue
              </h2>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => setShowAiScanner(true)}
                className={`px-4 py-2 rounded-xl ${theme.accentBgLight} ${theme.accentTextDark} font-bold text-xs flex items-center gap-1.5 border border-slate-200 shadow-sm`}
              >
                <Cpu size={16} /> AI Auto-Fill Scanner
              </motion.button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Description */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Description</label>
                <textarea 
                  placeholder="Describe the waste situation... or click 'AI Auto-Fill Scanner' above!"
                  rows="4"
                  maxLength={500}
                  className={`w-full px-4 py-3 text-sm border-2 border-slate-200 rounded-xl outline-none ${theme.ringColor} transition-all resize-none bg-slate-50/50 hover:bg-white`}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <p className="text-xs text-slate-400 text-right">{description.length}/500</p>
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Photo Evidence</label>
                <div className="flex items-center justify-center w-full">
                  <label className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer bg-slate-50 ${theme.cardHoverBg} ${theme.cardHoverBorder} transition-all group overflow-hidden`}>
                    {imagePreview ? (
                      <>
                        <img src={imagePreview} className="h-full w-full object-contain bg-slate-900" alt="Preview" />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setImage(null);
                            setImagePreview(null);
                          }}
                          className="absolute top-3 right-3 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:scale-110 transition-transform"
                        >
                          <X size={18} />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Camera size={36} className={`mb-2 ${theme.accentText} group-hover:scale-110 transition-transform`} />
                        <p className="text-xs font-bold text-slate-700">Click to upload or take photo</p>
                        <p className="text-[11px] text-slate-400 mt-1">Supports JPG, PNG up to 5MB</p>
                      </div>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </label>
                </div>
              </div>

              {/* Location Picker */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Map Geolocation</label>
                {position && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-bold mb-2"
                  >
                    <CheckCircle size={16} /> Location Pin set: {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
                  </motion.div>
                )}
                <div className="rounded-2xl overflow-hidden border-2 border-slate-200 shadow-md">
                  <MapPicker position={position} setPosition={setPosition} />
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                className={`w-full py-3.5 ${theme.buttonClass} text-white rounded-xl font-bold text-sm shadow-xl flex items-center justify-center gap-2`}
                disabled={loading}
              >
                <Send size={18} />
                {loading ? 'Submitting Report...' : 'Submit Waste Report'}
              </motion.button>
            </form>
          </div>
        </motion.div>

        {/* My Reports Sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/80 p-6 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">My Reports</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${theme.accentBgLight} ${theme.accentTextDark}`}>
                {complaints.length} Filed
              </span>
            </div>

            <AnimatePresence>
              {complaints.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Trash2 size={40} className="mb-2 opacity-30" />
                  <p className="text-xs font-bold text-slate-600">No reports filed yet</p>
                  <p className="text-[11px] text-slate-400 mt-1 text-center">Submit your first report using the form!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                  {complaints.map((complaint) => {
                    const status = complaint.status || 'Pending';
                    const config = statusConfig[status];
                    const Icon = config.icon;
                    return (
                      <motion.div 
                        key={complaint.id}
                        whileHover={{ scale: 1.02, x: 3 }}
                        className={`p-4 bg-slate-50 rounded-2xl border border-slate-200 ${theme.cardHoverBorder} hover:bg-white transition-all duration-300 cursor-pointer shadow-sm group`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 ${config.bg} ${config.text}`}>
                            <Icon size={12} /> {status}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(complaint.createdAt).toLocaleDateString()}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteReport(complaint.id, e)}
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Report Record"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {complaint.imageUrl && (
                          <div className="w-full h-44 bg-slate-900 rounded-xl mb-2 overflow-hidden flex items-center justify-center border border-slate-200/60 shadow-inner">
                            <img 
                              src={getImageUrl(complaint.imageUrl)} 
                              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                              alt="Waste"
                              onError={(e) => { console.error('Image load error:', complaint.imageUrl); }}
                            />
                          </div>
                        )}

                        <p className="text-slate-700 text-xs font-semibold line-clamp-2 mb-2">{complaint.description}</p>

                        <div className="flex items-center gap-1 text-slate-400 text-[10px]">
                          <MapPin size={12} className={theme.accentText} />
                          <span className="font-mono">{parseFloat(complaint.lat).toFixed(3)}, {parseFloat(complaint.lng).toFixed(3)}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserDashboard;

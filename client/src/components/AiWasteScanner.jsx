import { useState, useEffect } from 'react';
import { Sparkles, Cpu, CheckCircle2, AlertTriangle, RefreshCw, Zap, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-hot-toast';

const SAMPLE_WASTE_TYPES = [
  {
    id: 'plastic',
    name: 'Plastic Heap & Bottles',
    image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80',
    category: 'Plastic & Polymers',
    severity: 'Medium',
    severityScore: 6,
    points: 50,
    confidence: '98.4%',
    desc: 'Heavy accumulation of single-use plastic bottles, synthetic packaging, and non-biodegradable polymer containers dumped in public area. Requires urgent recycling dispatch.'
  },
  {
    id: 'ewaste',
    name: 'Electronic & Battery Waste',
    image: 'https://images.unsplash.com/photo-1550041473-d296a3a8a18a?auto=format&fit=crop&w=600&q=80',
    category: 'Hazardous E-Waste',
    severity: 'Critical High',
    severityScore: 9,
    points: 100,
    confidence: '96.8%',
    desc: 'Discarded electronic circuit boards, battery cells, and toxic metallic scrap. High risk of heavy metal chemical leaching into nearby soil.'
  },
  {
    id: 'organic',
    name: 'Food & Organic Dump',
    image: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=600&q=80',
    category: 'Organic & Bio-Decomposable',
    severity: 'Low-Medium',
    severityScore: 4,
    points: 30,
    confidence: '99.1%',
    desc: 'Decomposing organic food waste accumulation causing pest risk and odor spillover. Suitable for municipal composting process.'
  },
  {
    id: 'industrial',
    name: 'Chemical & Industrial Debris',
    image: 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=600&q=80',
    category: 'Toxic Industrial Waste',
    severity: 'Severe Emergency',
    severityScore: 10,
    points: 120,
    confidence: '95.2%',
    desc: 'Hazardous liquid chemical containers and heavy industrial debris left exposed. Requires immediate hazmat safety response team.'
  }
];

const AiWasteScanner = ({ onApplyScanResult, onClose }) => {
  const { theme } = useTheme();
  const [selectedSample, setSelectedSample] = useState(SAMPLE_WASTE_TYPES[0]);
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(true);
  const [scanStep, setScanStep] = useState('');

  const triggerScan = (sampleToScan) => {
    setSelectedSample(sampleToScan);
    setScanning(true);
    setScanned(false);

    const steps = [
      '🔍 Analyzing pixel color signatures...',
      '🧬 Identifying polymer vs metallic composition...',
      '⚠️ Assessing environmental hazard score...',
      '✨ Generating AI automated report description...'
    ];

    steps.forEach((stepText, index) => {
      setTimeout(() => {
        setScanStep(stepText);
        if (index === steps.length - 1) {
          setTimeout(() => {
            setScanning(false);
            setScanned(true);
            toast.success(`AI Scan complete for ${sampleToScan.name}! 🎉`);
          }, 300);
        }
      }, (index + 1) * 300);
    });
  };

  // Auto-scan on component mount
  useEffect(() => {
    triggerScan(SAMPLE_WASTE_TYPES[0]);
  }, []);

  const handleApply = () => {
    if (onApplyScanResult) {
      onApplyScanResult({
        description: selectedSample.desc,
        category: selectedSample.category,
        imageUrl: selectedSample.image
      });
      toast.success('✨ AI details auto-filled into your report form!');
      if (onClose) onClose();
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 max-w-2xl w-full mx-auto relative max-h-[88vh] overflow-y-auto flex flex-col custom-scrollbar">
      {/* Background AI Grid glow */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-gradient-to-br from-emerald-400/20 to-teal-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl ${theme.buttonClass} text-white flex items-center justify-center shadow-lg`}>
            <Cpu size={24} className="animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              AI Waste Scanner <Sparkles size={18} className="text-amber-500" />
            </h2>
            <p className="text-xs text-slate-500">Instant AI Image Recognition & Hazard Classification</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Sample Selector Pills */}
      <div className="mb-5 space-y-2 shrink-0">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Select Sample Waste Image for AI Analysis
          </label>
          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Click to Auto-Scan
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {SAMPLE_WASTE_TYPES.map((sample) => (
            <motion.button
              key={sample.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => triggerScan(sample)}
              className={`p-2 rounded-2xl border-2 text-left transition-all relative overflow-hidden ${
                selectedSample.id === sample.id
                  ? `${theme.cardHoverBorder} bg-slate-900 text-white shadow-lg ring-2 ring-emerald-400/50`
                  : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-800'
              }`}
            >
              <img src={sample.image} alt={sample.name} className="w-full h-16 object-cover rounded-xl mb-1.5" />
              <p className="text-[11px] font-bold truncate">{sample.name}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Image Preview & Laser Scan Animation */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-900 h-56 border-2 border-slate-800 flex items-center justify-center mb-5 shadow-inner shrink-0">
        <img src={selectedSample.image} alt="Target Waste" className="w-full h-full object-cover opacity-90" />

        {/* Laser Scanner animation line */}
        {scanning && (
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 100 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut', repeatType: 'reverse' }}
            className="absolute inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_20px_#10b981]"
          >
            <div className="w-full h-10 bg-emerald-500/30 blur-md -mt-4" />
          </motion.div>
        )}

        {/* Status Overlay while scanning */}
        {scanning && (
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center">
            <RefreshCw size={36} className="text-emerald-400 animate-spin mb-3" />
            <p className="text-white font-bold text-sm font-mono">{scanStep}</p>
          </div>
        )}

        {!scanning && !scanned && (
          <div className="absolute inset-0 bg-slate-900/40 hover:bg-slate-900/20 transition-colors flex items-center justify-center">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => triggerScan(selectedSample)}
              className={`px-6 py-3 rounded-2xl ${theme.buttonClass} text-white font-bold shadow-2xl flex items-center gap-2 text-sm`}
            >
              <Zap size={18} /> Run AI Scan Now
            </motion.button>
          </div>
        )}
      </div>

      {/* AI Analysis Result Cards */}
      <AnimatePresence>
        {scanned && !scanning && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 shrink-0"
          >
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-600 uppercase">Category</span>
                <p className="text-xs font-bold text-emerald-900 mt-1 truncate">{selectedSample.category}</p>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
                <span className="text-[10px] font-bold text-amber-600 uppercase">Hazard Level</span>
                <p className="text-xs font-bold text-amber-900 mt-1 flex items-center gap-1">
                  <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                  Score: {selectedSample.severityScore}/10
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200">
                <span className="text-[10px] font-bold text-purple-600 uppercase">Eco Points</span>
                <p className="text-xs font-bold text-purple-900 mt-1">+ {selectedSample.points} PTS</p>
              </div>
            </div>

            {/* Generated Description Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                AI Auto-Generated Report Description ({selectedSample.confidence} Match)
              </span>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">{selectedSample.desc}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1 pb-2">
              <button
                type="button"
                onClick={() => triggerScan(selectedSample)}
                className="px-4 py-3 rounded-xl border-2 border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 shrink-0"
              >
                <RefreshCw size={14} /> Re-scan
              </button>

              {onApplyScanResult && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleApply}
                  className={`flex-1 py-3 px-4 rounded-xl ${theme.buttonClass} text-white font-extrabold text-xs shadow-xl flex items-center justify-center gap-2 text-center tracking-wide`}
                >
                  <CheckCircle2 size={18} /> Auto-Fill Report Form <ArrowRight size={16} />
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AiWasteScanner;

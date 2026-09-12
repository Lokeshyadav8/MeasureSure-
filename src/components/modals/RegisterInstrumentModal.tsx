import React, { useState, useEffect } from 'react';
import { X, Scan, Sparkles, Loader2, Plus, Check } from 'lucide-react';
import { useMetrology } from '../../context/MetrologyContext';

interface RegisterInstrumentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RegisterInstrumentModal: React.FC<RegisterInstrumentModalProps> = ({
  isOpen,
  onClose
}) => {
  const { registerInstrument, runAiOcrScan, ocrResult, isOcrScanning } = useMetrology();

  const instrumentTypes = [
    'Digital weighing scale',
    'Platform scale',
    'Weighbridge',
    'Retail weighing machine',
    'Petrol pump measuring instrument',
    'Measuring meter',
    'Length measuring instrument',
    'Industrial measurement instrument',
    'Laboratory precision balance'
  ];

  const categories = ['Commercial', 'Industrial', 'Retail', 'Laboratory', 'Petroleum'];

  const [name, setName] = useState('');
  const [selectedType, setSelectedType] = useState(instrumentTypes[0]);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [manufacturer, setManufacturer] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [capacity, setCapacity] = useState('50');
  const [unitOfMeasurement, setUnitOfMeasurement] = useState('kg');
  const [location, setLocation] = useState('Apex Central Freight Hub, Hyderabad');
  const [tolerance, setTolerance] = useState('0.05');

  // Auto-fill from AI OCR Scan
  useEffect(() => {
    if (ocrResult) {
      setManufacturer(ocrResult.manufacturer || '');
      setModelNumber(ocrResult.model || '');
      setSerialNumber(ocrResult.serialNumber || '');
      if (ocrResult.instrumentType) {
        setSelectedType(ocrResult.instrumentType);
      }
      setCapacity(ocrResult.capacity?.replace(/[^0-9.]/g, '') || '50');
      setUnitOfMeasurement(ocrResult.unit || 'kg');
      setName(`${ocrResult.manufacturer} ${ocrResult.model}`);
      setTolerance(String(ocrResult.permissibleTolerance || 0.05));
    }
  }, [ocrResult]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tolDouble = parseFloat(tolerance) || 0.05;

    registerInstrument({
      name: name.trim() || `${manufacturer || 'Instrument'} ${selectedType}`,
      type: selectedType,
      category: selectedCategory,
      manufacturer: manufacturer.trim() || 'Mettler Toledo',
      modelNumber: modelNumber.trim() || 'IND-500',
      serialNumber: serialNumber.trim() || 'SN-' + Math.floor(10000 + Math.random() * 90000),
      capacity: capacity.trim() || '50',
      unitOfMeasurement: unitOfMeasurement.trim() || 'kg',
      location: location.trim() || 'Apex Freight Terminal, Hyderabad',
      permissibleTolerance: tolDouble
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Register New Measuring Instrument
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          
          {/* AI OCR Scanner Banner */}
          <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl shadow-sm border border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/30">
                <Scan className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-white tracking-tight">
                    AI Nameplate OCR Scanner
                  </h4>
                  <span className="px-1.5 py-0.2 bg-cyan-400/20 text-cyan-300 text-[10px] font-extrabold rounded">
                    GEMINI
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Auto-extract serial number, make, model & accuracy class from nameplate
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => runAiOcrScan()}
              disabled={isOcrScanning}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-cyan-500 text-slate-950 rounded-xl text-xs font-extrabold shadow-sm hover:bg-cyan-400 transition-all shrink-0 active:scale-95 disabled:opacity-50"
            >
              {isOcrScanning ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Scan Specs
                </>
              )}
            </button>
          </div>

          {/* Instrument Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-950">
              Instrument Label / Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Instrument Name / Label (e.g. Apex Central Truck Weighbridge)"
              className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-950 placeholder:text-slate-600 placeholder:font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
            />
          </div>

          {/* Type Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-950">
              Instrument Type
            </label>
            <div className="flex flex-wrap gap-2">
              {instrumentTypes.map(t => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={`px-3 py-1.5 rounded-xl text-xs transition-all ${
                    selectedType === t
                      ? 'bg-slate-950 text-white font-black border-2 border-slate-950 shadow-xs'
                      : 'bg-slate-100 text-slate-950 font-extrabold border-2 border-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-950">
              Category / Operating Sector
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map(c => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs transition-all ${
                    selectedCategory === c
                      ? 'bg-cyan-700 text-white font-black border-2 border-cyan-800 shadow-xs'
                      : 'bg-slate-100 text-slate-950 font-extrabold border-2 border-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Manufacturer & Model Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-950">
                Manufacturer (Make)
              </label>
              <input
                type="text"
                value={manufacturer}
                onChange={e => setManufacturer(e.target.value)}
                placeholder="Manufacturer (e.g. Mettler Toledo / Avery)"
                className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-950 placeholder:text-slate-600 placeholder:font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-950">
                Model Number
              </label>
              <input
                type="text"
                value={modelNumber}
                onChange={e => setModelNumber(e.target.value)}
                placeholder="Model Number (e.g. XP-205 / BMS-HD)"
                className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-950 placeholder:text-slate-600 placeholder:font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Serial Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-950">
              Serial Number (S/N) *
            </label>
            <input
              type="text"
              value={serialNumber}
              onChange={e => setSerialNumber(e.target.value)}
              placeholder="Serial Number (S/N) (e.g. SN-99214)"
              className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs sm:text-sm font-mono font-bold text-slate-950 placeholder:text-slate-600 placeholder:font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Capacity & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-950">
                Capacity
              </label>
              <input
                type="text"
                value={capacity}
                onChange={e => setCapacity(e.target.value)}
                placeholder="Capacity (e.g. 30 or 60000)"
                className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-950 placeholder:text-slate-600 placeholder:font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-950">
                Unit (kg, g, L, Ton)
              </label>
              <input
                type="text"
                value={unitOfMeasurement}
                onChange={e => setUnitOfMeasurement(e.target.value)}
                placeholder="Unit (kg, g, L, Ton, m)"
                className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-950 placeholder:text-slate-600 placeholder:font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Location & Tolerance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-950">
                Operating Site / Location
              </label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Location (e.g. Central Hub, Weigh Bay A)"
                className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-950 placeholder:text-slate-600 placeholder:font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-950">
                Permissible Tolerance (%)
              </label>
              <input
                type="text"
                value={tolerance}
                onChange={e => setTolerance(e.target.value)}
                placeholder="Tolerance % (e.g. 0.05)"
                className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs sm:text-sm font-mono font-bold text-slate-950 placeholder:text-slate-600 placeholder:font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Statutory Fee Notice Banner */}
          <div className="p-3.5 bg-gradient-to-r from-purple-50 via-cyan-50 to-blue-50 border border-purple-200/80 rounded-2xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-purple-700 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                ₹
              </span>
              <div>
                <div className="font-black text-slate-900 flex items-center gap-1.5">
                  <span>Statutory Calibration & Stamping Fee</span>
                  <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] rounded font-bold">Bharat Kosh</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Includes all India payment modes: PhonePe, Google Pay, Paytm UPI, RuPay/Cards & NetBanking.
                </p>
              </div>
            </div>
            <span className="font-black text-slate-900 text-sm whitespace-nowrap bg-white px-2.5 py-1 rounded-xl border border-slate-200">
              {selectedCategory === 'Industrial' ? '₹1,850' : selectedCategory === 'Petroleum' ? '₹1,450' : selectedCategory === 'Laboratory' ? '₹1,250' : '₹950'}
            </span>
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-black shadow-md transition-all active:scale-95"
            >
              <span>Register & Proceed to Payment Gateway</span>
              <Check className="w-4 h-4" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

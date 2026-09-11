import React, { useState } from 'react';
import {
  ArrowLeft,
  FlaskConical,
  Sparkles,
  Loader2,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  Award,
  Thermometer,
  Droplets,
  Activity
} from 'lucide-react';
import { useMetrology } from '../../context/MetrologyContext';
import { TestReading } from '../../types';
import { formatCapacity, formatTolerance } from '../../utils/formatters';

export const InspectionWorkspaceScreen: React.FC = () => {
  const {
    activeInspectionRequest,
    activeInspectionInstrument,
    testReadings,
    addTestReading,
    updateTestReading,
    removeTestReading,
    runAiAnomalyAnalysis,
    aiAnomalyResult,
    isAiAnalyzing,
    completeInspection,
    setActiveScreen
  } = useMetrology();

  const [newStandard, setNewStandard] = useState('');
  const [newActual, setNewActual] = useState('');
  const [newNote, setNewNote] = useState('');

  const [tempC, setTempC] = useState('21.5');
  const [humidity, setHumidity] = useState('48');
  const [physicalObservations, setPhysicalObservations] = useState(
    'Zero-point balance perfect, eccentric loading error within class tolerance. No structural deformations or mechanical wear.'
  );
  const [inspectorNotes, setInspectorNotes] = useState(
    'All load points within legal metrological tolerance. Sealing applied and verification recorded in accordance with OIML R76.'
  );
  const [sealNumber, setSealNumber] = useState(
    `SEAL-2026-NLM-${Math.floor(10000 + Math.random() * 90000)}`
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!activeInspectionRequest || !activeInspectionInstrument) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
        <FlaskConical className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">No active inspection loaded</h3>
        <button
          onClick={() => setActiveScreen('DASHBOARD')}
          className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-xl text-xs font-bold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const handleAddReading = (e: React.FormEvent) => {
    e.preventDefault();
    const std = parseFloat(newStandard);
    const act = parseFloat(newActual);
    if (isNaN(std) || isNaN(act)) return;

    addTestReading({
      standardWeight: std,
      actualReading: act,
      notes: newNote || `Test Point ${testReadings.length + 1}`
    });

    setNewStandard('');
    setNewActual('');
    setNewNote('');
  };

  const allPassed = testReadings.length > 0 && testReadings.every(r => r.passed);
  const maxError = testReadings.length > 0
    ? Math.max(...testReadings.map(r => Math.abs(r.errorPercentage)))
    : 0;

  const handleComplete = async (isPassed: boolean) => {
    setIsSubmitting(true);
    await completeInspection({
      isPassed,
      inspectorNotes,
      tamperSealNumber: sealNumber,
      environmentTempC: parseFloat(tempC) || 21.5,
      environmentHumidityPercent: parseFloat(humidity) || 48
    });
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 bg-slate-900 text-white rounded-3xl shadow-md border border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveScreen('DASHBOARD')}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 font-mono text-[11px] font-bold rounded">
                {activeInspectionRequest.requestId}
              </span>
              <span className="text-xs text-slate-400 font-medium">Statutory Verification Lab</span>
            </div>
            <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
              Calibration Workspace: {activeInspectionInstrument.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-xs">
          <div className="px-3 py-1.5 bg-slate-800 rounded-xl border border-slate-700 whitespace-nowrap">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Capacity</span>
            <span className="font-bold text-white">{formatCapacity(activeInspectionInstrument.capacity, activeInspectionInstrument.unitOfMeasurement)}</span>
          </div>
          <div className="px-3 py-1.5 bg-slate-800 rounded-xl border border-slate-700 whitespace-nowrap">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Permissible MPE</span>
            <span className="font-bold text-cyan-400">{formatTolerance(activeInspectionInstrument.permissibleTolerance)}</span>
          </div>
        </div>
      </div>

      {/* Environmental Conditions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Thermometer className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-700">Ambient Temperature</span>
              <p className="text-[11px] text-slate-500">Permissible range: 15°C - 30°C</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={tempC}
              onChange={e => setTempC(e.target.value)}
              className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold text-xs"
            />
            <span className="text-xs font-bold text-slate-600">°C</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-700">Relative Humidity</span>
              <p className="text-[11px] text-slate-500">Nominal calibration baseline</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={humidity}
              onChange={e => setHumidity(e.target.value)}
              className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold text-xs"
            />
            <span className="text-xs font-bold text-slate-600">%</span>
          </div>
        </div>
      </div>

      {/* Multi-Point Test Calibration Table */}
      <div className="p-5 sm:p-6 bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-cyan-600" />
              Multi-Point Calibration Test Readings
            </h2>
            <p className="text-xs text-slate-500">
              Measure test loads across operating range against certified statutory standard weights
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-medium text-slate-500 whitespace-nowrap">Observed Max Error:</span>
            <span className={`font-mono font-bold px-2.5 py-1 rounded-lg whitespace-nowrap ${
              maxError <= activeInspectionInstrument.permissibleTolerance
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}>
              {(maxError * 100).toFixed(3)}% (Threshold: {formatTolerance(activeInspectionInstrument.permissibleTolerance)})
            </span>
          </div>
        </div>

        {/* Test Points Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-slate-900">
                <th className="py-3 px-3 font-extrabold whitespace-nowrap"># Test Point</th>
                <th className="py-3 px-3 font-extrabold whitespace-nowrap">Standard Mass ({activeInspectionInstrument.unitOfMeasurement})</th>
                <th className="py-3 px-3 font-extrabold whitespace-nowrap">Actual Reading ({activeInspectionInstrument.unitOfMeasurement})</th>
                <th className="py-3 px-3 font-extrabold whitespace-nowrap">Calculated Error (%)</th>
                <th className="py-3 px-3 font-extrabold whitespace-nowrap">Statutory Limit</th>
                <th className="py-3 px-3 font-extrabold whitespace-nowrap">Tolerance Status</th>
                <th className="py-3 px-3 font-extrabold text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {testReadings.map((reading, index) => {
                const isPass = reading.passed;

                return (
                  <tr key={reading.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-950 whitespace-nowrap">
                      {reading.notes || `Point ${index + 1}`}
                    </td>
                    <td className="py-3 px-3 font-mono font-black text-slate-950 whitespace-nowrap">
                      {reading.standardWeight.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <input
                        type="number"
                        step="any"
                        value={reading.actualReading}
                        onChange={e => updateTestReading(reading.id, parseFloat(e.target.value) || 0)}
                        className="w-28 px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-black text-slate-950 focus:bg-white focus:ring-2 focus:ring-cyan-500"
                      />
                    </td>
                    <td className="py-3 px-3 font-mono whitespace-nowrap">
                      <span className="text-slate-950 font-black text-xs">
                        {reading.errorPercentage >= 0 ? '+' : ''}{(reading.errorPercentage * 100).toFixed(3)}%
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                      {formatTolerance(reading.toleranceLimit)}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {isPass ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-950 rounded-md font-bold text-xs border border-emerald-300 whitespace-nowrap shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          Passed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-100 text-rose-950 rounded-md font-bold text-xs border border-rose-300 whitespace-nowrap shrink-0">
                          <XCircle className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                          Breached
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => removeTestReading(reading.id)}
                        className="p-1.5 text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Add New Test Point Row */}
        <form onSubmit={handleAddReading} className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-2.5">
          <input
            type="text"
            value={newNote}
            onChange={e => setNewNote(e.target.value)}
            placeholder="Label (e.g. Corner Eccentricity 2)"
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-500"
          />
          <input
            type="number"
            step="any"
            required
            value={newStandard}
            onChange={e => setNewStandard(e.target.value)}
            placeholder={`Std Load (${activeInspectionInstrument.unitOfMeasurement})`}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-950 placeholder:text-slate-500"
          />
          <input
            type="number"
            step="any"
            required
            value={newActual}
            onChange={e => setNewActual(e.target.value)}
            placeholder={`Actual (${activeInspectionInstrument.unitOfMeasurement})`}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-950 placeholder:text-slate-500"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-950 text-white rounded-xl text-xs font-black hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Add Reading
          </button>
        </form>

      </div>

      {/* AI Anomaly & Metrology Diagnostics Box */}
      <div className="p-5 sm:p-6 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white rounded-3xl shadow-lg border border-slate-800 space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-2xl border border-cyan-500/30 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                  Gemini Metrology AI Diagnostics
                </h3>
                <span className="px-2 py-0.5 bg-cyan-400 text-slate-950 text-[10px] font-black rounded uppercase">
                  OIML R76 Engine
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Neural metrology assessment for linearity, hysteresis, eccentricity & load cell drift
              </p>
            </div>
          </div>

          <div className="flex items-center sm:justify-end shrink-0">
            <button
              onClick={() => runAiAnomalyAnalysis()}
              disabled={isAiAnalyzing || testReadings.length === 0}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-xl text-xs font-black shadow-md transition-all active:scale-95 disabled:opacity-50 shrink-0 whitespace-nowrap min-w-[150px]"
            >
              {isAiAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>Analyzing Readings...</span>
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4 shrink-0 text-slate-950" />
                  <span>Analyze Readings</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* AI Output Result */}
        {aiAnomalyResult && (
          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-3 animate-in fade-in duration-300">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                  aiAnomalyResult.recommendation === 'PASS'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-rose-500 text-white'
                }`}>
                  AI Recommendation: {aiAnomalyResult.recommendation}
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  Confidence: {Math.round(aiAnomalyResult.confidence * 100)}%
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {aiAnomalyResult.flags.map(f => (
                  <span key={f} className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded text-[10px] font-mono font-bold">
                    {f}
                  </span>
                ))}
              </div>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed">
              {aiAnomalyResult.explanation}
            </p>

            <div className="space-y-1 pt-1 border-t border-slate-700/60">
              <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                Statutory Recommendations:
              </span>
              <ul className="text-xs text-slate-300 list-disc list-inside space-y-0.5">
                {aiAnomalyResult.suggestedActions.map((action, i) => (
                  <li key={i}>{action}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

      </div>

      {/* Decision & Certificate Issuance Section: Inspector Remarks & Compliance Notes */}
      <div className="p-5 sm:p-6 bg-white rounded-3xl border-2 border-slate-300 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-950 tracking-tight flex items-center gap-2">
            <Award className="w-5 h-5 text-cyan-700" />
            Inspector Remarks & Compliance Notes
          </h3>
          <span className="text-xs font-bold text-slate-600">
            Statutory Verification Decision
          </span>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-950">
              Statutory Compliance Summary & Observations
            </label>
            <textarea
              rows={2}
              value={inspectorNotes}
              onChange={e => setInspectorNotes(e.target.value)}
              placeholder="All load points within legal metrological tolerance. Sealing applied and verification recorded."
              className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-950 placeholder:text-slate-600 placeholder:font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-950">
                Physical Condition & Observations
              </label>
              <input
                type="text"
                value={physicalObservations}
                onChange={e => setPhysicalObservations(e.target.value)}
                placeholder="Zero-point balance perfect, eccentric loading error within class tolerance."
                className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-950 placeholder:text-slate-600 placeholder:font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-950">
                Tamper-Evident Holographic Seal Number
              </label>
              <input
                type="text"
                value={sealNumber}
                onChange={e => setSealNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs sm:text-sm font-mono font-bold text-slate-950 placeholder:text-slate-600 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Final Submit Buttons */}
        <div className="pt-4 border-t-2 border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            {allPassed ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-950 font-black bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                All {testReadings.length} calibration points meet statutory tolerance
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-rose-950 font-black bg-rose-100 px-3 py-1.5 rounded-xl border border-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-700" />
                One or more test points breach tolerance threshold
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto w-full sm:w-auto">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleComplete(false)}
              className="flex-1 sm:flex-initial px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border-2 border-rose-300 rounded-xl text-xs font-black transition-colors shadow-xs active:scale-95"
            >
              Fail Inspection
            </button>

            <button
              type="button"
              disabled={isSubmitting || testReadings.length === 0}
              onClick={() => handleComplete(true)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating Certificate...</span>
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4" />
                  <span>Approve & Issue Certificate</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

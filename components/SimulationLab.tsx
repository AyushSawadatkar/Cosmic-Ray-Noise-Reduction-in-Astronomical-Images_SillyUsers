
import React, { useState, useRef, useEffect } from 'react';
import { injectSyntheticNoise } from '../services/data/simulate_noise';

enum SimulationStatus {
  IDLE = 'IDLE',
  PREPARING = 'PREPARING',
  INJECTING = 'INJECTING',
  COMPLETE = 'COMPLETE'
}

const SimulationLab: React.FC = () => {
  const [baseImage, setBaseImage] = useState<string | null>(null);
  const [noisyImage, setNoisyImage] = useState<string | null>(null);
  const [density, setDensity] = useState(0.005);
  const [intensity, setIntensity] = useState(0.8);
  const [status, setStatus] = useState<SimulationStatus>(SimulationStatus.IDLE);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const simulationResultsRef = useRef<HTMLDivElement>(null);

  const isSimulating = status !== SimulationStatus.IDLE && status !== SimulationStatus.COMPLETE;

  useEffect(() => {
    if (status === SimulationStatus.COMPLETE && simulationResultsRef.current) {
      simulationResultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [status]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setBaseImage(event.target?.result as string);
      setNoisyImage(null);
      setStatus(SimulationStatus.IDLE);
    };
    reader.readAsDataURL(file);
  };

  const handleSimulate = async () => {
    if (!baseImage) return;
    setStatus(SimulationStatus.PREPARING);
    await new Promise(resolve => setTimeout(resolve, 600)); // Artificial lag for UI feeling
    
    setStatus(SimulationStatus.INJECTING);
    const img = new Image();
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, img.width, img.height);
      
      const noisyData = injectSyntheticNoise(data, intensity, density);
      ctx.putImageData(noisyData, 0, 0);
      
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulating heavy compute
      setNoisyImage(canvas.toDataURL());
      setStatus(SimulationStatus.COMPLETE);
    };
    img.src = baseImage;
  };

  const handleDownload = () => {
    if (!noisyImage) return;
    const link = document.createElement('a');
    link.href = noisyImage;
    link.download = `synthetic_noisy_sample_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stages = [
    { id: SimulationStatus.PREPARING, label: 'Reading Buffer', icon: 'fa-memory' },
    { id: SimulationStatus.INJECTING, label: 'Spacial Perturbation', icon: 'fa-burst' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <i className="fa-solid fa-flask-vial text-emerald-400"></i>
            Noise Modeling
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Clean Reference</label>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
              <button 
                disabled={isSimulating}
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 rounded-xl border-2 border-dashed border-slate-600 transition-all flex flex-col items-center justify-center gap-2 group disabled:opacity-50"
              >
                <i className="fa-solid fa-image text-2xl text-slate-400 group-hover:text-emerald-400"></i>
                <span className="text-sm font-medium">Upload Base Image</span>
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1 flex justify-between">
                Noise Density
                <span className="text-emerald-400 font-mono">{(density * 100).toFixed(2)}%</span>
              </label>
              <input 
                type="range" min="0.001" max="0.05" step="0.001" 
                value={density} onChange={(e) => setDensity(parseFloat(e.target.value))}
                disabled={isSimulating}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 disabled:opacity-50"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">
                <span>Sparse (0.1%)</span>
                <span>Dense (5.0%)</span>
              </div>
            </div>

            <button 
              disabled={!baseImage || isSimulating}
              onClick={handleSimulate}
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                !baseImage || isSimulating
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20'
              }`}
            >
              {isSimulating ? (
                <>
                  <i className="fa-solid fa-spinner animate-spin"></i>
                  Generating...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-vial-circle-check"></i>
                  Inject Noise
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Simulation Stepper */}
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <i className="fa-solid fa-microscope text-xs"></i>
            Simulator Status
          </h3>
          <div className="space-y-4 relative">
            <div className="absolute left-[11px] top-2 bottom-2 w-[1px] bg-slate-700 z-0"></div>
            {stages.map((stage) => {
              const active = status === stage.id;
              const completed = 
                (status === SimulationStatus.INJECTING && stage.id === SimulationStatus.PREPARING) ||
                status === SimulationStatus.COMPLETE;
              
              return (
                <div key={stage.id} className="flex items-center gap-3 relative z-10">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] border ${
                    completed ? 'bg-emerald-600 border-emerald-500 text-white' :
                    active ? 'bg-emerald-900 border-emerald-400 text-emerald-300 animate-pulse' :
                    'bg-slate-900 border-slate-700 text-slate-600'
                  }`}>
                    <i className={`fa-solid ${completed ? 'fa-check' : stage.icon}`}></i>
                  </div>
                  <span className={`text-xs font-medium ${completed ? 'text-emerald-400' : active ? 'text-emerald-200' : 'text-slate-500'}`}>
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {noisyImage && (
          <div className="bg-emerald-900/20 rounded-2xl p-6 border border-emerald-500/30 shadow-xl space-y-4 animate-in slide-in-from-top-2">
            <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <i className="fa-solid fa-square-check"></i>
              Sample Ready
            </h3>
            <button 
              onClick={handleDownload}
              className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
            >
              <i className="fa-solid fa-download"></i>
              Save Noisy Sample
            </button>
          </div>
        )}

        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 text-xs text-slate-400 leading-relaxed">
           <p className="font-bold text-slate-300 mb-1">Modeling Logic:</p>
           Synthetic noise is modeled as high-intensity impulse spikes and small linear clusters (streaks), simulating high-energy particle strikes on CCD sensors during long-exposure astrophotography.
        </div>
      </div>

      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6" ref={simulationResultsRef}>
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-500 uppercase px-2 tracking-widest">Base Reference (Ground Truth)</p>
          <div className="bg-slate-800 rounded-3xl p-4 border border-slate-700 aspect-square flex items-center justify-center overflow-hidden shadow-2xl">
            {baseImage ? (
              <img src={baseImage} className="max-w-full max-h-full rounded-lg object-contain" alt="Ground Truth" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-600">
                <i className="fa-solid fa-moon text-4xl"></i>
                <p className="text-sm">Waiting for upload...</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-500 uppercase px-2 tracking-widest">Synthetic Noisy Output</p>
          <div className="bg-slate-800 rounded-3xl p-4 border border-slate-700 aspect-square flex items-center justify-center overflow-hidden shadow-2xl relative group">
            {noisyImage ? (
              <>
                <img src={noisyImage} className="max-w-full max-h-full rounded-lg object-contain" alt="Synthetic Noise" />
                <button 
                  onClick={handleDownload}
                  className="absolute bottom-6 right-6 p-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110"
                >
                  <i className="fa-solid fa-download text-xl"></i>
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-600">
                {isSimulating ? (
                  <div className="flex flex-col items-center gap-4">
                    <i className="fa-solid fa-bolt animate-pulse text-5xl text-emerald-500"></i>
                    <p className="text-sm font-medium animate-pulse">Charging Particles...</p>
                  </div>
                ) : (
                  <>
                    <i className="fa-solid fa-bolt text-4xl"></i>
                    <p className="text-sm">Click Inject Noise...</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationLab;

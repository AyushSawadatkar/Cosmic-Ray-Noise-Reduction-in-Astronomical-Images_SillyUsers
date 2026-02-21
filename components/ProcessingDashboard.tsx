
import React, { useState, useRef, useEffect } from 'react';
import { runPipeline } from '../services/backend/pipeline';
import { ProcessingResult, PipelineStep } from '../types';

const ProcessingDashboard: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [results, setResults] = useState<ProcessingResult | null>(null);
  const [status, setStatus] = useState<PipelineStep>(PipelineStep.IDLE);
  const [threshold, setThreshold] = useState(0.15);
  const [useEnhancement, setUseEnhancement] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const isProcessing = status !== PipelineStep.IDLE && status !== PipelineStep.COMPLETE;

  useEffect(() => {
    if (status === PipelineStep.COMPLETE && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [status]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, img.width, img.height);
        
        setImageData(data);
        setOriginalImage(event.target?.result as string);
        setResults(null);
        setStatus(PipelineStep.IDLE);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleProcess = async () => {
    if (!imageData) return;
    try {
      const res = await runPipeline(imageData, threshold, useEnhancement, (s) => setStatus(s));
      setResults(res);
    } catch (err) {
      console.error(err);
      setStatus(PipelineStep.IDLE);
    }
  };

  const handleDownload = (type: 'denoised' | 'enhanced' | 'mask' = 'enhanced') => {
    let target: string | undefined;
    if (type === 'enhanced') target = results?.enhanced;
    else if (type === 'denoised') target = results?.denoised;
    else if (type === 'mask') target = results?.mask;

    if (!target) return;
    const link = document.createElement('a');
    link.href = target;
    link.download = `cosmic_ray_${type}_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStepState = (step: PipelineStep) => {
    const order = [
      PipelineStep.IDLE,
      PipelineStep.PREPROCESSING,
      PipelineStep.DETECTION,
      PipelineStep.DENOISING,
      PipelineStep.ENHANCEMENT,
      PipelineStep.COMPLETE
    ];
    
    const currentIndex = order.indexOf(status);
    const stepIndex = order.indexOf(step);

    if (status === PipelineStep.COMPLETE) return 'completed';
    if (currentIndex === stepIndex) return 'active';
    if (currentIndex > stepIndex) return 'completed';
    return 'pending';
  };

  const pipelineStages = [
    { id: PipelineStep.PREPROCESSING, label: 'Luminance Normalization', icon: 'fa-gauge-high' },
    { id: PipelineStep.DETECTION, label: '3x3 Median Analysis', icon: 'fa-bullseye' },
    { id: PipelineStep.DENOISING, label: 'Local Interpolation', icon: 'fa-brush' },
    ...(useEnhancement ? [{ id: PipelineStep.ENHANCEMENT, label: '2x Visual Sharpening', icon: 'fa-wand-magic-sparkles' }] : []),
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full pb-10">
      {/* Controls Panel */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <i className="fa-solid fa-sliders text-indigo-400"></i>
            Pipeline Controls
          </h3>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Upload Image</label>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <button 
                disabled={isProcessing}
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 rounded-xl border-2 border-dashed border-slate-600 transition-all flex flex-col items-center justify-center gap-2 group disabled:opacity-50"
              >
                <i className="fa-solid fa-cloud-arrow-up text-2xl text-slate-400 group-hover:text-indigo-400"></i>
                <span className="text-sm font-medium text-slate-300">Choose File</span>
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Detection Sensitivity
                <span className="float-right text-indigo-400 font-mono">{threshold.toFixed(2)}</span>
              </label>
              <input 
                type="range" 
                min="0.05" 
                max="0.5" 
                step="0.01" 
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                disabled={isProcessing}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 disabled:opacity-50"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 uppercase tracking-wider">
                <span>Aggressive</span>
                <span>Conservative</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-700">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-200">2x Enhancer</span>
                <span className="text-[10px] text-slate-500">Upscale & Sharpen</span>
              </div>
              <button 
                onClick={() => setUseEnhancement(!useEnhancement)}
                disabled={isProcessing}
                className={`w-12 h-6 rounded-full transition-colors relative disabled:opacity-50 ${useEnhancement ? 'bg-indigo-600' : 'bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${useEnhancement ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>

            <button 
              disabled={!imageData || isProcessing}
              onClick={handleProcess}
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                !imageData || isProcessing 
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20'
              }`}
            >
              {isProcessing ? (
                <>
                  <i className="fa-solid fa-circle-notch animate-spin"></i>
                  Processing...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-wand-magic-sparkles"></i>
                  Run Pipeline
                </>
              )}
            </button>
          </div>
        </div>

        {/* Visual Pipeline Stepper */}
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl space-y-5">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <i className="fa-solid fa-microchip text-xs"></i>
            Pipeline Lifecycle
          </h3>
          
          <div className="space-y-4 relative">
            {/* Connector Line */}
            <div className="absolute left-[13px] top-2 bottom-2 w-[2px] bg-slate-700 z-0"></div>
            
            {pipelineStages.map((stage) => {
              const stepState = getStepState(stage.id);
              return (
                <div key={stage.id} className="flex items-start gap-4 relative z-10 group">
                  <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[10px] transition-all duration-500 border-2 ${
                    stepState === 'completed' ? 'bg-emerald-600 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' :
                    stepState === 'active' ? 'bg-indigo-600 border-indigo-400 text-white animate-pulse shadow-[0_0_20px_rgba(79,70,229,0.5)]' :
                    'bg-slate-900 border-slate-700 text-slate-600'
                  }`}>
                    {stepState === 'completed' ? (
                      <i className="fa-solid fa-check text-xs"></i>
                    ) : stepState === 'active' ? (
                      <i className={`fa-solid ${stage.icon} animate-bounce`}></i>
                    ) : (
                      <i className={`fa-solid ${stage.icon}`}></i>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-xs font-bold tracking-wide transition-colors duration-300 ${
                      stepState === 'completed' ? 'text-emerald-400' :
                      stepState === 'active' ? 'text-indigo-300' :
                      'text-slate-500'
                    }`}>
                      {stage.label}
                    </span>
                    {stepState === 'active' && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="w-1 h-1 bg-indigo-400 rounded-full animate-ping"></span>
                        <span className="text-[10px] text-indigo-400 font-medium">Executing Stage...</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {status === PipelineStep.COMPLETE && (
              <div className="flex items-center gap-4 pt-2 animate-in slide-in-from-top-2 duration-500">
                <div className="w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                  <i className="fa-solid fa-flag-checkered"></i>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-emerald-400 uppercase tracking-tighter">Mission Success</span>
                  <span className="text-[10px] text-emerald-600 font-bold">Data Cleaned & Enhanced</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {results && (
          <div className="bg-indigo-900/20 rounded-2xl p-6 border border-indigo-500/30 shadow-xl space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <i className="fa-solid fa-chart-simple text-indigo-400"></i>
              Execution Stats
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-700">
                <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Noise Pixels</p>
                <p className="text-xl font-mono text-indigo-400">{results.stats.noisePixels}</p>
              </div>
              <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-700">
                <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Time</p>
                <p className="text-xl font-mono text-indigo-400">{results.stats.processingTimeMs.toFixed(1)}ms</p>
              </div>
            </div>
            
            <button 
              onClick={() => handleDownload('enhanced')}
              disabled={!results.enhanced}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50"
            >
              <i className="fa-solid fa-sparkles"></i>
              Download Enhanced
            </button>
          </div>
        )}
      </div>

      {/* Main Preview Area */}
      <div className="lg:col-span-3 space-y-6">
        {!originalImage ? (
          <div className="h-full flex flex-col items-center justify-center bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-700 p-12 text-center">
             <i className="fa-solid fa-satellite-dish text-6xl text-slate-700 mb-4 animate-pulse"></i>
             <h2 className="text-2xl font-bold text-slate-400">Deep Space Feed Idle</h2>
             <p className="text-slate-500 max-w-md mt-2">Upload an astronomical CCD image to begin the cosmic ray detection and removal process.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full content-start">
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">1. Original Exposure</span>
              <div className="bg-slate-800 rounded-3xl p-4 border border-slate-700 shadow-2xl overflow-hidden aspect-square flex items-center justify-center">
                <img src={originalImage} className="max-w-full max-h-full rounded-lg object-contain" alt="Original" />
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">2. Enhanced (Denoised + 2x Clarity)</span>
              <div className="bg-slate-800 rounded-3xl p-4 border border-slate-700 shadow-2xl overflow-hidden aspect-square flex items-center justify-center relative group">
                {results?.enhanced ? (
                  <>
                    <img src={results.enhanced} className="max-w-full max-h-full rounded-lg object-contain" alt="Enhanced" />
                    <button 
                      onClick={() => handleDownload('enhanced')}
                      className="absolute bottom-6 right-6 p-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110"
                      title="Download Enhanced Result"
                    >
                      <i className="fa-solid fa-download text-xl"></i>
                    </button>
                  </>
                ) : results?.denoised ? (
                    <img src={results.denoised} className="max-w-full max-h-full rounded-lg object-contain" alt="Denoised" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-2">
                    {isProcessing ? (
                      <div className="flex flex-col items-center gap-4">
                        <i className="fa-solid fa-gear animate-spin text-5xl text-indigo-500"></i>
                        <p className="text-sm font-medium animate-pulse">Analyzing Signal...</p>
                      </div>
                    ) : (
                      <>
                        <i className="fa-solid fa-hourglass-half text-3xl"></i>
                        <p className="text-sm">Initiate pipeline to generate results</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div ref={resultsRef} className="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2">
            {results && (
              <>
                <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">Artifact Analysis Mask</span>
                    <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 shadow-xl overflow-hidden aspect-video flex items-center justify-center relative group">
                        <img src={results.mask} className="max-w-full max-h-full rounded-lg object-contain invert mix-blend-screen" alt="Noise Mask" />
                        <button 
                          onClick={() => handleDownload('mask')}
                          className="absolute bottom-4 right-4 p-3 bg-slate-700 hover:bg-slate-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Download Mask"
                        >
                          <i className="fa-solid fa-download"></i>
                        </button>
                    </div>
                </div>
                <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">Standard Denoised (Base)</span>
                    <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 shadow-xl overflow-hidden aspect-video flex items-center justify-center relative group">
                        <img src={results.denoised} className="max-w-full max-h-full rounded-lg object-contain" alt="Denoised Base" />
                        <button 
                          onClick={() => handleDownload('denoised')}
                          className="absolute bottom-4 right-4 p-3 bg-slate-700 hover:bg-slate-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Download Denoised"
                        >
                          <i className="fa-solid fa-download"></i>
                        </button>
                    </div>
                </div>
              </>
            )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessingDashboard;

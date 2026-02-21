import React from 'react';

const Documentation: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24">
      {/* Introduction */}
      <section className="space-y-4">
        <h2 className="text-4xl font-extrabold text-white tracking-tight">Technical Specification</h2>
        <div className="p-6 bg-slate-800/50 rounded-2xl border-l-4 border-indigo-500 backdrop-blur-sm">
          <p className="text-lg text-slate-300 leading-relaxed">
            CosmicRayCleaner utilizes deterministic, explainable computer vision algorithms to process astronomical CCD data. 
            Unlike black-box neural networks, our pipeline relies on local statistical variations to distinguish 
            high-energy particle strikes from legitimate stellar objects.
          </p>
        </div>
      </section>

      {/* Algorithm 1: Preprocessing */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-900/50 flex items-center justify-center border border-indigo-500/30">
            <i className="fa-solid fa-gauge-high text-indigo-400"></i>
          </div>
          <h3 className="text-2xl font-bold text-white">1. Luminance Normalization</h3>
        </div>
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4">
          <p className="text-slate-400 text-sm">
            Astronomical data is often stored in high bit-depth formats. We first normalize the dynamic range 
            to [0, 1] and convert multi-channel RGB data into a single-channel grayscale buffer.
          </p>
          <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs text-indigo-300 border border-slate-950">
            <p className="text-slate-500 mb-2">// Luminance Conversion Formula</p>
            <code className="block">Y = 0.299*R + 0.587*G + 0.114*B</code>
          </div>
        </div>
      </section>

      {/* Algorithm 2: Detection */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-900/50 flex items-center justify-center border border-indigo-500/30">
            <i className="fa-solid fa-bullseye text-indigo-400"></i>
          </div>
          <h3 className="text-2xl font-bold text-white">2. 3x3 Median Spike Analysis</h3>
        </div>
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4">
          <p className="text-slate-400 text-sm">
            Cosmic rays are characterized by sharp, high-intensity spikes that occupy 1-3 pixels. 
            We use a sliding window to calculate the local median. If a pixel's value exceeds the 
            local median by a user-defined threshold, it is flagged as noise.
          </p>
          <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs text-indigo-300 border border-slate-950">
            <p className="text-slate-500 mb-2">// Detection Logic (Pseudocode)</p>
            <pre>{`for pixel in image:
  neighbors = get_3x3_window(pixel)
  local_median = sort(neighbors)[4]
  if pixel.value > (local_median + threshold):
    mask[pixel] = TRUE`}</pre>
          </div>
        </div>
      </section>

      {/* Algorithm 3: Denoising */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-900/50 flex items-center justify-center border border-indigo-500/30">
            <i className="fa-solid fa-brush text-indigo-400"></i>
          </div>
          <h3 className="text-2xl font-bold text-white">3. Local Interpolation</h3>
        </div>
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4">
          <p className="text-slate-400 text-sm">
            To preserve the underlying signal, flagged pixels are replaced using a "Clean Neighbor" median filter. 
            This prevents the blurred artifacts typical of standard Gaussian blurring.
          </p>
          <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs text-indigo-300 border border-slate-950">
            <p className="text-slate-500 mb-2">// Inpainting Logic</p>
            <pre>{`if mask[pixel] == TRUE:
  clean_neighbors = [n for n in neighbors if mask[n] == FALSE]
  pixel.value = median(clean_neighbors)`}</pre>
          </div>
        </div>
      </section>

      {/* Algorithm 4: Enhancement */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-900/50 flex items-center justify-center border border-indigo-500/30">
            <i className="fa-solid fa-wand-magic-sparkles text-indigo-400"></i>
          </div>
          <h3 className="text-2xl font-bold text-white">4. 2x Clarity Enhancement</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
            <h4 className="font-bold text-indigo-400 mb-2">Bilinear Upscaling</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              We perform a 2x coordinate mapping with linear interpolation to increase pixel density, 
              providing a smoother canvas for visual inspection without introducing ringing artifacts.
            </p>
          </div>
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
            <h4 className="font-bold text-indigo-400 mb-2">Laplacian Sharpening</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              A high-pass filter is applied using a 3x3 Laplacian kernel to emphasize edges and stellar 
              point sources, compensating for the slight softening introduced during denoising.
            </p>
            <div className="mt-4 bg-slate-900 p-2 rounded text-[10px] font-mono text-slate-500 text-center">
              Kernel: [0, -1, 0, -1, 5, -1, 0, -1, 0]
            </div>
          </div>
        </div>
      </section>

      {/* Algorithm 5: Simulation */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-900/50 flex items-center justify-center border border-emerald-500/30">
            <i className="fa-solid fa-vial text-emerald-400"></i>
          </div>
          <h3 className="text-2xl font-bold text-white">5. Synthetic Noise Simulation</h3>
        </div>
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4">
          <p className="text-slate-400 text-sm leading-relaxed">
            The simulator generates "Impulse Clusters." Unlike simple Salt & Pepper noise, it models 
            random linear trajectories (streaks) of 1-4 pixels, mirroring the angled impact of 
            high-energy particles on a silicon substrate.
          </p>
        </div>
      </section>

      <div className="pt-12 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 opacity-50">
          <div className="w-8 h-8 flex items-center justify-center bg-indigo-600 rounded-lg">
             <i className="fa-solid fa-code text-white text-[10px]"></i>
          </div>
          
        </div>
        <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.3em]">
          Handcrafted by sillyusers
        </p>
      </div>
    </div>
  );
};

export default Documentation;
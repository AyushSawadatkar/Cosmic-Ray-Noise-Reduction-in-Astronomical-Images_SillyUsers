import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard', icon: 'fa-rocket', label: 'Processing Pipeline' },
    { id: 'simulation', icon: 'fa-vial', label: 'Noise Simulator' },
    { id: 'documentation', icon: 'fa-book', label: 'Documentation' },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 py-3 px-6 flex items-center justify-between shrink-0 shadow-2xl z-20">
        <div className="flex items-center gap-4">
          {/* Custom Black Hole Logo derived from User Image */}
          <div className="w-14 h-14 flex items-center justify-center bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-900/40 transform transition-transform hover:scale-105 duration-300">
            <svg viewBox="0 0 100 100" className="w-11 h-11 fill-indigo-50">
              {/* Accretion Disk - Glow effect */}
              <path d="M 20 50 C 20 15 80 15 80 50 C 80 85 20 85 20 50 Z" className="fill-indigo-300" opacity="0.4" />
              {/* The "Event Horizon" silhouette */}
              <circle cx="50" cy="50" r="18" className="fill-indigo-600" />
              <circle cx="50" cy="50" r="15" fill="black" />
              {/* Main Disk Warping Outline */}
              <path d="M 5,50 C 5,10 95,10 95,50 C 95,90 5,90 5,50 Z" fill="none" className="stroke-indigo-100" strokeWidth="2" opacity="0.3"/>
              {/* Horizontal Belt with gravitational dip */}
              <path d="M 2,50 C 30,55 70,55 98,50 L 98,48 C 70,53 30,53 2,48 Z" fill="currentColor" />
              {/* Top Warped Arch */}
              <path d="M 15,48 C 30,20 70,20 85,48 L 85,44 C 70,16 30,16 15,44 Z" fill="currentColor" />
              {/* Bottom Warped Arch */}
              <path d="M 30,52 C 40,65 60,65 70,52 L 70,54 C 60,67 40,67 30,54 Z" fill="currentColor" opacity="0.8" />
            </svg>
          </div>
          
          <div className="flex flex-col">
            <h1 className="text-2xl font-black tracking-tighter text-white italic leading-none flex items-baseline gap-1">
              CosmicRay<span className="text-indigo-400">Cleaner</span>
            </h1>
            <span className="text-[10px] text-slate-500 font-medium lowercase tracking-[0.1em] self-end mt-1 mr-0.5">
              by sillyusers
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex bg-slate-900/50 p-1 rounded-2xl border border-slate-700/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <i className={`fa-solid ${tab.icon} ${activeTab === tab.id ? 'animate-pulse' : ''}`}></i>
              {tab.label}
            </button>
          ))}
        </nav>

       
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-800/20 via-slate-900 to-slate-950">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Section Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black text-white capitalize flex items-center gap-3">
                <i className={`fa-solid ${tabs.find(t => t.id === activeTab)?.icon} text-indigo-500`}></i>
                {tabs.find(t => t.id === activeTab)?.label}
              </h2>
              <p className="text-slate-400 text-sm mt-1 max-w-xl">
                {activeTab === 'dashboard' && 'Automated artifact removal and visual enhancement for high-fidelity astronomical imaging.'}
                {activeTab === 'simulation' && 'Synthetic noise modeling engine for validating sensor robustness and algorithm accuracy.'}
                {activeTab === 'documentation' && 'Technical specifications, architecture details, and algorithmic breakdown of the cleaner.'}
              </p>
            </div>
            
           
          </div>

          {children}
        </div>
      </main>

      {/* Mobile Footer Nav */}
      <nav className="md:hidden bg-slate-800 border-t border-slate-700 p-2 flex justify-around shrink-0 z-30 shadow-[0_-10px_20px_rgba(0,0,0,0.3)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
              activeTab === tab.id ? 'text-indigo-400 scale-110' : 'text-slate-500'
            }`}
          >
            <i className={`fa-solid ${tab.icon} text-lg`}></i>
            <span className="text-[9px] font-bold uppercase tracking-tighter">{tab.label.split(' ')[0]}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
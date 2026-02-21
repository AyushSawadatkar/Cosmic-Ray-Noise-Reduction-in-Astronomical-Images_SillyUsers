
import React, { useState } from 'react';
import Layout from './components/Layout';
import ProcessingDashboard from './components/ProcessingDashboard';
import SimulationLab from './components/SimulationLab';
import Documentation from './components/Documentation';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ProcessingDashboard />;
      case 'simulation':
        return <SimulationLab />;
      case 'documentation':
        return <Documentation />;
      default:
        return <ProcessingDashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {/* Fixed: changed class to className */}
      <div className="animate-in fade-in duration-500 h-full">
        {renderContent()}
      </div>
    </Layout>
  );
};

export default App;

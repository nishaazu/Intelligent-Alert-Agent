import React from 'react';
import AlertGenerator from './components/AlertGenerator';
import { Activity } from 'lucide-react';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary-600 p-2 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">HalalGuardian<span className="text-primary-600">AI</span></h1>
              <p className="text-xs text-gray-500">Automated Audit & Alert Response System</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-gray-600">System Online</span>
            </div>
            <div className="h-4 w-px bg-gray-300"></div>
            <span className="text-gray-600">v2.5.0 (Gemini Powered)</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Intelligent Alert Agent</h2>
          <p className="text-gray-600 mt-1">
            Configure compliance triggers below. The AI agent will automatically determine severity, draft the alert in accordance with Malaysian Halal Certification standards, and dispatch emails to relevant stakeholders via SMTP.
          </p>
        </div>

        <AlertGenerator />
      </main>
    </div>
  );
};

export default App;
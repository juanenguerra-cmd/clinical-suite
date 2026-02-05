
import React, { useState } from 'react';
import type { ToolType } from './types';
import PsychNoteForm from './components/forms/PsychNoteForm';
import ExpiryNoteForm from './components/forms/ExpiryNoteForm';
import AbxNoteForm from './components/forms/AbxNoteForm';
import AccidentNoteForm from './components/forms/AccidentNoteForm';
import ObservationNoteForm from './components/forms/ObservationNoteForm';
import NewAdmissionForm from './components/forms/NewAdmissionForm';
import VaxForm from './components/forms/VaxForm';
import COCForm from './components/forms/COCForm';
import DecisionTreePanel from './components/DecisionTreePanel';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType>('decision_tree');

  const navItems: { id: ToolType; label: string; icon: string }[] = [
    { id: 'decision_tree', label: 'Decision Tree', icon: '🧭' },
    { id: 'psych', label: 'Psych Consult', icon: '🧠' },
    { id: 'coc', label: 'Change of Condition', icon: '⚠️' },
    { id: 'admission', label: 'New Admission', icon: '📝' },
    { id: 'observation', label: '7-Day Observation', icon: '📅' },
    { id: 'vax', label: 'Vaccination Doc', icon: '💉' },
    { id: 'abx', label: 'Antibiotic Note', icon: '💊' },
    { id: 'accident', label: 'Accident F/U', icon: '🩹' },
    { id: 'expiry', label: 'Expiry Note', icon: '🕊️' },
  ];

  return (
    <div className="h-full min-h-0 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex-shrink-0 border-b border-slate-800 md:border-b-0 md:border-r md:border-slate-800">
        <div className="p-4 md:p-6">
          <h1 className="text-white text-lg md:text-xl font-black tracking-tight leading-tight">
            CLINICAL<br/><span className="text-blue-400">DOCS</span> SUITE
          </h1>
          <p className="text-[9px] md:text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-widest">Facility Operations v1.0</p>
        </div>
        
        <nav className="px-3 pb-4 md:pb-6 overflow-x-auto md:overflow-visible">
          <ul className="flex md:flex-col gap-2 md:gap-1 md:space-y-1 whitespace-nowrap">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTool(item.id)}
                  className={`w-full flex items-center gap-2 md:gap-3 px-3 py-2 md:py-2.5 rounded-full md:rounded-lg text-xs md:text-sm font-semibold transition-all ${
                    activeTool === item.id 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                      : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="text-base md:text-lg">{item.icon}</span>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-slate-50 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {navItems.find(i => i.id === activeTool)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden sm:block text-right">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Authorized Access</p>
                <p className="text-xs font-bold text-slate-700">Medical Professional</p>
             </div>
             <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-xs font-bold text-slate-500">
               MP
             </div>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {activeTool === 'decision_tree' && <DecisionTreePanel />}
          {activeTool === 'psych' && <PsychNoteForm />}
          {activeTool === 'expiry' && <ExpiryNoteForm />}
          {activeTool === 'abx' && <AbxNoteForm />}
          {activeTool === 'accident' && <AccidentNoteForm />}
          {activeTool === 'observation' && <ObservationNoteForm />}
          {activeTool === 'admission' && <NewAdmissionForm />}
          {activeTool === 'vax' && <VaxForm />}
          {activeTool === 'coc' && <COCForm />}
        </div>
      </main>
    </div>
  );
};

export default App;

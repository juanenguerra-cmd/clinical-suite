
import React, { useState, useEffect, useMemo } from 'react';
import { Card, Input, Select, Button, Textarea } from './SharedUI';
import type { TransportRow, CensusItem } from '../types';
import { polishNote } from '../services/geminiService';

const TransportTracker: React.FC = () => {
  const [rows, setRows] = useState<TransportRow[]>(() => {
    const saved = localStorage.getItem('transport_rows');
    return saved ? JSON.parse(saved) : [];
  });

  const [census, setCensus] = useState<CensusItem[]>(() => {
    const saved = localStorage.getItem('transport_census');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentEdit, setCurrentEdit] = useState<Partial<TransportRow>>({
    id: '',
    resident: '',
    status: 'Scheduled',
    apptType: '',
    unit: '',
    room: '',
    location: '',
    apptDate: '',
    apptTime: '',
    transportType: 'Van',
    roundTrip: 'Yes',
    notes: '',
    origin: '',
    phone: '',
    payer: '',
    escort: 'No',
    transportCompany: ''
  });

  const [filter, setFilter] = useState('');
  const [showCensusManager, setShowCensusManager] = useState(false);
  const [censusRawText, setCensusRawText] = useState('');
  const [isPolishing, setIsPolishing] = useState(false);

  useEffect(() => {
    localStorage.setItem('transport_rows', JSON.stringify(rows));
  }, [rows]);

  useEffect(() => {
    localStorage.setItem('transport_census', JSON.stringify(census));
  }, [census]);

  const handleSaveRow = () => {
    if (!currentEdit.resident) {
      alert("Resident name is required");
      return;
    }

    if (currentEdit.id) {
      setRows(rows.map(r => r.id === currentEdit.id ? (currentEdit as TransportRow) : r));
    } else {
      const newRow: TransportRow = {
        ...(currentEdit as TransportRow),
        id: Math.random().toString(36).substr(2, 9)
      };
      setRows([newRow, ...rows]);
    }
    handleClearForm();
  };

  const handleClearForm = () => {
    setCurrentEdit({
      id: '',
      resident: '',
      status: 'Scheduled',
      apptType: '',
      unit: '',
      room: '',
      location: '',
      apptDate: '',
      apptTime: '',
      transportType: 'Van',
      roundTrip: 'Yes',
      notes: '',
      origin: '',
      phone: '',
      payer: '',
      escort: 'No',
      transportCompany: ''
    });
  };

  const handleEdit = (row: TransportRow) => {
    setCurrentEdit(row);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this transport record?")) {
      setRows(rows.filter(r => r.id !== id));
    }
  };

  const filteredRows = useMemo(() => {
    return rows.filter(r => 
      r.resident.toLowerCase().includes(filter.toLowerCase()) ||
      (r.apptType && r.apptType.toLowerCase().includes(filter.toLowerCase())) ||
      (r.location && r.location.toLowerCase().includes(filter.toLowerCase()))
    );
  }, [rows, filter]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      total: rows.length,
      scheduled: rows.filter(r => r.status === 'Scheduled').length,
      overdue: rows.filter(r => r.apptDueBy && r.apptDueBy < today && r.status !== 'Completed' && r.status !== 'Cancelled').length,
      completed: rows.filter(r => r.status === 'Completed').length
    };
  }, [rows]);

  const handleImportCensus = () => {
    const lines = censusRawText.split('\n').filter(l => l.trim());
    const newCensus: CensusItem[] = lines.map(line => {
      const parts = line.split('|').map(p => p.trim());
      return {
        resident: parts[0] || 'Unknown',
        unit: parts[1] || '',
        room: parts[2] || ''
      };
    }).filter(c => c.resident !== 'Unknown');
    setCensus(newCensus);
    setShowCensusManager(false);
    alert(`Imported ${newCensus.length} residents.`);
  };

  const handleNameInput = (name: string) => {
    setCurrentEdit(prev => ({ ...prev, resident: name }));
    const match = census.find(c => c.resident.toLowerCase() === name.toLowerCase());
    if (match) {
      setCurrentEdit(prev => ({ ...prev, unit: match.unit, room: match.room }));
    }
  };

  const generatedSummary = useMemo(() => {
    if (!currentEdit.resident) return "";
    const parts = [
      `Transport documentation for ${currentEdit.resident} (Unit: ${currentEdit.unit || 'N/A'}, Room: ${currentEdit.room || 'N/A'}).`,
      `Appointment: ${currentEdit.apptType || 'Consult'} scheduled for ${currentEdit.apptDate || 'TBD'} at ${currentEdit.apptTime || 'TBD'}.`,
      `Location: ${currentEdit.location || 'Pending'}.`,
      `Mode: ${currentEdit.transportType || 'Van'} via ${currentEdit.transportCompany || 'Facility/Pending'}. ${currentEdit.roundTrip === 'Yes' ? 'Round-trip requested.' : 'One-way transport.'}`,
      currentEdit.escort === 'Yes' ? 'Escort required for this transport.' : '',
      currentEdit.notes ? `Clinical notes: ${currentEdit.notes}` : ""
    ];
    return parts.filter(Boolean).join(" ");
  }, [currentEdit]);

  const handlePolish = async () => {
    if (!generatedSummary) return;
    setIsPolishing(true);
    const polished = await polishNote(generatedSummary);
    alert("AI Polished Transport Note has been copied to your clipboard!");
    navigator.clipboard.writeText(polished);
    setIsPolishing(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Logs', value: stats.total, color: 'bg-blue-50 text-blue-700' },
          { label: 'Scheduled', value: stats.scheduled, color: 'bg-amber-50 text-amber-700' },
          { label: 'Overdue', value: stats.overdue, color: 'bg-red-50 text-red-700' },
          { label: 'Completed', value: stats.completed, color: 'bg-emerald-50 text-emerald-700' },
        ].map(stat => (
          <div key={stat.label} className={`${stat.color} p-4 rounded-xl border border-current border-opacity-10`}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-3xl font-black">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-4 space-y-6">
          <Card title={currentEdit.id ? "Update Entry" : "New Transport Entry"}>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <Input 
                label="Resident Name *" 
                list="census-list"
                value={currentEdit.resident} 
                onChange={(e) => handleNameInput(e.target.value)} 
                required 
              />
              <datalist id="census-list">
                {census.map(c => <option key={c.resident} value={c.resident} />)}
              </datalist>

              <div className="grid grid-cols-2 gap-4">
                <Select label="Unit" value={currentEdit.unit} onChange={(e) => setCurrentEdit({...currentEdit, unit: e.target.value})} options={[
                  { value: '2', label: 'Unit 2' },
                  { value: '3', label: 'Unit 3' },
                  { value: '4', label: 'Unit 4' }
                ]} />
                <Input label="Room #" value={currentEdit.room} onChange={(e) => setCurrentEdit({...currentEdit, room: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input label="Appt Specialty" value={currentEdit.apptType} onChange={(e) => setCurrentEdit({...currentEdit, apptType: e.target.value})} />
                <Input label="Clinic / Location" value={currentEdit.location} onChange={(e) => setCurrentEdit({...currentEdit, location: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Input label="Appt Date" type="date" value={currentEdit.apptDate} onChange={(e) => setCurrentEdit({...currentEdit, apptDate: e.target.value})} />
                <Input label="Appt Time" type="time" value={currentEdit.apptTime} onChange={(e) => setCurrentEdit({...currentEdit, apptTime: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input label="Transport Company" value={currentEdit.transportCompany} onChange={(e) => setCurrentEdit({...currentEdit, transportCompany: e.target.value})} />
                <Select label="Transport Mode" value={currentEdit.transportType} onChange={(e) => setCurrentEdit({...currentEdit, transportType: e.target.value})} options={[
                  { value: 'Van', label: 'Van' },
                  { value: 'Ambulance', label: 'Ambulance' },
                  { value: 'Car', label: 'Car' },
                  { value: 'Facility', label: 'Facility' }
                ]} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Select label="Round Trip" value={currentEdit.roundTrip} onChange={(e) => setCurrentEdit({...currentEdit, roundTrip: e.target.value})} options={[
                  { value: 'Yes', label: 'Yes' },
                  { value: 'No', label: 'No' }
                ]} />
                <Select label="Escort Req?" value={currentEdit.escort} onChange={(e) => setCurrentEdit({...currentEdit, escort: e.target.value})} options={[
                  { value: 'Yes', label: 'Yes' },
                  { value: 'No', label: 'No' }
                ]} />
              </div>

              <Input label="Payer Source" value={currentEdit.payer} onChange={(e) => setCurrentEdit({...currentEdit, payer: e.target.value})} placeholder="Medicare/Medicaid/Private" />

              <Select label="Status" value={currentEdit.status} onChange={(e) => setCurrentEdit({...currentEdit, status: e.target.value})} options={[
                { value: 'Scheduled', label: 'Scheduled' },
                { value: 'In-Transit', label: 'In-Transit' },
                { value: 'Arrived', label: 'Arrived' },
                { value: 'Completed', label: 'Completed' },
                { value: 'Cancelled', label: 'Cancelled' }
              ]} />

              <Textarea label="Notes" value={currentEdit.notes} onChange={(e) => setCurrentEdit({...currentEdit, notes: e.target.value})} />

              <div className="pt-4 flex gap-2">
                <Button onClick={handleSaveRow} className="flex-1">{currentEdit.id ? 'Update' : 'Add Entry'}</Button>
                <Button variant="outline" onClick={handleClearForm}>Clear</Button>
              </div>
            </div>
          </Card>

          <Card title="Transport Summary (Hand-off)">
             <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-[10px] leading-relaxed min-h-[100px] whitespace-pre-wrap">
               {generatedSummary || "Enter transport details to generate summary..."}
             </div>
             <div className="mt-3 flex gap-2">
                <Button variant="outline" className="flex-1 text-[10px]" onClick={() => navigator.clipboard.writeText(generatedSummary)}>Copy</Button>
                <Button variant="secondary" className="flex-1 text-[10px]" onClick={handlePolish} disabled={isPolishing || !generatedSummary}>
                  {isPolishing ? '...' : '✨ AI Polish'}
                </Button>
             </div>
          </Card>
        </div>

        <div className="xl:col-span-8">
          <Card title="Transport Log">
            <div className="mb-4 flex gap-4">
              <input 
                className="flex-1 px-4 py-2 bg-slate-100 border-none rounded-lg text-sm outline-none" 
                placeholder="Search resident, specialty, or clinic..." 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
              <Button variant="outline" onClick={() => setShowCensusManager(true)}>Manage Census</Button>
            </div>

            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-500 tracking-wider sticky top-0">
                  <tr>
                    <th className="px-4 py-3 border-b border-slate-100">Resident</th>
                    <th className="px-4 py-3 border-b border-slate-100">Unit/Rm</th>
                    <th className="px-4 py-3 border-b border-slate-100">Appt Details</th>
                    <th className="px-4 py-3 border-b border-slate-100">Status</th>
                    <th className="px-4 py-3 border-b border-slate-100">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {filteredRows.length > 0 ? filteredRows.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 group border-b border-slate-100">
                      <td className="px-4 py-3 align-top">
                        <p className="font-bold text-slate-900">{r.resident}</p>
                      </td>
                      <td className="px-4 py-3 align-top text-slate-500 font-medium">
                        {r.unit || '-'} / {r.room || '-'}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <p className="font-bold text-slate-800">{r.apptType || 'General'}</p>
                        <p className="text-[10px] text-slate-500">{r.location || 'No location'}</p>
                        <p className="text-[10px] text-blue-600 font-bold mt-1">
                          {r.apptDate || 'N/A'} @ {r.apptTime || '--:--'}
                        </p>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider ${
                          r.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                          r.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                          r.status === 'In-Transit' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEdit(r)} className="text-blue-600 font-bold hover:underline">Edit</button>
                          <button onClick={() => handleDelete(r.id)} className="text-red-500 font-bold hover:underline">Delete</button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-slate-400 font-bold italic bg-slate-50/50">
                        No transport records found matching search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      {showCensusManager && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Census Management</h3>
              <button onClick={() => setShowCensusManager(false)} className="text-slate-400 hover:text-slate-600 text-2xl">×</button>
            </div>
            <div className="p-6">
              <p className="text-xs text-slate-500 mb-4 font-semibold">Paste census list (format: <code className="bg-slate-100 px-1 py-0.5 rounded">Name | Unit | Room</code>)</p>
              <textarea 
                className="w-full h-64 p-4 border border-slate-200 rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="DOE, JANE | 3 | 312-B"
                value={censusRawText}
                onChange={(e) => setCensusRawText(e.target.value)}
              />
              <div className="mt-6 flex gap-2">
                <Button className="flex-1" onClick={handleImportCensus}>Import Data</Button>
                <Button variant="outline" onClick={() => setShowCensusManager(false)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransportTracker;

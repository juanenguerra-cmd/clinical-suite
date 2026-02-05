
import React, { useState, useMemo } from 'react';
import { Card, Input, Select, Textarea, Button } from '../SharedUI';
import { Recommendation } from '../../types';
import { polishNote } from '../../services/geminiService';

const PsychNoteForm: React.FC = () => {
  const [formData, setFormData] = useState({
    psychDate: '',
    consultType: '',
    trigger: '',
    targetSymptoms: '',
    findings: '',
    capacity: '',
    ppNotified: 'No',
    ppResponse: '',
    ppReason: '',
    notifWho: '',
    repName: '',
    repRel: '',
    consent: '',
    idt: '',
    followUp: '',
    nonpharmOther: '',
    gdrOther: '',
    monitorOther: ''
  });

  const [recs, setRecs] = useState<Recommendation[]>([
    { id: Math.random().toString(), type: '', line: '' }
  ]);

  const [isPolishing, setIsPolishing] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const addRec = () => {
    setRecs([...recs, { id: Math.random().toString(), type: '', line: '' }]);
  };

  const removeRec = (id: string) => {
    setRecs(recs.filter(r => r.id !== id));
  };

  const updateRec = (id: string, field: keyof Recommendation, value: string) => {
    setRecs(recs.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const generatedNote = useMemo(() => {
    const parts: string[] = [];
    
    if (formData.psychDate) {
      parts.push(`Resident evaluated by Psychiatry on ${formData.psychDate} for ${formData.consultType || 'consult'} due to ${formData.trigger || 'noted behaviors'}.`);
    }

    if (formData.findings) parts.push(`Assessment findings: ${formData.findings}.`);

    if (recs.length > 0 && recs[0].line) {
      const recStrings = recs.filter(r => r.line).map(r => `${r.type} ${r.line}`);
      if (recStrings.length > 0) {
        parts.push(`Psychiatry recommends to ${recStrings.join('; ')}.`);
      }
    }

    if (formData.ppNotified === 'Yes') {
      parts.push(`Primary provider notified and ${formData.ppResponse === 'Agreed' ? 'agreed' : 'did not agree'} with recommendations ${formData.ppReason ? '(' + formData.ppReason + ')' : ''}.`);
    }

    if (formData.notifWho) {
      parts.push(`${formData.notifWho} notified of recommendations. ${formData.consent || ''}`);
    }

    if (formData.monitorOther) parts.push(`Monitoring plan: ${formData.monitorOther}.`);

    return parts.join(' ');
  }, [formData, recs]);

  const handlePolish = async () => {
    if (!generatedNote) return;
    setIsPolishing(true);
    const polished = await polishNote(generatedNote);
    alert("AI Polished version has been copied to your clipboard!");
    navigator.clipboard.writeText(polished);
    setIsPolishing(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <Card title="1) Consult Context">
          <Input label="Consult Date" name="psychDate" type="date" value={formData.psychDate} onChange={handleChange} required />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Type" name="consultType" value={formData.consultType} onChange={handleChange} options={[
              { value: 'initial', label: 'Initial' },
              { value: 'follow-up', label: 'Follow-up' }
            ]} />
            <Input label="Seen Due To" name="trigger" value={formData.trigger} onChange={handleChange} required />
          </div>
          <Textarea label="Target Symptoms" name="targetSymptoms" value={formData.targetSymptoms} onChange={handleChange} />
        </Card>

        <Card title="2) Recommendations">
          {recs.map((rec, index) => (
            <div key={rec.id} className="p-4 border border-slate-100 rounded-lg mb-4 bg-slate-50/50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-black text-blue-900"># {index + 1}</span>
                {recs.length > 1 && <Button variant="ghost" className="text-red-500" onClick={() => removeRec(rec.id)}>×</Button>}
              </div>
              <Select label="Action" value={rec.type} onChange={(e) => updateRec(rec.id, 'type', e.target.value)} options={[
                { value: 'Start', label: 'Start' },
                { value: 'Discontinue', label: 'Discontinue' },
                { value: 'Taper', label: 'Taper' },
                { value: 'Dose Change', label: 'Dose Change' }
              ]} />
              <Input label="Medication / Dose / Freq" value={rec.line} onChange={(e) => updateRec(rec.id, 'line', e.target.value)} placeholder="e.g. Sertraline 25mg PO QD" />
            </div>
          ))}
          <Button variant="outline" onClick={addRec} className="w-full">+ Add Recommendation</Button>
        </Card>

        <Card title="3) Assessment & Notifications">
          <Textarea label="Psych Findings Summary" name="findings" value={formData.findings} onChange={handleChange} />
          <div className="flex gap-4 mb-4">
            <span className="text-xs font-bold text-slate-700">MD Notified?</span>
            <label className="flex items-center gap-2 text-sm"><input type="radio" name="ppNotified" value="Yes" checked={formData.ppNotified === 'Yes'} onChange={handleChange} /> Yes</label>
            <label className="flex items-center gap-2 text-sm"><input type="radio" name="ppNotified" value="No" checked={formData.ppNotified === 'No'} onChange={handleChange} /> No</label>
          </div>
          {formData.ppNotified === 'Yes' && (
            <div className="grid grid-cols-2 gap-4">
              <Select label="Agreement" name="ppResponse" value={formData.ppResponse} onChange={handleChange} options={[
                { value: 'Agreed', label: 'Agreed' },
                { value: 'Did not agree', label: 'Did not agree' }
              ]} />
              <Input label="Reason (if applicable)" name="ppReason" value={formData.ppReason} onChange={handleChange} />
            </div>
          )}
        </Card>
      </div>

      <div className="sticky top-24">
        <Card title="Live Note Preview">
          <div className="bg-slate-900 text-slate-200 p-6 rounded-xl font-mono text-sm min-h-[300px] whitespace-pre-wrap leading-relaxed">
            {generatedNote || "Complete the form to generate note..."}
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={() => navigator.clipboard.writeText(generatedNote)} className="flex-1">Copy Note</Button>
            <Button variant="secondary" onClick={handlePolish} disabled={isPolishing} className="flex-1">
              {isPolishing ? 'Polishing...' : '✨ AI Polish'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PsychNoteForm;

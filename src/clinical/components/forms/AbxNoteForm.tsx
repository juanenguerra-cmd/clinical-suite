
import React, { useState, useMemo } from 'react';
import { Card, Input, Textarea, Button } from '../SharedUI';
import { polishNote } from '../../services/geminiService';

const AbxNoteForm: React.FC = () => {
  const [data, setData] = useState({
    abx: '',
    problem: '',
    startDate: '',
    endDate: '',
    temp: '',
    bp: '',
    sx: 'Stable, no acute changes.',
    tolerance: 'Tolerating well, no adverse reactions.',
    other: ''
  });

  const [isPolishing, setIsPolishing] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const generatedNote = useMemo(() => {
    return `Resident currently receiving ${data.abx} for treatment of ${data.problem}. Treatment started ${data.startDate}. Vitals: T ${data.temp}, BP ${data.bp}. Signs/symptoms: ${data.sx}. ${data.tolerance} ${data.other}`;
  }, [data]);

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
        <Card title="Treatment Details">
          <Input label="Antibiotic" name="abx" value={data.abx} onChange={handleChange} placeholder="Ceftriaxone 1g IV" />
          <Input label="Indication" name="problem" value={data.problem} onChange={handleChange} placeholder="UTI" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" name="startDate" type="date" value={data.startDate} onChange={handleChange} />
            <Input label="End Date" name="endDate" type="date" value={data.endDate} onChange={handleChange} />
          </div>
        </Card>
        <Card title="Clinical Findings">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Temp" name="temp" value={data.temp} onChange={handleChange} />
            <Input label="BP" name="bp" value={data.bp} onChange={handleChange} />
          </div>
          <Textarea label="Symptoms/Response" name="sx" value={data.sx} onChange={handleChange} />
          <Textarea label="Tolerance" name="tolerance" value={data.tolerance} onChange={handleChange} />
        </Card>
      </div>
      <div className="sticky top-24">
        <Card title="Live Note Preview">
          <div className="bg-slate-900 text-slate-200 p-6 rounded-xl font-mono text-sm min-h-[300px] whitespace-pre-wrap leading-relaxed">
            {generatedNote}
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

export default AbxNoteForm;

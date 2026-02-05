
import React, { useState, useMemo } from 'react';
import { Card, Input, Textarea, Button, Select } from '../SharedUI';
import { polishNote } from '../../services/geminiService';

const AccidentNoteForm: React.FC = () => {
  const [data, setData] = useState({
    date: '',
    day: '1',
    injury: 'No injury observed.',
    symptoms: 'Denies pain or distress.',
    assessment: 'Baseline neuro and physical status unchanged.'
  });

  const [isPolishing, setIsPolishing] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const generatedNote = useMemo(() => {
    return `S/p Fall Day ${data.day}/3 Follow-up. Incident date: ${data.date}. Injury status: ${data.injury}. Symptoms: ${data.symptoms}. Assessment: ${data.assessment} Will continue to monitor for 72 hours.`;
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
        <Card title="Incident Reference">
          <Input label="Incident Date" name="date" type="date" value={data.date} onChange={handleChange} required />
          <Select label="Follow-up Day" name="day" value={data.day} onChange={handleChange} options={[
            { value: '1', label: 'Day 1' },
            { value: '2', label: 'Day 2' },
            { value: '3', label: 'Day 3' }
          ]} />
        </Card>
        <Card title="Observation">
          <Textarea label="Injury Details" name="injury" value={data.injury} onChange={handleChange} />
          <Textarea label="Current Symptoms" name="symptoms" value={data.symptoms} onChange={handleChange} />
          <Textarea label="Clinical Assessment" name="assessment" value={data.assessment} onChange={handleChange} />
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

export default AccidentNoteForm;

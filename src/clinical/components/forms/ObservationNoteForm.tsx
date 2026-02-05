
import React, { useState, useMemo } from 'react';
import { Card, Input, Textarea, Button } from '../SharedUI';
import { polishNote } from '../../services/geminiService';

const ObservationNoteForm: React.FC = () => {
  const [data, setData] = useState({
    admDate: '',
    day: '',
    vitals: '',
    summary: '',
    interventions: '',
    response: 'Resting comfortably.'
  });

  const [isPolishing, setIsPolishing] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const generatedNote = useMemo(() => {
    return `Admission Observation Day ${data.day}/7. Vitals: ${data.vitals}. Shift summary: ${data.summary}. Interventions: ${data.interventions}. Response: ${data.response}`;
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
        <Card title="Admission Tracking">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Admit Date" name="admDate" type="date" value={data.admDate} onChange={handleChange} />
            <Input label="Day #" name="day" value={data.day} onChange={handleChange} placeholder="e.g. 3" />
          </div>
          <Input label="Vitals" name="vitals" value={data.vitals} onChange={handleChange} placeholder="T 98.6, BP 120/80" />
        </Card>
        <Card title="Shift Details">
          <Textarea label="Observations" name="summary" value={data.summary} onChange={handleChange} />
          <Textarea label="Interventions" name="interventions" value={data.interventions} onChange={handleChange} />
          <Input label="Response" name="response" value={data.response} onChange={handleChange} />
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

export default ObservationNoteForm;


import React, { useState, useMemo } from 'react';
import { Card, Textarea, Button, Select } from '../SharedUI';
import { polishNote } from '../../services/geminiService';

const VaxForm: React.FC = () => {
  const [data, setData] = useState({
    covid: 'declined',
    flu: 'accepted',
    pneumo: 'history',
    rsv: 'declined',
    education: 'Vaccine education provided regarding purpose and potential side effects.'
  });

  const [isPolishing, setIsPolishing] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const generatedNote = useMemo(() => {
    return `Vaccinations offered per protocol. COVID-19: ${data.covid}; Influenza: ${data.flu}; Pneumonia: ${data.pneumo}; RSV: ${data.rsv}. ${data.education} Resident verbalized understanding. Will continue to monitor.`;
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
        <Card title="Vaccine Status">
          <div className="grid grid-cols-2 gap-4">
            <Select label="COVID-19" name="covid" value={data.covid} onChange={handleChange} options={[
              { value: 'accepted', label: 'Accepted' },
              { value: 'declined', label: 'Declined' },
              { value: 'history', label: 'History' }
            ]} />
            <Select label="Flu" name="flu" value={data.flu} onChange={handleChange} options={[
              { value: 'accepted', label: 'Accepted' },
              { value: 'declined', label: 'Declined' },
              { value: 'history', label: 'History' }
            ]} />
            <Select label="Pneumonia" name="pneumo" value={data.pneumo} onChange={handleChange} options={[
              { value: 'accepted', label: 'Accepted' },
              { value: 'declined', label: 'Declined' },
              { value: 'history', label: 'History' }
            ]} />
            <Select label="RSV" name="rsv" value={data.rsv} onChange={handleChange} options={[
              { value: 'accepted', label: 'Accepted' },
              { value: 'declined', label: 'Declined' },
              { value: 'history', label: 'History' }
            ]} />
          </div>
        </Card>
        <Card title="Documentation">
          <Textarea label="Education Notes" name="education" value={data.education} onChange={handleChange} />
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

export default VaxForm;

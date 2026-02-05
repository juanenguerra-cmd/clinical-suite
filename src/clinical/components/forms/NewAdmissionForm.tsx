
import React, { useState, useMemo } from 'react';
import { Card, Input, Textarea, Button, Select } from '../SharedUI';
import { polishNote } from '../../services/geminiService';

const NewAdmissionForm: React.FC = () => {
  const [data, setData] = useState({
    admitDate: '',
    type: 'New admission',
    from: '',
    dx: '',
    allergies: 'NKDA',
    vitals: '',
    skin: 'Intact, no issues noted.',
    plan: ''
  });

  const [isPolishing, setIsPolishing] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const generatedNote = useMemo(() => {
    return `${data.type} on ${data.admitDate} from ${data.from}. Primary diagnoses: ${data.dx}. Allergies: ${data.allergies}. Vitals: ${data.vitals}. Skin assessment: ${data.skin}. Monitoring plan: ${data.plan}`;
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
        <Card title="Admission Header">
          <Input label="Admit Date" name="admitDate" type="date" value={data.admitDate} onChange={handleChange} />
          <Select label="Type" name="type" value={data.type} onChange={handleChange} options={[
            { value: 'New admission', label: 'New Admission' },
            { value: 'Re-admission', label: 'Re-Admission' }
          ]} />
          <Input label="From Facility" name="from" value={data.from} onChange={handleChange} />
        </Card>
        <Card title="Assessment">
          <Textarea label="Primary DX" name="dx" value={data.dx} onChange={handleChange} />
          <Input label="Allergies" name="allergies" value={data.allergies} onChange={handleChange} />
          <Input label="Vitals" name="vitals" value={data.vitals} onChange={handleChange} />
          <Textarea label="Skin" name="skin" value={data.skin} onChange={handleChange} />
          <Textarea label="Plan" name="plan" value={data.plan} onChange={handleChange} />
        </Card>
      </div>
      <div className="sticky top-24">
        <Card title="Live Note Preview">
          <div className="bg-slate-900 text-slate-200 p-6 rounded-xl font-mono text-sm min-h-[400px] whitespace-pre-wrap leading-relaxed">
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

export default NewAdmissionForm;


import React, { useState, useMemo } from 'react';
import { Card, Input, Textarea, Button } from '../SharedUI';
import { polishNote } from '../../services/geminiService';

const ExpiryNoteForm: React.FC = () => {
  const [data, setData] = useState({
    shiftStart: '',
    discoverTime: '',
    location: '',
    shiftStartNote: '',
    objective: 'Found unresponsive. No respirations noted. No palpable pulse. Skin cool to touch, pale/cyanotic. Pupils fixed/dilated. No BP obtainable.',
    codeStatus: '',
    resus: '',
    notified: '',
    pronounceTime: '',
    famNotified: '',
    famName: '',
    pmCare: '',
    belongings: ''
  });

  const [isPolishing, setIsPolishing] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const generatedNote = useMemo(() => {
    return `At the start of the shift (${data.shiftStart || 'noted'}), resident was ${data.shiftStartNote || 'stable'}. At approximately ${data.discoverTime}, resident was found unresponsive in ${data.location}. Objective findings: ${data.objective}. Code status: ${data.codeStatus}. Resuscitative measures: ${data.resus}. Pronounced at ${data.pronounceTime}. Notifications: ${data.notified}. Family (${data.famName}) notified: ${data.famNotified}. Post-mortem care: ${data.pmCare}. Belongings: ${data.belongings}.`;
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
        <Card title="Shift Context">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Shift Start" name="shiftStart" value={data.shiftStart} onChange={handleChange} placeholder="7:00 AM" />
            <Input label="Discovery Time" name="discoverTime" value={data.discoverTime} onChange={handleChange} placeholder="2:15 AM" />
          </div>
          <Input label="Location" name="location" value={data.location} onChange={handleChange} placeholder="Room 201" />
          <Textarea label="Situation at Start" name="shiftStartNote" value={data.shiftStartNote} onChange={handleChange} />
        </Card>
        <Card title="Assessment & Care">
          <Textarea label="Objective Findings" name="objective" value={data.objective} onChange={handleChange} />
          <Input label="Code Status" name="codeStatus" value={data.codeStatus} onChange={handleChange} placeholder="DNR / Full Code" />
          <Textarea label="Resuscitation Steps" name="resus" value={data.resus} onChange={handleChange} />
          <Textarea label="PM Care Completed" name="pmCare" value={data.pmCare} onChange={handleChange} />
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

export default ExpiryNoteForm;

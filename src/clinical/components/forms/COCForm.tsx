
import React, { useState, useMemo } from 'react';
import { Card, Input, Textarea, Button } from '../SharedUI';
import { polishNote } from '../../services/geminiService';

const COCForm: React.FC = () => {
  const [data, setData] = useState({
    issue: '',
    onset: '',
    vitals: '',
    assessment: '',
    md: '',
    orders: '',
    fam: ''
  });

  const [isPolishing, setIsPolishing] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const generatedNote = useMemo(() => {
    return `Resident exhibited a change in condition noted as ${data.issue}. Onset: ${data.onset}. Vitals: ${data.vitals}. Physical exam: ${data.assessment}. MD (${data.md}) notified and ordered: ${data.orders}. Family (${data.fam}) updated. Will continue to monitor.`;
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
        <Card title="Condition Details">
          <Input label="Current Issue" name="issue" value={data.issue} onChange={handleChange} placeholder="e.g. increased confusion" />
          <Input label="Onset" name="onset" value={data.onset} onChange={handleChange} />
          <Input label="Vitals" name="vitals" value={data.vitals} onChange={handleChange} />
          <Textarea label="Assessment" name="assessment" value={data.assessment} onChange={handleChange} />
        </Card>
        <Card title="Communication">
          <Input label="MD Name" name="md" value={data.md} onChange={handleChange} />
          <Textarea label="New Orders" name="orders" value={data.orders} onChange={handleChange} />
          <Input label="Family Rep" name="fam" value={data.fam} onChange={handleChange} />
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

export default COCForm;

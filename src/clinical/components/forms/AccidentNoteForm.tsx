import React, { useMemo, useState } from 'react';
import { Card, Input, Textarea, Button, Select } from '../SharedUI';
import { polishNote } from '../../services/geminiService';

type InjuryStatus = '' | 'No injury observed or reported' | 'Injury present' | 'Unable to fully assess at this time';
type Shift = '' | 'Day shift' | 'Evening shift' | 'Night shift';

type AccidentFormData = {
  incidentDate: string;
  shift: Shift;
  injury: InjuryStatus;
  incidentRef: string;
  injuryDetails: string;
  symptoms: string;
  assessment: string;
};

const initialData: AccidentFormData = {
  incidentDate: '',
  shift: '',
  injury: '',
  incidentRef: '',
  injuryDetails: '',
  symptoms: 'Denies pain; denies dizziness/lightheadedness; no headache; no nausea/vomiting; no new complaints; at baseline.',
  assessment: 'Resident appears at baseline with no acute distress observed. Skin intact; no new bruising/bleeding noted. Neuro status unchanged from baseline.'
};

const clean = (s: string) => s.replace(/\s+/g, ' ').trim();
const capFirst = (s: string) => {
  const text = clean(s);
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};
const ensurePeriod = (s: string) => {
  const text = clean(s);
  if (!text) return '';
  return /[.!?]$/.test(text) ? text : `${text}.`;
};

const computeDayFromIncidentDate = (ymd: string) => {
  const start = new Date(`${ymd}T12:00:00`);
  const now = new Date();
  const diff = Math.floor((now.getTime() - start.getTime()) / 86400000) + 1;
  return Math.min(3, Math.max(1, diff));
};

const AccidentNoteForm: React.FC = () => {
  const [data, setData] = useState<AccidentFormData>(initialData);
  const [isPolishing, setIsPolishing] = useState(false);

  const followDay = useMemo(() => {
    if (!data.incidentDate) return '';
    return `Day ${computeDayFromIncidentDate(data.incidentDate)}/3`;
  }, [data.incidentDate]);

  const missingRequired = useMemo(() => {
    const missing: string[] = [];
    if (!data.incidentDate) missing.push('Date of incident');
    if (!clean(data.symptoms)) missing.push('Symptoms / complaints');
    if (!clean(data.assessment)) missing.push('Objective assessment');
    return missing;
  }, [data.incidentDate, data.symptoms, data.assessment]);

  const generatedNote = useMemo(() => {
    const day = data.incidentDate ? computeDayFromIncidentDate(data.incidentDate) : null;
    const injuryLabel =
      data.injury === 'Injury present'
        ? 'Injury'
        : data.injury === 'No injury observed or reported'
          ? 'Non-injury'
          : '';

    const prefix = day ? (injuryLabel ? `S/p ${injuryLabel} Fall Day ${day}/3` : `S/p Fall Day ${day}/3`) : '';
    const header = ensurePeriod([prefix, clean(data.shift)].filter(Boolean).join(' - '));

    const lines: string[] = [];
    if (header) lines.push(header);

    const incidentRef = capFirst(data.incidentRef);
    if (incidentRef) lines.push(ensurePeriod(`Post-incident follow-up: ${incidentRef}`));

    if (data.injury === 'Injury present') {
      const injuryDetails = capFirst(data.injuryDetails);
      lines.push(ensurePeriod(injuryDetails ? `Injury noted: ${injuryDetails}` : 'Injury noted; details not specified.'));
    }

    const symptoms = capFirst(data.symptoms);
    if (symptoms) lines.push(ensurePeriod(`Post-incident symptoms: ${symptoms}`));

    const assessment = capFirst(data.assessment);
    if (assessment) lines.push(ensurePeriod(`Assessment: ${assessment}`));

    return lines
      .join(' ')
      .replace(/\s{2,}/g, ' ')
      .replace(/\s+([.,;:!?])/g, '$1')
      .trim();
  }, [data]);

  const previewText = missingRequired.length
    ? `Missing required fields (copy disabled):\n- ${missingRequired.join('\n- ')}\n\n--- Preview (partial) ---\n\n${generatedNote}`
    : generatedNote || 'Fill the form to generate the note preview…';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCopy = async () => {
    if (missingRequired.length || !generatedNote) return;

    try {
      await navigator.clipboard.writeText(generatedNote);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = generatedNote;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
  };

  const handlePolish = async () => {
    if (!generatedNote) return;
    setIsPolishing(true);
    const polished = await polishNote(generatedNote);
    await navigator.clipboard.writeText(polished);
    alert('Optimized note has been copied to your clipboard!');
    setIsPolishing(false);
  };

  const handleOptimize = () => {
    if (!generatedNote) return;
    const optimized = generatedNote
      .replace(/\s+/g, ' ')
      .replace(/\s+\./g, '.')
      .replace(/\.\s+/g, '. ')
      .replace(/\.+/g, '.')
      .trim();

    const symptomsMatch = optimized.match(/Post-incident symptoms:\s*(.*?)(?=\s+Assessment:|$)/i);
    const assessmentMatch = optimized.match(/Assessment:\s*(.*)$/i);

    if (symptomsMatch || assessmentMatch) {
      setData((prev) => ({
        ...prev,
        symptoms: symptomsMatch ? symptomsMatch[1].trim() : prev.symptoms,
        assessment: assessmentMatch ? assessmentMatch[1].trim() : prev.assessment
      }));
    }
  };

  const handleClear = () => setData({ ...initialData, symptoms: '', assessment: '' });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <Card title="1) Incident Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Input label="Date of incident" required name="incidentDate" type="date" value={data.incidentDate} onChange={handleChange} />
              <p className="-mt-2 mb-4 text-xs text-slate-500">Used to auto-calculate follow-up day (Day 1/3 to Day 3/3).</p>
            </div>
            <Input
              label="Follow-up day (auto)"
              name="followDay"
              value={followDay}
              readOnly
              placeholder="Auto-calculated from incident date"
              className="bg-slate-100 border-slate-300 text-slate-700"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Select
              label="Shift (optional)"
              name="shift"
              value={data.shift}
              onChange={handleChange}
              options={[
                { value: 'Day shift', label: 'Day shift' },
                { value: 'Evening shift', label: 'Evening shift' },
                { value: 'Night shift', label: 'Night shift' }
              ]}
            />
            <Select
              label="Injury status (optional)"
              name="injury"
              value={data.injury}
              onChange={handleChange}
              options={[
                { value: 'No injury observed or reported', label: 'No injury observed or reported' },
                { value: 'Injury present', label: 'Injury present' },
                { value: 'Unable to fully assess at this time', label: 'Unable to fully assess at this time' }
              ]}
            />
          </div>

          <Textarea label="Brief incident reference (optional)" name="incidentRef" value={data.incidentRef} onChange={handleChange} placeholder="Follow-up to fall/accident; wheelchair slip; etc." />
          <Input label="Injury details (optional)" name="injuryDetails" value={data.injuryDetails} onChange={handleChange} placeholder="Bruise, swelling, skin tear, etc." />

          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mt-6 mb-3">2) Current Status</h3>
          <Textarea label="Symptoms / complaints" required name="symptoms" value={data.symptoms} onChange={handleChange} rows={4} />
          <Textarea label="Objective assessment" required name="assessment" value={data.assessment} onChange={handleChange} rows={4} />
          <p className="-mt-2 text-xs text-slate-500">Edit as needed (you may delete or add more detail).</p>
        </Card>
      </div>

      <div className="space-y-6 lg:sticky lg:top-24 h-fit">
        <Card title="Preview">
          <div className={`p-4 rounded-xl font-mono text-sm min-h-[240px] whitespace-pre-wrap leading-relaxed ${missingRequired.length ? 'bg-red-950 text-red-100 border-2 border-red-500' : 'bg-slate-950 text-slate-200'}`}>
            {previewText}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={handleCopy} disabled={Boolean(missingRequired.length)} className="flex-1 min-w-[120px]">Copy Note</Button>
            <Button variant="secondary" onClick={handleOptimize} className="flex-1 min-w-[120px]">Optimize Note</Button>
            <Button variant="outline" onClick={handlePolish} disabled={isPolishing || !generatedNote} className="flex-1 min-w-[120px]">
              {isPolishing ? 'Polishing...' : '✨ AI Polish'}
            </Button>
            <Button variant="ghost" onClick={handleClear} className="flex-1 min-w-[120px]">Clear</Button>
          </div>

          <p className="mt-3 text-xs text-slate-500">Verify accuracy before signing; this tool does not replace clinical judgment.</p>
        </Card>
      </div>
    </div>
  );
};

export default AccidentNoteForm;

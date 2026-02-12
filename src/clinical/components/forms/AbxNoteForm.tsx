import React, { useMemo, useState } from 'react';
import { Card, Input, Select, Textarea, Button } from '../SharedUI';
import { polishNote } from '../../services/geminiService';

interface AbxFormData {
  abxLine: string;
  abxProblem: string;
  startDate: string;
  endDate: string;
  adminStatus: string;
  shift: string;
  temp: string;
  hr: string;
  rr: string;
  bp: string;
  sx: string;
  tolerance: string;
  provider: string;
  other: string;
}

const INITIAL_DATA: AbxFormData = {
  abxLine: '',
  abxProblem: '',
  startDate: '',
  endDate: '',
  adminStatus: '',
  shift: '',
  temp: '',
  hr: '',
  rr: '',
  bp: '',
  sx: 'No acute change in condition noted at this time. Signs and symptoms of infection stable.',
  tolerance: 'Resident denies pain, nausea, vomiting, diarrhea, itching, rash, shortness of breath, or other signs of adverse reaction.',
  provider: '',
  other: '',
};

const clean = (s: string): string => s.replace(/\s+/g, ' ').trim();
const has = (s: string): boolean => clean(s).length > 0;
const ensurePeriod = (s: string): string => {
  const formatted = clean(s);
  if (!formatted) return '';
  return /[.!?]$/.test(formatted) ? formatted : `${formatted}.`;
};

const parseDate = (value: string): Date | null => {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const daysBetween = (a: Date, b: Date): number => Math.floor((b.getTime() - a.getTime()) / (24 * 60 * 60 * 1000));

const AbxNoteForm: React.FC = () => {
  const [data, setData] = useState<AbxFormData>(INITIAL_DATA);
  const [isPolishing, setIsPolishing] = useState(false);

  const handleInputChange = (field: keyof AbxFormData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const abxDayAuto = useMemo(() => {
    const start = parseDate(data.startDate);
    const end = parseDate(data.endDate);

    if (!start) return '';

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (end) {
      const total = daysBetween(start, end) + 1;
      const day = daysBetween(start, today) + 1;
      const dayClamped = Math.max(1, Math.min(total, day));
      const post = daysBetween(end, today);

      if (post >= 1 && post <= 3) {
        return `Post-therapy Day ${post}/3`;
      }

      return `Day ${dayClamped}/${total}`;
    }

    const day = daysBetween(start, today) + 1;
    return `Day ${Math.max(1, day)}/?`;
  }, [data.startDate, data.endDate]);

  const generatedNote = useMemo(() => {
    const vitals: string[] = [];
    if (has(data.temp)) vitals.push(`T ${clean(data.temp)}`);
    if (has(data.hr)) vitals.push(`HR ${clean(data.hr)}`);
    if (has(data.rr)) vitals.push(`RR ${clean(data.rr)}`);
    if (has(data.bp)) vitals.push(`BP ${clean(data.bp)}`);

    const vitalsStr = vitals.length ? vitals.join(', ') : 'not documented this shift';
    const infectionStatus = has(data.sx) ? clean(data.sx) : 'stable';
    const tolerance = has(data.tolerance)
      ? ensurePeriod(data.tolerance)
      : 'No adverse effects reported; tolerating antibiotic well.';
    const education = has(data.other)
      ? ensurePeriod(data.other)
      : 'Education provided regarding purpose of antibiotic and importance of completing therapy. Resident verbalized understanding.';
    const provider = has(data.provider)
      ? ensurePeriod(data.provider)
      : 'Primary provider will be notified of any significant findings.';

    const parts: string[] = [];

    if (has(data.abxLine)) {
      parts.push(
        `Resident currently receiving antibiotic therapy on ${abxDayAuto || 'current treatment day'} as ordered for treatment of ${has(data.abxProblem) ? clean(data.abxProblem) : 'infection'}.`,
      );
      parts.push('Resident assessed for effectiveness and adverse reactions.');
    }

    parts.push(tolerance);
    parts.push('No allergic response observed.');
    parts.push(`Vital signs monitored; ${vitalsStr}.`);
    parts.push(`Signs and symptoms of infection ${infectionStatus}.`);
    parts.push('Resident continues to tolerate antibiotic therapy without complications.');
    parts.push(education);
    parts.push('Plan to continue monitoring for therapeutic response, adverse effects, and changes in condition.');
    parts.push(provider);

    return clean(parts.join(' ').replace(/\s+\./g, '.').replace(/\.\.+/g, '.'));
  }, [data, abxDayAuto]);

  const missingFields = useMemo(() => {
    const missing: string[] = [];
    if (!has(data.abxLine)) missing.push('Antibiotic line');
    if (!has(data.startDate)) missing.push('Start date');
    if (!has(data.adminStatus)) missing.push('Administration status');
    return missing;
  }, [data.abxLine, data.startDate, data.adminStatus]);

  const displayNote = useMemo(() => {
    if (!missingFields.length) return generatedNote || 'Fill the form to generate the note preview…';

    return `Missing required fields (copy disabled):\n- ${missingFields.join('\n- ')}\n\n--- Preview (partial) ---\n\n${generatedNote}`;
  }, [generatedNote, missingFields]);

  const handleCopy = async () => {
    if (missingFields.length) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(generatedNote);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = generatedNote;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      alert('✅ Note copied to clipboard!');
    } catch {
      alert('❌ Copy failed. Please select and copy manually.');
    }
  };

  const handlePolish = async () => {
    if (!generatedNote) return;

    setIsPolishing(true);
    try {
      const polished = await polishNote(generatedNote);
      await navigator.clipboard.writeText(polished);
      alert('✨ AI-polished note copied to clipboard!');
    } catch {
      alert('❌ AI polish failed. Please try again.');
    } finally {
      setIsPolishing(false);
    }
  };

  const handleOptimize = () => {
    setData((prev) => {
      const next = { ...prev };
      (Object.keys(next) as Array<keyof AbxFormData>).forEach((key) => {
        next[key] = clean(next[key]);
      });
      return next;
    });
  };

  const handleClear = () => {
    if (!window.confirm('Clear all antibiotic note fields?')) return;
    setData(INITIAL_DATA);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <Card title="1) Treatment Details">
          <Input
            label="Antibiotic (one line)"
            name="abxLine"
            value={data.abxLine}
            onChange={(e) => handleInputChange('abxLine', e.target.value)}
            placeholder="Ceftriaxone 1 g IV q12h"
            required
          />
          <Input
            label="Problem / indication"
            name="abxProblem"
            value={data.abxProblem}
            onChange={(e) => handleInputChange('abxProblem', e.target.value)}
            placeholder="UTI, pneumonia, cellulitis"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Start date"
              name="startDate"
              type="date"
              value={data.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              required
            />
            <Input
              label="End date"
              name="endDate"
              type="date"
              value={data.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
            />
          </div>
          <Input label="Antibiotic day (auto)" name="abxDayAuto" value={abxDayAuto} readOnly placeholder="Auto-calculated" />
          <Select
            label="Administration status"
            name="adminStatus"
            value={data.adminStatus}
            onChange={(e) => handleInputChange('adminStatus', e.target.value)}
            options={[
              { value: 'Administered as ordered', label: 'Administered as ordered' },
              { value: 'Refused', label: 'Refused' },
              { value: 'Held', label: 'Held' },
              { value: 'Discontinued', label: 'Discontinued' },
            ]}
            required
          />
          <Select
            label="Shift"
            name="shift"
            value={data.shift}
            onChange={(e) => handleInputChange('shift', e.target.value)}
            options={[
              { value: 'Day shift', label: 'Day shift' },
              { value: 'Evening shift', label: 'Evening shift' },
              { value: 'Night shift', label: 'Night shift' },
            ]}
          />
        </Card>

        <Card title="2) Daily assessment">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="Temp" name="temp" value={data.temp} onChange={(e) => handleInputChange('temp', e.target.value)} placeholder="98.6°F" />
            <Input label="HR" name="hr" value={data.hr} onChange={(e) => handleInputChange('hr', e.target.value)} placeholder="82" />
            <Input label="RR" name="rr" value={data.rr} onChange={(e) => handleInputChange('rr', e.target.value)} placeholder="18" />
          </div>
          <Input label="BP" name="bp" value={data.bp} onChange={(e) => handleInputChange('bp', e.target.value)} placeholder="120/78" />
          <Textarea
            label="Resident symptoms / response"
            name="sx"
            value={data.sx}
            onChange={(e) => handleInputChange('sx', e.target.value)}
          />
          <Textarea
            label="Tolerance / adverse effects"
            name="tolerance"
            value={data.tolerance}
            onChange={(e) => handleInputChange('tolerance', e.target.value)}
          />
          <Input
            label="Provider / notifications (optional)"
            name="provider"
            value={data.provider}
            onChange={(e) => handleInputChange('provider', e.target.value)}
            placeholder="MD notified; no new orders"
          />
          <Textarea
            label="Other clinical notes (optional)"
            name="other"
            value={data.other}
            onChange={(e) => handleInputChange('other', e.target.value)}
            placeholder="isolation, labs pending, encourage fluids"
          />
        </Card>
      </div>

      <div className="sticky top-24">
        <Card title="Preview">
          <div className={`p-6 rounded-xl font-mono text-sm min-h-[300px] whitespace-pre-wrap leading-relaxed ${missingFields.length ? 'bg-red-950/80 text-red-100 border border-red-500' : 'bg-slate-900 text-slate-200'}`}>
            {displayNote}
          </div>
          <div className="mt-4 flex gap-2 flex-wrap">
            <Button onClick={handleCopy} className="flex-1" disabled={missingFields.length > 0}>Copy Note</Button>
            <Button variant="secondary" onClick={handleOptimize} className="flex-1">Optimise Note</Button>
            <Button variant="outline" onClick={handleClear} className="flex-1">Clear</Button>
            <Button variant="ghost" onClick={handlePolish} disabled={isPolishing || !generatedNote} className="flex-1">
              {isPolishing ? 'Polishing...' : '✨ AI Polish'}
            </Button>
          </div>
          <p className="mt-3 text-xs text-slate-600">
            <strong className="text-blue-900">Audit reminder:</strong> Verify accuracy before signing; this tool does not replace clinical judgment.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default AbxNoteForm;

import React, { useMemo, useState } from 'react';

type VaccineState = 'accepted' | 'declined' | 'history' | '';

type VaxData = {
  admissionDate: string;
  patientAge: string;
  patientGender: string;
  admissionSource: string;
  orientation: string;
  bimsScore: string;
  consentMethod: string;
  primaryDiagnosis: string;
  secondaryDiagnoses: string;
  ecName: string;
  covid: VaccineState;
  rsv: VaccineState;
  flu: VaccineState;
  pneumonia: VaccineState;
  hepC: Exclude<VaccineState, 'history'>;
  painMedEducation: boolean;
  vaccineEducation: string;
  hepCEducation: string;
  painEducation: string;
  understandingNotes: string;
  physicianNotified: boolean;
  currentStatus: string;
};

const initialData: VaxData = {
  admissionDate: '',
  patientAge: '',
  patientGender: '',
  admissionSource: '',
  orientation: '',
  bimsScore: '',
  consentMethod: '',
  primaryDiagnosis: '',
  secondaryDiagnoses: '',
  ecName: '',
  covid: '',
  rsv: '',
  flu: '',
  pneumonia: '',
  hepC: '',
  painMedEducation: false,
  vaccineEducation: 'Vaccine education was provided regarding purpose, benefits, and potential side effects.',
  hepCEducation: 'Education on the importance of screening and prevention was provided.',
  painEducation: 'Pain medication education was completed with the resident, including medication purpose, schedule, and potential side effects.',
  understandingNotes: 'Resident verbalized understanding.',
  physicianNotified: false,
  currentStatus: 'Resident remains stable at this time with no acute distress noted.'
};

const VaxForm: React.FC = () => {
  const [data, setData] = useState<VaxData>(initialData);
  const [previewOverride, setPreviewOverride] = useState<string | null>(null);

  const setField = (field: keyof VaxData, value: string | boolean) => {
    setData(prev => ({ ...prev, [field]: value }));
    setPreviewOverride(null);
  };

  const anyVaxSelected = useMemo(
    () => Boolean(data.covid || data.rsv || data.flu || data.pneumonia || data.hepC),
    [data.covid, data.rsv, data.flu, data.pneumonia, data.hepC]
  );

  const smartGrammar = (txt: string) => {
    let t = (txt || '').replace(/\s+/g, ' ').trim();
    t = t.replace(/\s*,\s*/g, ', ').replace(/\s*\.\s*/g, '. ').replace(/\s*;\s*/g, '; ');
    t = t.replace(/\. ([a-z])/g, (_, c) => `. ${c.toUpperCase()}`);
    return t.replace(/\s{2,}/g, ' ').trim();
  };

  const removeDups = (text: string) => {
    const phrases = [
      'vaccine education was provided',
      'education was provided regarding',
      'education on the importance of'
    ];
    let cleaned = text || '';
    phrases.forEach((p) => {
      const re = new RegExp(`(${p}[^.]*\\.\\s*)\\1`, 'gi');
      cleaned = cleaned.replace(re, '$1');
    });
    return cleaned;
  };

  const buildNote = () => {
    if (anyVaxSelected && !data.consentMethod) {
      throw new Error('Consent Method is required when vaccine status is selected.');
    }

    const lines: string[] = [];

    if (data.admissionDate) {
      lines.push(`Resident is a new admission on ${data.admissionDate}${data.admissionSource ? ` from ${data.admissionSource}` : ''}.`);
    } else if (data.admissionSource) {
      lines.push(`Resident was admitted from ${data.admissionSource}.`);
    }

    if (data.patientAge && data.patientGender) {
      let sentence = `A ${data.patientAge}-year-old ${data.patientGender}`;
      if (data.orientation) {
        sentence += ` is ${data.orientation}`;
        if (data.orientation.includes('×1') || data.orientation.includes('×2')) {
          sentence += ' with periods of confusion';
        }
      }
      lines.push(`${sentence}.`);
    }

    if (data.bimsScore) lines.push(`BIMS score on admission: ${data.bimsScore}.`);
    if (data.primaryDiagnosis) lines.push(`Primary diagnosis: ${data.primaryDiagnosis}.`);

    const secondaryList = data.secondaryDiagnoses
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);
    if (secondaryList.length) lines.push(`Secondary diagnoses: ${secondaryList.join(', ')}.`);

    const groups: Record<'accepted' | 'declined' | 'history', string[]> = {
      accepted: [],
      declined: [],
      history: []
    };

    (['covid', 'rsv', 'flu', 'pneumonia'] as const).forEach((v) => {
      const status = data[v];
      if (status) {
        groups[status].push(v.charAt(0).toUpperCase() + v.slice(1));
      }
    });

    if (data.hepC) {
      lines.push(`Hepatitis C screening was offered and ${data.hepC}. ${data.hepCEducation}`.trim());
    }

    if (groups.accepted.length || groups.declined.length || groups.history.length) {
      const vaccineStmt: string[] = [];
      if (groups.declined.length) {
        vaccineStmt.push(`declined ${groups.declined.join(', ')} vaccine${groups.declined.length > 1 ? 's' : ''}`);
      }
      if (groups.accepted.length) {
        vaccineStmt.push(`accepted ${groups.accepted.join(', ')} vaccine${groups.accepted.length > 1 ? 's' : ''}`);
      }
      if (groups.history.length) {
        vaccineStmt.push(`reported history of ${groups.history.join(', ')} vaccine${groups.history.length > 1 ? 's' : ''}`);
      }

      let sentence = `Upon admission, vaccinations were offered per facility protocol. Representative${data.ecName ? ` (${data.ecName})` : ''} `;
      sentence += `${vaccineStmt.join(', and ')}.`;
      if (groups.declined.length) sentence += ' Education provided; vaccines will be re-offered as appropriate.';
      lines.push(sentence);
    }

    const educationLines: string[] = [];
    if ((groups.accepted.length + groups.declined.length) && data.vaccineEducation) {
      educationLines.push(data.vaccineEducation);
    }
    if (data.painMedEducation && data.painEducation) {
      educationLines.push(data.painEducation);
    }
    if (educationLines.length) {
      lines.push(Array.from(new Set(educationLines)).join(' '));
    }

    if (anyVaxSelected && data.consentMethod) {
      lines.push(`Consent and documentation were completed with representative${data.ecName ? ` (${data.ecName})` : ''} ${data.consentMethod}.`);
    }

    if (data.understandingNotes) lines.push(`${data.understandingNotes.replace(/\.$/, '')}.`);
    if (data.physicianNotified) lines.push('The attending physician was notified.');
    if (data.currentStatus) lines.push(`${data.currentStatus.replace(/\.$/, '')}.`);

    lines.push('Will continue to monitor, reinforce education as appropriate, and notify the provider of any change in decision regarding vaccination or screening.');

    return removeDups(smartGrammar(lines.join(' ')));
  };

  const computedPreview = useMemo(() => {
    try {
      return { text: buildNote(), isError: false };
    } catch (error) {
      return { text: `Preview error: ${error instanceof Error ? error.message : String(error)}`, isError: true };
    }
  }, [data, anyVaxSelected]);

  const displayedPreview = previewOverride ?? computedPreview.text;

  const handleCopy = async () => {
    if (!displayedPreview.trim()) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(displayedPreview.trim());
      } else {
        const ta = document.createElement('textarea');
        ta.value = displayedPreview.trim();
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
    } catch {
      // no-op fallback behavior if clipboard copy fails in browser restrictions
    }
  };

  const handleOptimize = () => {
    if (computedPreview.isError) return;
    setPreviewOverride(smartGrammar(removeDups(displayedPreview || '')));
  };

  const handleClear = () => {
    setData(initialData);
    setPreviewOverride(null);
  };

  const radioGroup = (name: keyof VaxData, value: VaccineState | Exclude<VaccineState, 'history'>, label: string) => (
    <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
      <input
        type="radio"
        name={name}
        checked={data[name] === value}
        onChange={() => setField(name, value)}
      />
      {label}
    </label>
  );

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-blue-950 px-5 py-4 text-white shadow-sm">
        <h1 className="text-lg font-bold">Vaccination Documentation</h1>
        <p className="mt-1 text-sm text-blue-100">Vaccines offered on admission – acceptance / declination & consent</p>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-base font-bold text-blue-900">Patient Information</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <label className="text-sm font-semibold text-slate-700">Admission Date
              <input type="date" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" value={data.admissionDate} onChange={(e) => setField('admissionDate', e.target.value)} />
            </label>
            <label className="text-sm font-semibold text-slate-700">Age
              <input type="number" min={1} max={120} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" value={data.patientAge} onChange={(e) => setField('patientAge', e.target.value)} />
            </label>
            <label className="text-sm font-semibold text-slate-700">Gender
              <select className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" value={data.patientGender} onChange={(e) => setField('patientGender', e.target.value)}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </label>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700">Admission Source
              <select className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" value={data.admissionSource} onChange={(e) => setField('admissionSource', e.target.value)}>
                <option value="">Select</option>
                <option value="home">Home</option>
                <option value="hospital">Hospital</option>
                <option value="other facility">Other Facility</option>
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-700">Alertness & Orientation
              <select className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" value={data.orientation} onChange={(e) => setField('orientation', e.target.value)}>
                <option value="">Select</option>
                <option value="alert & oriented ×3">alert & oriented ×3</option>
                <option value="alert & oriented ×2">alert & oriented ×2</option>
                <option value="alert & oriented ×1">alert & oriented ×1</option>
                <option value="disoriented">Disoriented</option>
              </select>
            </label>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700">BIMS Score
              <input type="number" min={0} max={15} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" value={data.bimsScore} onChange={(e) => setField('bimsScore', e.target.value)} />
            </label>
            <label className="text-sm font-semibold text-slate-700">Consent Method
              <select className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" value={data.consentMethod} onChange={(e) => setField('consentMethod', e.target.value)}>
                <option value="">Select</option>
                <option value="verbally">Verbally</option>
                <option value="in writing">In Writing</option>
                <option value="via phone">Via Phone</option>
              </select>
            </label>
          </div>

          <label className="mt-3 block text-sm font-semibold text-slate-700">Primary Diagnosis
            <input type="text" placeholder="e.g., CHF, COPD, DM2..." className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" value={data.primaryDiagnosis} onChange={(e) => setField('primaryDiagnosis', e.target.value)} />
          </label>
          <label className="mt-3 block text-sm font-semibold text-slate-700">Secondary Diagnoses (one per line)
            <textarea rows={3} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" value={data.secondaryDiagnoses} onChange={(e) => setField('secondaryDiagnoses', e.target.value)} />
          </label>
          <label className="mt-3 block text-sm font-semibold text-slate-700">Emergency Contact / Representative (name)
            <input type="text" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" value={data.ecName} onChange={(e) => setField('ecName', e.target.value)} />
          </label>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-base font-bold text-blue-900">Vaccine Status</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-bold text-slate-700">COVID-19</p>
              <div className="space-y-2">{radioGroup('covid', 'accepted', 'Accepted')}{radioGroup('covid', 'declined', 'Declined')}{radioGroup('covid', 'history', 'History')}</div>
            </div>
            <div>
              <p className="mb-2 text-sm font-bold text-slate-700">RSV</p>
              <div className="space-y-2">{radioGroup('rsv', 'accepted', 'Accepted')}{radioGroup('rsv', 'declined', 'Declined')}{radioGroup('rsv', 'history', 'History')}</div>
            </div>
            <div>
              <p className="mb-2 text-sm font-bold text-slate-700">Influenza</p>
              <div className="space-y-2">{radioGroup('flu', 'accepted', 'Accepted')}{radioGroup('flu', 'declined', 'Declined')}{radioGroup('flu', 'history', 'History')}</div>
            </div>
            <div>
              <p className="mb-2 text-sm font-bold text-slate-700">Pneumonia</p>
              <div className="space-y-2">{radioGroup('pneumonia', 'accepted', 'Accepted')}{radioGroup('pneumonia', 'declined', 'Declined')}{radioGroup('pneumonia', 'history', 'History')}</div>
            </div>
            <div>
              <p className="mb-2 text-sm font-bold text-slate-700">Hepatitis C Screening</p>
              <div className="space-y-2">{radioGroup('hepC', 'accepted', 'Accepted')}{radioGroup('hepC', 'declined', 'Declined')}</div>
            </div>
            <div>
              <p className="mb-2 text-sm font-bold text-slate-700">Additional</p>
              <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
                <input type="checkbox" checked={data.painMedEducation} onChange={(e) => setField('painMedEducation', e.target.checked)} />
                Pain Medication Education Completed
              </label>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm xl:col-span-2">
          <h2 className="mb-4 text-base font-bold text-blue-900">Education & Documentation</h2>
          <label className="block text-sm font-semibold text-slate-700">Vaccine Education Notes
            <textarea rows={3} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" value={data.vaccineEducation} onChange={(e) => setField('vaccineEducation', e.target.value)} />
          </label>
          <label className="mt-3 block text-sm font-semibold text-slate-700">Hepatitis C Education
            <textarea rows={3} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" value={data.hepCEducation} onChange={(e) => setField('hepCEducation', e.target.value)} />
          </label>
          <label className="mt-3 block text-sm font-semibold text-slate-700">Pain Medication Education
            <textarea rows={3} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" value={data.painEducation} onChange={(e) => setField('painEducation', e.target.value)} />
          </label>
          <label className="mt-3 block text-sm font-semibold text-slate-700">Understanding / Response
            <textarea rows={3} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" value={data.understandingNotes} onChange={(e) => setField('understandingNotes', e.target.value)} />
          </label>
          <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <input type="checkbox" checked={data.physicianNotified} onChange={(e) => setField('physicianNotified', e.target.checked)} />
            Physician Notified
          </label>
          <label className="mt-3 block text-sm font-semibold text-slate-700">Current Status
            <textarea rows={3} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" value={data.currentStatus} onChange={(e) => setField('currentStatus', e.target.value)} />
          </label>

          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={handleCopy} className="rounded-lg bg-blue-950 px-4 py-2 text-sm font-bold text-white hover:bg-blue-900">Copy Note</button>
            <button type="button" onClick={handleOptimize} className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-300">Optimise Note</button>
            <button type="button" onClick={handleClear} className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-300">Clear</button>
          </div>

          <div className="mt-4">
            <p className="mb-2 text-sm font-semibold text-slate-700">Preview</p>
            <div className={`min-h-[220px] whitespace-pre-wrap rounded-xl p-4 font-mono text-sm ${computedPreview.isError ? 'border-2 border-red-500 bg-red-950 text-red-100' : 'bg-slate-950 text-slate-100'}`}>
              {displayedPreview || 'Fill in the form to generate the vaccination note…'}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default VaxForm;

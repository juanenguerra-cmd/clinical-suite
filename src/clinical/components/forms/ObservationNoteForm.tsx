import React, { useMemo, useState } from 'react';
import './forms.css';

interface ObservationFormData {
  admissionType: '' | 'New Admission' | 'Re-Admission';
  admissionDate: string;
  shift: string;
  location: string;
  temp: string;
  hr: string;
  rr: string;
  bp: string;
  spo2: string;
  bs: string;
  complaints: string;
  assessment: string;
  interventions: string;
  response: string;
  notify: string;
}

interface FocusedAssessment {
  key: string;
  label: string;
  outLabel: string;
  enabled: boolean;
  details: string;
}

const FOCUSED_ASSESSMENTS: Omit<FocusedAssessment, 'enabled' | 'details'>[] = [
  { key: 'resp', label: 'Respiratory', outLabel: 'Respiratory assessment' },
  { key: 'card', label: 'Cardiac/Circulatory', outLabel: 'Cardiac/circulatory assessment' },
  { key: 'neuro', label: 'Neuro/Mental', outLabel: 'Neuro/mental status' },
  { key: 'gi', label: 'GI/Bowel', outLabel: 'GI/bowel assessment' },
  { key: 'gu', label: 'GU/Urinary', outLabel: 'GU/urinary assessment' },
  { key: 'skin', label: 'Skin', outLabel: 'Skin assessment' },
  { key: 'pain', label: 'Pain', outLabel: 'Pain assessment' },
  { key: 'safety', label: 'Fall/Safety', outLabel: 'Fall/safety assessment' },
];

const EMPTY_FORM: ObservationFormData = {
  admissionType: '',
  admissionDate: '',
  shift: '',
  location: '',
  temp: '',
  hr: '',
  rr: '',
  bp: '',
  spo2: '',
  bs: '',
  complaints: '',
  assessment: '',
  interventions: '',
  response: '',
  notify: '',
};

const clean = (txt: string): string => (txt || '').replace(/\s+/g, ' ').trim();
const capFirst = (txt: string): string => {
  const c = clean(txt);
  return c ? c.charAt(0).toUpperCase() + c.slice(1) : '';
};
const ensurePeriod = (txt: string): string => {
  const c = clean(txt);
  return c ? (/[.!?]$/.test(c) ? c : `${c}.`) : '';
};
const joinSentences = (parts: string[]) =>
  parts
    .map(s => s.trim())
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .replace(/\s+\./g, '.')
    .replace(/\.\.+/g, '.')
    .trim();

const ObservationNoteForm: React.FC = () => {
  const [formData, setFormData] = useState<ObservationFormData>(EMPTY_FORM);
  const [focusedAssessments, setFocusedAssessments] = useState<FocusedAssessment[]>(
    FOCUSED_ASSESSMENTS.map(item => ({ ...item, enabled: false, details: '' }))
  );
  const [copySuccess, setCopySuccess] = useState(false);

  const admissionDay = useMemo(() => {
    if (!formData.admissionDate) return '';
    const [y, m, d] = formData.admissionDate.split('-').map(Number);
    const adm = new Date(y, m - 1, d, 12, 0, 0);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
    const diffDays = Math.floor((today.getTime() - adm.getTime()) / (24 * 60 * 60 * 1000)) + 1;

    if (diffDays >= 1 && diffDays <= 7) return `Day ${diffDays}/7`;
    return `Outside Day 1–7 (Day ${diffDays})`;
  }, [formData.admissionDate]);

  const vitalsString = useMemo(() => {
    const vitals = [
      formData.temp ? `T ${formData.temp}` : '',
      formData.hr ? `HR ${formData.hr}` : '',
      formData.rr ? `RR ${formData.rr}` : '',
      formData.bp ? `BP ${formData.bp}` : '',
      formData.spo2 ? `O₂ sat ${formData.spo2}` : '',
      formData.bs ? `BS ${formData.bs}` : '',
    ].filter(Boolean);
    return vitals.length ? vitals.join(', ') : '';
  }, [formData]);

  const focusBlocks = useMemo(
    () =>
      focusedAssessments
        .map(item =>
          item.enabled && item.details
            ? ensurePeriod(`${item.outLabel}: ${capFirst(item.details)}`)
            : ''
        )
        .filter(Boolean),
    [focusedAssessments]
  );

  const generatedNote = useMemo(() => {
    const header = ensurePeriod(
      [formData.admissionType ? `${formData.admissionType} ${admissionDay}` : admissionDay, formData.shift]
        .filter(Boolean)
        .join(' – ')
    );

    return joinSentences([
      header,
      formData.location ? ensurePeriod(`Location: ${formData.location}`) : '',
      vitalsString ? ensurePeriod(`Vital signs: ${vitalsString}`) : '',
      formData.complaints ? `Resident report/concerns: ${ensurePeriod(capFirst(formData.complaints))}` : '',
      formData.assessment ? `General observations: ${ensurePeriod(capFirst(formData.assessment))}` : '',
      ...focusBlocks,
      formData.interventions
        ? `Interventions/actions: ${ensurePeriod(capFirst(formData.interventions))}`
        : '',
      formData.response ? `Response/outcome: ${ensurePeriod(capFirst(formData.response))}` : '',
      formData.notify ? `Notifications/escalation: ${ensurePeriod(capFirst(formData.notify))}` : '',
    ]);
  }, [admissionDay, formData, focusBlocks, vitalsString]);

  const missingFields = useMemo(() => {
    const missing: string[] = [];
    if (!admissionDay) missing.push('Admission day (enter admission date)');
    return missing;
  }, [admissionDay]);

  const autoChecks = useMemo(() => {
    const anyNarrative = !!(
      formData.complaints ||
      formData.assessment ||
      formData.interventions ||
      formData.response ||
      formData.notify ||
      focusBlocks.length
    );

    return [
      { label: 'Admission day selected', passed: !!admissionDay },
      { label: 'Some narrative documented', passed: anyNarrative },
      { label: 'Vitals entered (recommended)', passed: !!vitalsString },
    ];
  }, [admissionDay, focusBlocks.length, formData, vitalsString]);

  const previewText =
    missingFields.length > 0
      ? `Missing required fields (copy disabled):\n- ${missingFields.join('\n- ')}\n\n--- Preview (partial) ---\n\n${generatedNote}`
      : generatedNote || 'Fill the form to generate the note preview…';

  const handleInputChange = (field: keyof ObservationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFocusedToggle = (key: string) => {
    setFocusedAssessments(prev =>
      prev.map(item =>
        item.key === key
          ? { ...item, enabled: !item.enabled, details: item.enabled ? '' : item.details }
          : item
      )
    );
  };

  const handleFocusedDetails = (key: string, details: string) => {
    setFocusedAssessments(prev => prev.map(item => (item.key === key ? { ...item, details } : item)));
  };

  const handleCopyNote = async () => {
    if (missingFields.length || !generatedNote) return;

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
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 1200);
    } catch (error) {
      alert(`Copy failed. Select manually.\n\n${error instanceof Error ? error.message : ''}`);
    }
  };

  const handleOptimize = () => {
    setFormData(prev => {
      const next = { ...prev };
      (Object.keys(next) as Array<keyof ObservationFormData>).forEach(key => {
        next[key] = clean(next[key]) as never;
      });
      return next;
    });

    setFocusedAssessments(prev => prev.map(item => ({ ...item, details: clean(item.details) })));
  };

  const handleClear = () => {
    setFormData(EMPTY_FORM);
    setFocusedAssessments(FOCUSED_ASSESSMENTS.map(item => ({ ...item, enabled: false, details: '' })));
    setCopySuccess(false);
  };

  return (
    <div className="obs-wrap">
      <div className="obs-header">
        <div>
          <h1>7-Day Admission Observation – Shift Progress Note</h1>
          <p>Daily shift note with Day 1-7 auto-calculation &amp; focused assessments</p>
        </div>
      </div>

      <div className="obs-grid">
        <section className="obs-card">
          <h2>Header</h2>
          <label>Admission type</label>
          <div className="obs-radios">
            <label>
              <input
                type="radio"
                name="admType"
                checked={formData.admissionType === ''}
                onChange={() => handleInputChange('admissionType', '')}
              />
              None
            </label>
            <label>
              <input
                type="radio"
                name="admType"
                checked={formData.admissionType === 'New Admission'}
                onChange={() => handleInputChange('admissionType', 'New Admission')}
              />
              New Admission
            </label>
            <label>
              <input
                type="radio"
                name="admType"
                checked={formData.admissionType === 'Re-Admission'}
                onChange={() => handleInputChange('admissionType', 'Re-Admission')}
              />
              Re-Admission
            </label>
          </div>

          <div className="obs-row">
            <div>
              <label htmlFor="admissionDate">Admission date</label>
              <input
                id="admissionDate"
                type="date"
                value={formData.admissionDate}
                onChange={e => handleInputChange('admissionDate', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="admissionDayAuto">Admission day (auto)</label>
              <input id="admissionDayAuto" className="obs-locked" value={admissionDay} readOnly placeholder="Auto-calculated" />
            </div>
            <div>
              <label htmlFor="shift">Shift</label>
              <select id="shift" value={formData.shift} onChange={e => handleInputChange('shift', e.target.value)}>
                <option value="">Select…</option>
                <option value="Day shift">Day shift</option>
                <option value="Evening shift">Evening shift</option>
                <option value="Night shift">Night shift</option>
              </select>
            </div>
            <div>
              <label htmlFor="location">Location</label>
              <input
                id="location"
                type="text"
                value={formData.location}
                onChange={e => handleInputChange('location', e.target.value)}
                placeholder="Unit / Room"
              />
            </div>
          </div>
        </section>

        <section className="obs-card">
          <h2>Vital signs (optional)</h2>
          <div className="obs-row">
            <div><label>Temp</label><input type="text" value={formData.temp} onChange={e => handleInputChange('temp', e.target.value)} placeholder="98.6°F" /></div>
            <div><label>HR</label><input type="text" value={formData.hr} onChange={e => handleInputChange('hr', e.target.value)} placeholder="82" /></div>
            <div><label>RR</label><input type="text" value={formData.rr} onChange={e => handleInputChange('rr', e.target.value)} placeholder="18" /></div>
            <div><label>BP</label><input type="text" value={formData.bp} onChange={e => handleInputChange('bp', e.target.value)} placeholder="120/78" /></div>
            <div><label>O₂ Sat</label><input type="text" value={formData.spo2} onChange={e => handleInputChange('spo2', e.target.value)} placeholder="97% RA" /></div>
            <div><label>BS (if applicable)</label><input type="text" value={formData.bs} onChange={e => handleInputChange('bs', e.target.value)} placeholder="120 mg/dL" /></div>
          </div>
        </section>

        <section className="obs-card obs-full-width">
          <h2>Shift summary</h2>
          <label>Resident complaints or concerns</label>
          <textarea value={formData.complaints} onChange={e => handleInputChange('complaints', e.target.value)} placeholder="Denies pain/CP/SOB; reports nausea; dizziness when standing…" />

          <label>General objective observations</label>
          <textarea value={formData.assessment} onChange={e => handleInputChange('assessment', e.target.value)} placeholder="Alert, at baseline; no acute distress; skin intact…" />

          <label>Interventions / actions taken</label>
          <textarea value={formData.interventions} onChange={e => handleInputChange('interventions', e.target.value)} placeholder="Offered fluids; repositioned; PRN given per order…" />

          <label>Response / outcome</label>
          <textarea value={formData.response} onChange={e => handleInputChange('response', e.target.value)} placeholder="Symptoms improved; resting comfortably…" />

          <label>Escalation / notifications</label>
          <textarea value={formData.notify} onChange={e => handleInputChange('notify', e.target.value)} placeholder="MD notified; new orders received…" />
        </section>

        <section className="obs-card obs-full-width">
          <h2>Focused assessments</h2>
          <div className="obs-help">Check only systems you assessed; free-text appears only if checked.</div>
          <fieldset>
            <legend>Systems assessed this shift</legend>
            <div className="obs-check-grid">
              {focusedAssessments.map(item => (
                <div key={item.key} className="obs-check-item">
                  <label>
                    <input type="checkbox" checked={item.enabled} onChange={() => handleFocusedToggle(item.key)} /> {item.label}
                  </label>
                  {item.enabled && (
                    <textarea
                      value={item.details}
                      onChange={e => handleFocusedDetails(item.key, e.target.value)}
                      placeholder={`${item.label} details…`}
                    />
                  )}
                </div>
              ))}
            </div>
          </fieldset>
        </section>

        <section className="obs-card obs-full-width">
          <h2>Auto checks</h2>
          <div className="obs-help">For nurse reference – not included in final note.</div>
          <div className="obs-checks">
            {autoChecks.map(check => (
              <span key={check.label} className="obs-pill">
                {check.passed ? '✅' : '⚠️'} {check.label}
              </span>
            ))}
          </div>
        </section>

        <section className="obs-card obs-full-width">
          <h2>Preview</h2>
          <div className={`obs-preview ${missingFields.length ? 'err' : ''}`}>{previewText}</div>
          <div className="obs-actions">
            <button className="obs-btn primary" type="button" onClick={handleCopyNote} disabled={missingFields.length > 0}>
              {copySuccess ? 'Copied ✅' : 'Copy Note'}
            </button>
            <button className="obs-btn pink" type="button" onClick={handleOptimize}>
              Optimise Note
            </button>
            <button className="obs-btn gray" type="button" onClick={handleClear}>
              Clear
            </button>
          </div>
          <div className="obs-help"><strong className="obs-audit">Audit reminder:</strong> Verify accuracy before signing.</div>
        </section>
      </div>
    </div>
  );
};

export default ObservationNoteForm;

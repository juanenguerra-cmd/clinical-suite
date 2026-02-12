import React, { useState, useMemo } from 'react';
import { Card, Input, Textarea, Button } from '../../../SharedUI';
import { polishNote } from '../../../../services/geminiService';
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

const ObservationNoteForm: React.FC = () => {
  const [formData, setFormData] = useState<ObservationFormData>({
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
  });

  const [focusedAssessments, setFocusedAssessments] = useState<FocusedAssessment[]>(
    FOCUSED_ASSESSMENTS.map(fa => ({ ...fa, enabled: false, details: '' }))
  );

  const [isPolishing, setIsPolishing] = useState(false);

  // Auto-calculate admission day
  const admissionDay = useMemo(() => {
    if (!formData.admissionDate) return '';
    
    const admDate = new Date(formData.admissionDate + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - admDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    if (diffDays >= 1 && diffDays <= 7) {
      return `Day ${diffDays}/7`;
    } else if (diffDays > 7) {
      return `Outside Day 1–7 (Day ${diffDays})`;
    } else if (diffDays < 1) {
      return 'Invalid date (future date)';
    }
    return '';
  }, [formData.admissionDate]);

  // Generate vitals string
  const vitalsString = useMemo(() => {
    const vitals = [];
    if (formData.temp) vitals.push(`T ${formData.temp}`);
    if (formData.hr) vitals.push(`HR ${formData.hr}`);
    if (formData.rr) vitals.push(`RR ${formData.rr}`);
    if (formData.bp) vitals.push(`BP ${formData.bp}`);
    if (formData.spo2) vitals.push(`O₂ sat ${formData.spo2}`);
    if (formData.bs) vitals.push(`BS ${formData.bs}`);
    return vitals.length ? vitals.join(', ') : '';
  }, [formData.temp, formData.hr, formData.rr, formData.bp, formData.spo2, formData.bs]);

  // Helper functions
  const clean = (txt: string): string => txt.trim().replace(/\s+/g, ' ');
  const capFirst = (s: string): string => {
    const cleaned = clean(s);
    return cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : '';
  };
  const ensurePeriod = (s: string): string => {
    const cleaned = clean(s);
    return cleaned ? (/[.!?]$/.test(cleaned) ? cleaned : cleaned + '.') : '';
  };

  // Build focused assessment blocks
  const focusedBlocks = useMemo(() => {
    return focusedAssessments
      .filter(fa => fa.enabled && fa.details)
      .map(fa => ensurePeriod(`${fa.outLabel}: ${capFirst(fa.details)}`));
  }, [focusedAssessments]);

  // Generate note
  const generatedNote = useMemo(() => {
    const headerParts = [];
    if (formData.admissionType && admissionDay) {
      headerParts.push(`${formData.admissionType} ${admissionDay}`);
    } else if (admissionDay) {
      headerParts.push(admissionDay);
    }
    if (formData.shift) headerParts.push(formData.shift);

    const header = headerParts.length ? ensurePeriod(headerParts.join(' – ')) : '';
    const locLine = formData.location ? ensurePeriod(`Location: ${formData.location}`) : '';
    const vitLine = vitalsString ? ensurePeriod(`Vital signs: ${vitalsString}`) : '';

    const comp = ensurePeriod(capFirst(formData.complaints));
    const assess = ensurePeriod(capFirst(formData.assessment));
    const inter = ensurePeriod(capFirst(formData.interventions));
    const resp = ensurePeriod(capFirst(formData.response));
    const note = ensurePeriod(capFirst(formData.notify));

    const parts = [
      header,
      locLine,
      vitLine,
      comp ? `Resident report/concerns: ${comp}` : '',
      assess ? `General observations: ${assess}` : '',
      ...focusedBlocks,
      inter ? `Interventions/actions: ${inter}` : '',
      resp ? `Response/outcome: ${resp}` : '',
      note ? `Notifications/escalation: ${note}` : '',
    ];

    return parts
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .replace(/\s+\./g, '.')
      .replace(/\.\s+/g, '. ')
      .replace(/\.\.+/g, '.')
      .trim();
  }, [formData, admissionDay, vitalsString, focusedBlocks]);

  // Auto-checks
  const autoChecks = useMemo(() => {
    const anyNarrative = !!(
      formData.complaints ||
      formData.assessment ||
      formData.interventions ||
      formData.response ||
      formData.notify ||
      focusedBlocks.length
    );

    return [
      { label: 'Admission day selected', passed: !!admissionDay && !admissionDay.includes('Invalid') },
      { label: 'Some narrative documented', passed: anyNarrative },
      { label: 'Vitals entered (recommended)', passed: !!vitalsString },
    ];
  }, [admissionDay, formData, vitalsString, focusedBlocks.length]);

  // Validation
  const missingFields = useMemo(() => {
    const missing: string[] = [];
    if (!admissionDay || admissionDay.includes('Invalid')) missing.push('Valid admission date');
    return missing;
  }, [admissionDay]);

  const handleInputChange = (field: keyof ObservationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFocusedAssessmentToggle = (key: string) => {
    setFocusedAssessments(prev =>
      prev.map(fa =>
        fa.key === key ? { ...fa, enabled: !fa.enabled, details: fa.enabled ? '' : fa.details } : fa
      )
    );
  };

  const handleFocusedAssessmentDetails = (key: string, details: string) => {
    setFocusedAssessments(prev =>
      prev.map(fa => (fa.key === key ? { ...fa, details } : fa))
    );
  };

  const handleCopyNote = async () => {
    if (missingFields.length) {
      alert(`Missing required fields:
- ${missingFields.join('
- ')}`);
      return;
    }
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
    } catch (err) {
      alert('❌ Failed to copy. Please select and copy manually.');
    }
  };

  const handlePolish = async () => {
    if (!generatedNote) return;
    
    setIsPolishing(true);
    try {
      const polished = await polishNote(generatedNote);
      alert('✨ AI Polish complete! Review the enhanced note.');
    } catch (error) {
      alert('❌ AI Polish failed. Please try again.');
    } finally {
      setIsPolishing(false);
    }
  };

  const handleOptimize = () => {
    const optimized = { ...formData };
    (Object.keys(optimized) as Array<keyof ObservationFormData>).forEach(key => {
      if (typeof optimized[key] === 'string') {
        optimized[key] = clean(optimized[key] as string) as any;
      }
    });
    setFormData(optimized);
    setFocusedAssessments(prev =>
      prev.map(fa => ({ ...fa, details: clean(fa.details) }))
    );
  };

  const handleClear = () => {
    if (window.confirm('Clear all form data?')) {
      setFormData({
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
      });
      setFocusedAssessments(
        FOCUSED_ASSESSMENTS.map(fa => ({ ...fa, enabled: false, details: '' }))
      );
    }
  };

  return (
    <div className=\"clinical-form-container\">
      <div className=\"form-header\">
        <h2>7-Day Admission Observation – Shift Progress Note</h2>
        <p>Daily shift note with Day 1-7 auto-calculation & focused assessments</p>
      </div>

      <div className=\"form-grid\">
        {/* LEFT COLUMN - Header */}
        <Card className=\"form-section\">
          <h3>Header</h3>
          
          <div className=\"form-group\">
            <label>Admission type</label>
            <div className=\"radio-group\">
              <label>
                <input
                  type=\"radio\"
                  checked={formData.admissionType === ''}
                  onChange={() => handleInputChange('admissionType', '')}
                />
                None
              </label>
              <label>
                <input
                  type=\"radio\"
                  checked={formData.admissionType === 'New Admission'}
                  onChange={() => handleInputChange('admissionType', 'New Admission')}
                />
                New Admission
              </label>
              <label>
                <input
                  type=\"radio\"
                  checked={formData.admissionType === 'Re-Admission'}
                  onChange={() => handleInputChange('admissionType', 'Re-Admission')}
                />
                Re-Admission
              </label>
            </div>
          </div>

          <div className=\"form-row\">
            <div className=\"form-group\">
              <label>Admission date</label>
              <Input
                type=\"date\"
                value={formData.admissionDate}
                onChange={e => handleInputChange('admissionDate', e.target.value)}
              />
            </div>
            <div className=\"form-group\">
              <label>Admission day (auto)</label>
              <Input
                type=\"text\"
                value={admissionDay}
                readOnly
                className=\"readonly-input\"
                placeholder=\"Auto-calculated\"
              />
            </div>
            <div className=\"form-group\">
              <label>Shift</label>
              <select
                value={formData.shift}
                onChange={e => handleInputChange('shift', e.target.value)}
                className=\"form-select\"
              >
                <option value=\"\">Select…</option>
                <option value=\"Day shift\">Day shift</option>
                <option value=\"Evening shift\">Evening shift</option>
                <option value=\"Night shift\">Night shift</option>
              </select>
            </div>
            <div className=\"form-group\">
              <label>Location</label>
              <Input
                type=\"text\"
                value={formData.location}
                onChange={e => handleInputChange('location', e.target.value)}
                placeholder=\"Unit / Room\"
              />
            </div>
          </div>
        </Card>

        {/* RIGHT COLUMN - Vital Signs */}
        <Card className=\"form-section\">
          <h3>Vital signs (optional)</h3>
          <div className=\"form-row\">
            <div className=\"form-group\">
              <label>Temp</label>
              <Input
                type=\"text\"
                value={formData.temp}
                onChange={e => handleInputChange('temp', e.target.value)}
                placeholder=\"98.6°F\"
              />
            </div>
            <div className=\"form-group\">
              <label>HR</label>
              <Input
                type=\"text\"
                value={formData.hr}
                onChange={e => handleInputChange('hr', e.target.value)}
                placeholder=\"82\"
              />
            </div>
            <div className=\"form-group\">
              <label>RR</label>
              <Input
                type=\"text\"
                value={formData.rr}
                onChange={e => handleInputChange('rr', e.target.value)}
                placeholder=\"18\"
              />
            </div>
            <div className=\"form-group\">
              <label>BP</label>
              <Input
                type=\"text\"
                value={formData.bp}
                onChange={e => handleInputChange('bp', e.target.value)}
                placeholder=\"120/78\"
              />
            </div>
            <div className=\"form-group\">
              <label>O₂ Sat</label>
              <Input
                type=\"text\"
                value={formData.spo2}
                onChange={e => handleInputChange('spo2', e.target.value)}
                placeholder=\"97% RA\"
              />
            </div>
            <div className=\"form-group\">
              <label>BS</label>
              <Input
                type=\"text\"
                value={formData.bs}
                onChange={e => handleInputChange('bs', e.target.value)}
                placeholder=\"120 mg/dL\"
              />
            </div>
          </div>
        </Card>

        {/* FULL-WIDTH - Shift Summary */}
        <Card className=\"form-section full-width\">
          <h3>Shift summary</h3>
          <div className=\"form-group\">
            <label>Resident complaints or concerns</label>
            <Textarea
              value={formData.complaints}
              onChange={e => handleInputChange('complaints', e.target.value)}
              placeholder=\"Denies pain/CP/SOB; reports nausea; dizziness when standing…\"
            />
          </div>
          <div className=\"form-group\">
            <label>General objective observations</label>
            <Textarea
              value={formData.assessment}
              onChange={e => handleInputChange('assessment', e.target.value)}
              placeholder=\"Alert, at baseline; no acute distress; skin intact…\"
            />
          </div>
          <div className=\"form-group\">
            <label>Interventions / actions taken</label>
            <Textarea
              value={formData.interventions}
              onChange={e => handleInputChange('interventions', e.target.value)}
              placeholder=\"Offered fluids; repositioned; PRN given per order…\"
            />
          </div>
          <div className=\"form-group\">
            <label>Response / outcome</label>
            <Textarea
              value={formData.response}
              onChange={e => handleInputChange('response', e.target.value)}
              placeholder=\"Symptoms improved; resting comfortably…\"
            />
          </div>
          <div className=\"form-group\">
            <label>Escalation / notifications</label>
            <Textarea
              value={formData.notify}
              onChange={e => handleInputChange('notify', e.target.value)}
              placeholder=\"MD notified; new orders received…\"
            />
          </div>
        </Card>

        {/* FULL-WIDTH - Focused Assessments */}
        <Card className=\"form-section full-width\">
          <h3>Focused assessments</h3>
          <p className=\"help-text\">Check only systems you assessed; free-text appears only if checked.</p>
          <div className=\"focused-assessments-grid\">
            {focusedAssessments.map(fa => (
              <div key={fa.key} className=\"focused-item\">
                <label className=\"checkbox-label\">
                  <input
                    type=\"checkbox\"
                    checked={fa.enabled}
                    onChange={() => handleFocusedAssessmentToggle(fa.key)}
                  />
                  {fa.label}
                </label>
                {fa.enabled && (
                  <Textarea
                    value={fa.details}
                    onChange={e => handleFocusedAssessmentDetails(fa.key, e.target.value)}
                    placeholder={`${fa.label} details…`}
                    className=\"focused-textarea\"
                  />
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* FULL-WIDTH - Auto Checks */}
        <Card className=\"form-section full-width\">
          <h3>Auto checks</h3>
          <p className=\"help-text\">For nurse reference – not included in final note.</p>
          <div className=\"pill-group\">
            {autoChecks.map(check => (
              <span key={check.label} className={`pill ${check.passed ? 'passed' : 'warning'}`}>
                {check.passed ? '✅' : '⚠️'} {check.label}
              </span>
            ))}
          </div>
        </Card>

        {/* PREVIEW & ACTIONS */}
        <Card className=\"form-section full-width preview-section\">
          <h3>Preview</h3>
          <div className={`preview-box ${missingFields.length ? 'invalid' : ''}`}>
            {missingFields.length ? (
              <div className=\"missing-fields\">
                <p>Missing required fields (copy disabled):</p>
                <ul>
                  {missingFields.map(m => <li key={m}>{m}</li>)}
                </ul>
                <hr />
                <p className=\"preview-partial-label\">--- Preview (partial) ---</p>
                {generatedNote}
              </div>
            ) : (
              generatedNote || 'Fill the form to generate the note preview…'
            )}
          </div>

          <div className=\"form-actions\">
            <Button
              variant=\"primary\"
              onClick={handleCopyNote}
              disabled={!!missingFields.length}
            >
              Copy Note
            </Button>
            <Button
              variant=\"secondary\"
              onClick={handlePolish}
              disabled={isPolishing || !generatedNote}
            >
              {isPolishing ? 'Polishing...' : 'Optimise Note'}
            </Button>
            <Button
              variant=\"outline\"
              onClick={handleClear}
            >
              Clear
            </Button>
          </div>
          <p className=\"audit-reminder\">
            <strong>Audit reminder:</strong> Verify accuracy before signing.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default ObservationNoteForm;

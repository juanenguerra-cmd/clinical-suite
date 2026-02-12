import React, { useState, useMemo, useEffect } from 'react';
import { Card, Input, Textarea, Button, Select } from '../SharedUI';
import { polishNote } from '../../services/geminiService';

// Assessment systems data
const ASSESSMENT_SYSTEMS = [
  {
    id: 'neuro',
    legend: 'Neurological',
    opts: [
      'Alert and oriented x3',
      'Alert and oriented x2',
      'Alert and oriented x1',
      'Confused',
      'Lethargic',
      'Increased confusion from baseline',
      'Follows commands appropriately',
      'Speech clear',
      'Pupils equal and reactive',
      'No focal deficits noted',
      'No changes from baseline'
    ]
  },
  {
    id: 'cardio',
    legend: 'Cardiovascular',
    opts: [
      'Regular rate and rhythm',
      'Heart sounds normal S1/S2',
      'No murmurs noted',
      'Irregular rhythm noted',
      'Peripheral pulses palpable',
      'Capillary refill <3 seconds',
      'No edema noted',
      'Bilateral pedal edema noted',
      'No chest pain reported',
      'No changes from baseline'
    ]
  },
  {
    id: 'resp',
    legend: 'Respiratory',
    opts: [
      'Lungs clear bilaterally',
      'Respirations unlabored',
      'No use of accessory muscles',
      'Crackles noted in bases',
      'Wheezing noted',
      'Cough present (productive/nonproductive)',
      'Increased work of breathing',
      'Shortness of breath reported',
      'O2 therapy in place as ordered',
      'No changes from baseline'
    ]
  },
  {
    id: 'gi',
    legend: 'Gastrointestinal',
    opts: [
      'Abdomen soft and non-tender',
      'Bowel sounds active x4 quadrants',
      'No nausea or vomiting',
      'Tolerating diet',
      'Last BM documented',
      'Abdominal distension noted',
      'Nausea reported',
      'Vomiting noted',
      'Diarrhea present',
      'Constipation reported',
      'No changes from baseline'
    ]
  },
  {
    id: 'gu',
    legend: 'Genitourinary',
    opts: [
      'Voiding adequate amounts',
      'Urine clear yellow',
      'Continent of urine',
      'Foley catheter in place and patent',
      'No urinary complaints',
      'Dysuria reported',
      'Urinary frequency',
      'Urinary retention',
      'Hematuria noted',
      'Urine cloudy/foul smelling',
      'No changes from baseline'
    ]
  },
  {
    id: 'musc',
    legend: 'Musculoskeletal',
    opts: [
      'Moving all extremities',
      'Strength equal bilaterally',
      'Gait steady',
      'No pain with movement',
      'Pain reported with movement',
      'Limited range of motion',
      'Weakness noted in extremities',
      'Requires assist with mobility',
      'Fall risk precautions in place',
      'No changes from baseline'
    ]
  },
  {
    id: 'skin',
    legend: 'Integumentary',
    opts: [
      'Skin warm and dry',
      'Color appropriate',
      'Good turgor',
      'No pressure injuries noted',
      'Existing wounds/pressure injuries present (see wound assessment)',
      'Rash noted',
      'Bruising noted',
      'Skin breakdown noted',
      'No changes from baseline'
    ]
  },
  {
    id: 'pain',
    legend: 'Pain Assessment',
    opts: [
      'No pain reported',
      'Pain reported (location/severity documented)',
      'Pain managed with medications',
      'Non-pharmacological interventions used',
      'Pain interfering with ADLs',
      'Pain level acceptable to resident',
      'No changes from baseline'
    ]
  }
];

// Care plan library
const CARE_PLAN_LIBRARY: Record<string, { goal: string; interventions: string[] }> = {
  'Infection Risk': {
    goal: 'Resident will remain free from infection as evidenced by stable vital signs and absence of infection indicators.',
    interventions: [
      'Monitor vital signs per protocol',
      'Maintain hand hygiene protocols',
      'Monitor for signs/symptoms of infection',
      'Ensure adequate hydration',
      'Document and report changes promptly',
      'Follow isolation precautions if indicated'
    ]
  },
  'Fall Risk': {
    goal: 'Resident will remain free from falls and injury during this episode.',
    interventions: [
      'Keep call light within reach',
      'Ensure safe environment (clutter-free)',
      'Bed in low position with brakes locked',
      'Non-skid footwear when ambulating',
      'Assist with mobility as needed',
      'Frequent rounding and checks',
      'Provide adequate lighting'
    ]
  },
  'Altered Mental Status': {
    goal: 'Resident will return to baseline cognitive function or maintain safety with current level.',
    interventions: [
      'Frequent reorientation',
      'Maintain calm, therapeutic environment',
      'Monitor for safety concerns',
      'Assess for reversible causes',
      'Redirect as needed',
      'Avoid restraints unless absolutely necessary',
      'Family education provided'
    ]
  },
  'Fluid Volume Deficit': {
    goal: 'Resident will maintain adequate hydration as evidenced by improved intake and vital signs.',
    interventions: [
      'Encourage PO fluid intake',
      'Offer preferred beverages',
      'Monitor I&O',
      'Assess mucous membranes and skin turgor',
      'IV fluids as ordered',
      'Monitor daily weights',
      'Report declining intake'
    ]
  },
  'Pain Management': {
    goal: 'Resident will report pain level acceptable to them within 24-48 hours.',
    interventions: [
      'Administer pain medications as ordered',
      'Assess pain using appropriate scale',
      'Monitor effectiveness of interventions',
      'Use non-pharmacological methods',
      'Position for comfort',
      'Notify provider if pain uncontrolled'
    ]
  },
  'Respiratory Compromise': {
    goal: 'Resident will maintain adequate oxygenation as evidenced by O2 sat >90% and stable respiratory status.',
    interventions: [
      'Monitor O2 saturation continuously or per protocol',
      'Provide supplemental O2 as ordered',
      'Elevate head of bed 30-45 degrees',
      'Encourage deep breathing and coughing',
      'Suction as needed',
      'Monitor lung sounds',
      'Assess for increased work of breathing'
    ]
  },
  'Skin Integrity': {
    goal: 'Resident will maintain intact skin or show improvement in existing wounds.',
    interventions: [
      'Turn and reposition every 2 hours',
      'Keep skin clean and dry',
      'Use pressure-relieving devices',
      'Assess skin daily',
      'Wound care as ordered',
      'Maintain adequate nutrition and hydration',
      'Document wound measurements'
    ]
  },
  'Medication Management': {
    goal: 'Resident will receive medications safely and as ordered without adverse effects.',
    interventions: [
      'Administer medications as prescribed',
      'Monitor for therapeutic effects',
      'Assess for adverse reactions',
      'Ensure proper administration technique',
      'Document administration accurately',
      'Report concerns to provider',
      'Educate resident/family as appropriate'
    ]
  },
  'Nutrition Deficit': {
    goal: 'Resident will improve nutritional intake as evidenced by increased meal consumption.',
    interventions: [
      'Monitor meal intake percentages',
      'Offer preferred foods',
      'Provide supplements as ordered',
      'Assess for swallowing difficulties',
      'Position upright for meals',
      'Provide feeding assistance if needed',
      'Consult dietitian if intake remains poor'
    ]
  }
};

const COCForm: React.FC = () => {
  const [formData, setData] = useState({
    date: new Date().toISOString().split('T')[0],
    issue: '',
    discovered: '',
    onset: '',
    history: '',
    bp: '',
    hr: '',
    rr: '',
    temp: '',
    o2: '',
    o2Method: 'room air',
    physical: '',
    functional: '',
    mdName: '',
    orders: '',
    famName: '',
    famRel: '',
    famMethod: 'phone',
    famResponse: '',
    goal: '',
    customInterventions: ''
  });

  const [selectedSystems, setSelectedSystems] = useState<string[]>([]);
  const [systemAssessments, setSystemAssessments] = useState<Record<string, { checked: string[]; details: string }>>({});
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>([]);
  const [selectedInterventions, setSelectedInterventions] = useState<string[]>([]);
  const [includeCustom, setIncludeCustom] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);

  // Update goal when focus areas change
  useEffect(() => {
    if (selectedFocusAreas.length === 1) {
      const area = selectedFocusAreas[0];
      setData(prev => ({ ...prev, goal: CARE_PLAN_LIBRARY[area]?.goal || '' }));
    } else if (selectedFocusAreas.length > 1) {
      setData(prev => ({ ...prev, goal: 'See selected focus areas (multiple) – edit as needed' }));
    } else {
      setData(prev => ({ ...prev, goal: '' }));
    }
  }, [selectedFocusAreas]);

  // Collect interventions from selected focus areas
  useEffect(() => {
    const interventions = new Set<string>();
    selectedFocusAreas.forEach(area => {
      CARE_PLAN_LIBRARY[area]?.interventions.forEach(int => interventions.add(int));
    });
    // Keep only interventions that are still valid
    setSelectedInterventions(prev => prev.filter(int => interventions.has(int)));
  }, [selectedFocusAreas]);

  const handleInputChange = (field: string, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleSystemToggle = (systemId: string) => {
    setSelectedSystems(prev => {
      if (prev.includes(systemId)) {
        return prev.filter(id => id !== systemId);
      }
      return [...prev, systemId];
    });
  };

  const handleAssessmentCheck = (systemId: string, option: string, checked: boolean) => {
    setSystemAssessments(prev => {
      const current = prev[systemId] || { checked: [], details: '' };
      const newChecked = checked
        ? [...current.checked, option]
        : current.checked.filter(o => o !== option);
      return { ...prev, [systemId]: { ...current, checked: newChecked } };
    });
  };

  const handleAssessmentDetails = (systemId: string, details: string) => {
    setSystemAssessments(prev => {
      const current = prev[systemId] || { checked: [], details: '' };
      return { ...prev, [systemId]: { ...current, details } };
    });
  };

  const generatedNote = useMemo(() => {
    const lines: string[] = [];

    // Date and issue
    if (formData.date && formData.issue) {
      const dateStr = new Date(formData.date + 'T00:00:00').toLocaleDateString('en-US');
      lines.push(`On ${dateStr}, the resident exhibited a change in condition noted as ${formData.issue}.`);
    } else if (formData.issue) {
      lines.push(`Resident exhibited a change in condition noted as ${formData.issue}.`);
    }

    // Discovery and onset
    if (formData.discovered) lines.push(`Discovered via ${formData.discovered}.`);
    if (formData.onset) lines.push(`Onset ≈ ${formData.onset}.`);
    if (formData.history) lines.push(`Pertinent history: ${formData.history}.`);

    // Vital signs
    const vitals: string[] = [];
    if (formData.bp) vitals.push(`BP ${formData.bp}`);
    if (formData.hr) vitals.push(`HR ${formData.hr}`);
    if (formData.rr) vitals.push(`RR ${formData.rr}`);
    if (formData.temp) vitals.push(`Temp ${formData.temp}`);
    if (formData.o2) vitals.push(`O₂ sat ${formData.o2} on ${formData.o2Method}`);
    if (vitals.length) lines.push(`Vitals: ${vitals.join(', ')}.`);

    // Physical exam and functional status
    if (formData.physical) lines.push(`Exam: ${formData.physical}.`);
    if (formData.functional) lines.push(`Function: ${formData.functional}.`);

    // Assessment systems
    const assessBlocks: string[] = [];
    selectedSystems.forEach(systemId => {
      const system = ASSESSMENT_SYSTEMS.find(s => s.id === systemId);
      const assessment = systemAssessments[systemId];
      if (system && assessment && assessment.checked.length > 0) {
        let desc = assessment.checked.join('; ');
        if (assessment.details) desc += ` (${assessment.details})`;
        assessBlocks.push(`${system.legend}: ${desc}.`);
      }
    });
    if (assessBlocks.length) lines.push(`Assessment: ${assessBlocks.join(' ')}`);

    // Provider communication
    if (formData.orders) {
      if (formData.mdName) {
        lines.push(`${formData.mdName} ordered ${formData.orders}. Orders were read back and verified.`);
      } else {
        lines.push(`Provider orders: ${formData.orders}. Orders were read back and verified.`);
      }
    }

    // Care plan - Goal
    if (formData.goal) {
      lines.push(`Goal: ${formData.goal}`);
    }

    // Interventions
    const allInterventions = [...selectedInterventions];
    if (includeCustom && formData.customInterventions) {
      const custom = formData.customInterventions.split('\n')
        .map(s => s.trim())
        .filter(Boolean);
      allInterventions.push(...custom);
    }
    if (allInterventions.length) {
      lines.push(`Interventions implemented: ${allInterventions.join('; ')}.`);
    }

    // Family communication
    if (formData.famName && formData.famRel && formData.famMethod) {
      lines.push(`Family (${formData.famName}, ${formData.famRel}) contacted via ${formData.famMethod}.`);
      if (formData.famResponse) lines.push(`Family response: ${formData.famResponse}.`);
    }

    return lines.join(' ').replace(/\s{2,}/g, ' ').trim();
  }, [formData, selectedSystems, systemAssessments, selectedInterventions, includeCustom, selectedFocusAreas]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedNote);
    alert('Note copied to clipboard!');
  };

  const handlePolish = async () => {
    if (!generatedNote) return;
    setIsPolishing(true);
    try {
      const polished = await polishNote(generatedNote);
      await navigator.clipboard.writeText(polished);
      alert('AI Polished note copied to clipboard!');
    } catch (error) {
      alert('Error polishing note. Original copied instead.');
      await navigator.clipboard.writeText(generatedNote);
    } finally {
      setIsPolishing(false);
    }
  };

  const handleOptimize = () => {
    // Simple text optimization
    const optimized = generatedNote
      .replace(/\s+/g, ' ')
      .replace(/\s+\./g, '.')
      .replace(/\.\s+/g, '. ')
      .replace(/\.\.+/g, '.')
      .trim();
    navigator.clipboard.writeText(optimized);
    alert('Optimized note copied to clipboard!');
  };

  const handleClear = () => {
    if (!confirm('Clear all form data?')) return;
    setData({
      date: new Date().toISOString().split('T')[0],
      issue: '',
      discovered: '',
      onset: '',
      history: '',
      bp: '',
      hr: '',
      rr: '',
      temp: '',
      o2: '',
      o2Method: 'room air',
      physical: '',
      functional: '',
      mdName: '',
      orders: '',
      famName: '',
      famRel: '',
      famMethod: 'phone',
      famResponse: '',
      goal: '',
      customInterventions: ''
    });
    setSelectedSystems([]);
    setSystemAssessments({});
    setSelectedFocusAreas([]);
    setSelectedInterventions([]);
    setIncludeCustom(false);
  };

  const availableInterventions = useMemo(() => {
    const interventions = new Set<string>();
    selectedFocusAreas.forEach(area => {
      CARE_PLAN_LIBRARY[area]?.interventions.forEach(int => interventions.add(int));
    });
    return Array.from(interventions).sort();
  }, [selectedFocusAreas]);

  return (
    <div className="space-y-6">
      {/* Basic Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Basic Details">
          <Input
            type="date"
            label="Date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
          />
          <Input
            label="Issue / Change in Condition"
            placeholder="e.g., increased confusion, fall, fever"
            value={formData.issue}
            onChange={(e) => handleInputChange('issue', e.target.value)}
          />
          <Input
            label="Discovered Via"
            placeholder="e.g., routine assessment, family report"
            value={formData.discovered}
            onChange={(e) => handleInputChange('discovered', e.target.value)}
          />
          <Input
            label="Approximate Onset"
            placeholder="e.g., 2 hours ago, this morning"
            value={formData.onset}
            onChange={(e) => handleInputChange('onset', e.target.value)}
          />
          <Textarea
            label="Pertinent Medical History"
            placeholder="Relevant medical history..."
            value={formData.history}
            onChange={(e) => handleInputChange('history', e.target.value)}
            rows={3}
          />
        </Card>

        {/* Vital Signs */}
        <Card title="Vital Signs & Exam">
          <div className="grid grid-cols-3 gap-2 mb-4">
            <Input
              label="BP"
              placeholder="120/80"
              value={formData.bp}
              onChange={(e) => handleInputChange('bp', e.target.value)}
            />
            <Input
              label="HR"
              placeholder="82"
              value={formData.hr}
              onChange={(e) => handleInputChange('hr', e.target.value)}
            />
            <Input
              label="RR"
              placeholder="18"
              value={formData.rr}
              onChange={(e) => handleInputChange('rr', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-3 gap-2 mb-4">
            <Input
              label="Temp"
              placeholder="98.6°F"
              value={formData.temp}
              onChange={(e) => handleInputChange('temp', e.target.value)}
            />
            <Input
              label="O₂ Sat"
              placeholder="97%"
              value={formData.o2}
              onChange={(e) => handleInputChange('o2', e.target.value)}
            />
            <Select
              label="Method"
              value={formData.o2Method}
              onChange={(e) => handleInputChange('o2Method', e.target.value)}
              options={[
                { value: 'room air', label: 'Room Air' },
                { value: 'nasal cannula', label: 'Nasal Cannula' },
                { value: 'mask', label: 'Mask' }
              ]}
            />
          </div>
          <Textarea
            label="Physical Exam"
            placeholder="Exam findings..."
            value={formData.physical}
            onChange={(e) => handleInputChange('physical', e.target.value)}
            rows={3}
          />
          <Textarea
            label="Functional Status"
            placeholder="Mobility, ADLs..."
            value={formData.functional}
            onChange={(e) => handleInputChange('functional', e.target.value)}
            rows={2}
          />
        </Card>
      </div>

      {/* Assessment Systems */}
      <Card title="Assessment Systems">
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-700 mb-2">Select Systems to Assess</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {ASSESSMENT_SYSTEMS.map(system => (
              <label key={system.id} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedSystems.includes(system.id)}
                  onChange={(e) => handleSystemToggle(system.id)}
                  className="rounded border-slate-300"
                />
                <span>{system.legend}</span>
              </label>
            ))}
          </div>
        </div>

        {selectedSystems.map(systemId => {
          const system = ASSESSMENT_SYSTEMS.find(s => s.id === systemId);
          if (!system) return null;
          const assessment = systemAssessments[systemId] || { checked: [], details: '' };
          const showDetails = assessment.checked.length > 0 &&
            !assessment.checked.every(v =>
              v.startsWith('No changes') ||
              v.startsWith('Not clinically applicable') ||
              v === 'No'
            );

          return (
            <div key={systemId} className="border border-slate-200 rounded-lg p-4 mt-4">
              <h3 className="font-bold text-sm text-blue-900 mb-3">{system.legend}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                {system.opts.map(opt => (
                  <label key={opt} className="flex items-start space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={assessment.checked.includes(opt)}
                      onChange={(e) => handleAssessmentCheck(systemId, opt, e.target.checked)}
                      className="rounded border-slate-300 mt-0.5"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
              {showDetails && (
                <Textarea
                  label="Additional Details"
                  placeholder="Provide more specific information..."
                  value={assessment.details}
                  onChange={(e) => handleAssessmentDetails(systemId, e.target.value)}
                  rows={2}
                />
              )}
            </div>
          );
        })}
      </Card>

      {/* Care Plan */}
      <Card title="Care Plan">
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-700 mb-2">Focus Areas (select all that apply)</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-3">
            {Object.keys(CARE_PLAN_LIBRARY).sort().map(area => (
              <label key={area} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedFocusAreas.includes(area)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedFocusAreas(prev => [...prev, area]);
                    } else {
                      setSelectedFocusAreas(prev => prev.filter(a => a !== area));
                    }
                  }}
                  className="rounded border-slate-300"
                />
                <span>{area}</span>
              </label>
            ))}
          </div>
        </div>

        <Textarea
          label="Goal"
          placeholder="Care plan goal..."
          value={formData.goal}
          onChange={(e) => handleInputChange('goal', e.target.value)}
          rows={2}
        />

        {availableInterventions.length > 0 && (
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-700 mb-2">Interventions</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto border border-slate-200 rounded-lg p-3">
              {availableInterventions.map(int => (
                <label key={int} className="flex items-start space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedInterventions.includes(int)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedInterventions(prev => [...prev, int]);
                      } else {
                        setSelectedInterventions(prev => prev.filter(i => i !== int));
                      }
                    }}
                    className="rounded border-slate-300 mt-0.5"
                  />
                  <span>{int}</span>
                </label>
              ))}
              <label className="flex items-center space-x-2 text-sm font-bold text-blue-900">
                <input
                  type="checkbox"
                  checked={includeCustom}
                  onChange={(e) => setIncludeCustom(e.target.checked)}
                  className="rounded border-slate-300"
                />
                <span>Custom</span>
              </label>
            </div>
          </div>
        )}

        {includeCustom && (
          <Textarea
            label="Custom Interventions (one per line)"
            placeholder="Enter custom interventions..."
            value={formData.customInterventions}
            onChange={(e) => handleInputChange('customInterventions', e.target.value)}
            rows={3}
          />
        )}
      </Card>

      {/* Communication */}
      <Card title="Provider & Family Communication">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Input
            label="MD Name"
            placeholder="Provider name"
            value={formData.mdName}
            onChange={(e) => handleInputChange('mdName', e.target.value)}
          />
          <Textarea
            label="Orders"
            placeholder="New orders received..."
            value={formData.orders}
            onChange={(e) => handleInputChange('orders', e.target.value)}
            rows={3}
          />
        </div>

        <div className="border-t border-slate-200 pt-4">
          <h3 className="font-bold text-sm text-slate-700 mb-3">Family Notification</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Input
              label="Name"
              placeholder="Family member name"
              value={formData.famName}
              onChange={(e) => handleInputChange('famName', e.target.value)}
            />
            <Input
              label="Relationship"
              placeholder="e.g., Daughter, Son"
              value={formData.famRel}
              onChange={(e) => handleInputChange('famRel', e.target.value)}
            />
            <Select
              label="Method"
              value={formData.famMethod}
              onChange={(e) => handleInputChange('famMethod', e.target.value)}
              options={[
                { value: 'phone', label: 'Phone' },
                { value: 'in person', label: 'In Person' },
                { value: 'email', label: 'Email' }
              ]}
            />
          </div>
          <Textarea
            label="Family Response"
            placeholder="Family member's response..."
            value={formData.famResponse}
            onChange={(e) => handleInputChange('famResponse', e.target.value)}
            rows={2}
          />
        </div>
      </Card>

      {/* Preview */}
      <Card title="Live Note Preview">
        <div className="bg-slate-900 text-slate-200 p-6 rounded-xl font-mono text-sm min-h-[300px] whitespace-pre-wrap leading-relaxed mb-4">
          {generatedNote || 'Fill in the form to generate a COC note…'}
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleCopy} disabled={!generatedNote}>
            📋 Copy Note
          </Button>
          <Button variant="secondary" onClick={handlePolish} disabled={!generatedNote || isPolishing}>
            {isPolishing ? '✨ Polishing...' : '✨ AI Polish'}
          </Button>
          <Button variant="outline" onClick={handleOptimize} disabled={!generatedNote}>
            🔧 Optimize
          </Button>
          <Button variant="danger" onClick={handleClear}>
            🗑️ Clear Form
          </Button>
        </div>
        <div className="mt-4 text-xs text-slate-600">
          <strong className="text-blue-900">Audit reminder:</strong> Verify accuracy before signing; this tool does not replace clinical judgment.
        </div>
      </Card>
    </div>
  );
};

export default COCForm;

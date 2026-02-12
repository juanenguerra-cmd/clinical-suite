import React, { useState, useMemo } from 'react';
import { Card, Input, Textarea, Button, Select } from '../SharedUI';
import { polishNote } from '../../../services/geminiService';

const carePlanLibrary: Record<string, { goal: string; ints: string[] }> = {
  "Abuse Prevention: Risk of Victimization": {
    goal: "Resident will not be abused or victimised through review",
    ints: ["Advise resident to seek staff assistance", "Assess medical status and provide care", "Redirect away from potential harm", "Communicate with family about incident", "Counsel to avoid contact with aggressor", "Intervene to ensure safety", "Monitor for psychosocial distress", "Provide emotional support", "Remove alleged staff from assignment pending investigation"]
  },
  "Abuse Prevention: Substance Use History": {
    goal: "Resident will remain free of substance use through review",
    ints: ["Discuss relapse prevention", "Educate on low-risk behaviour", "Encourage Methadone Anonymous 1/week", "Encourage in-house chemical dependency program 4/week", "Monitor labs as ordered", "Urine toxicology after therapeutic pass"]
  },
  "Activities": {
    goal: "Participate in activities of choice through review",
    ints: ["Offer calendar of events daily", "Escort to programs PRN", "Provide adaptive equipment (large print, holders)", "Encourage family to attend", "Respect right to refuse", "Schedule rest periods between events", "Document participation/response", "Rotate activities to maintain interest"]
  },
  "Activity Intolerance: Emphysema": {
    goal: "Ambulate 50 ft on 1 L O2 without stopping for SOB through review",
    ints: ["Pulmonary rehab program as ordered", "6-minute walk test 4/week with RT/PT", "Monitor for extreme fatigue, chest pain, SOB, diaphoresis", "Energy conservation teaching"]
  },
  "ADL Functional/Rehab Potential": {
    goal: "Maintain/improve ADL independence through review",
    ints: ["Provide adaptive devices per OT/PT", "Task segmentation/1-step commands", "Encourage participation to fullest extent", "Schedule rehab services as ordered", "Monitor skin/bony prominences during transfers", "Praise all efforts at self-care", "Ensure call light within reach", "Educate on energy conservation techniques"]
  },
  "Advance Directive: End-of-Life": {
    goal: "Resident/family will verbalise understanding of advance directives through review",
    ints: ["Check purple charm on wristband every shift", "Clarify wishes: nutrition, hydration, treatment options, comfort", "Discuss HCP, Living Will, MOLST", "Flag chart appropriately", "Inform all staff of directives", "Provide care per wishes", "Review directives quarterly"]
  },
  "Airway Clearance Impaired: COPD": {
    goal: "Maintain patent airway through review",
    ints: ["Encourage coughing", "Incentive spirometry q2h while awake", "Elevate head of bed", "Aerosol bronchodilator treatments as ordered", "Monitor breath sounds", "Teach effective cough technique"]
  },
  "Alteration in Cardiovascular Status": {
    goal: "Remain free from cardiac complications through review",
    ints: ["Monitor vital signs and rhythm", "Administer cardiac meds as ordered", "Educate on energy conservation", "Apply oxygen as ordered", "Monitor for edema and report", "Daily weight and report gain >2 lb", "Elevate legs when sitting", "Reposition q2h"]
  },
  "Alteration in GI Status": {
    goal: "Remain free from GI discomfort or complications through review",
    ints: ["Administer meds as ordered", "Monitor BM pattern and characteristics", "Elevate head of bed after meals", "Encourage small frequent meals", "Avoid foods that aggravate condition", "Provide oral care after meals", "Monitor for GI bleeding"]
  },
  "Amputation": {
    goal: "Exhibit adequate coping and optimal function through review",
    ints: ["Provide emotional support re: loss", "Monitor stump wound daily", "Administer pain meds (including phantom pain)", "Encourage participation in rehab", "Teach stump care and wrapping", "Provide adaptive devices training"]
  },
  "Anemia": {
    goal: "Maintain Hgb >10 g/dL without complications through review",
    ints: ["Administer iron, B12, folate as ordered", "Encourage iron-rich foods", "Monitor fatigue and provide rest", "Check VS q shift", "Monitor for bleeding", "Obtain labs as ordered"]
  },
  "Antibiotic Therapy": {
    goal: "Remain free from adverse effects through review",
    ints: ["Administer antibiotics on time", "Monitor for diarrhea, rash, super-infection", "Obtain cultures before first dose", "Encourage fluids", "Report signs of allergic reaction", "Review need q 72 h"]
  },
  "Anticoagulant / Antiplatelet Therapy": {
    goal: "Remain free from bleeding complications through review",
    ints: ["Monitor PT/INR as ordered", "Check for bleeding gums, bruising, melena", "Apply pressure to all sticks (5 min)", "Ensure vitamin K available", "Educate on fall prevention", "Notify MD before invasive procedures"]
  },
  "Antiparkinson Therapy": {
    goal: "Remain free from medication adverse effects through review",
    ints: ["Administer on time (no delays)", "Monitor for dyskinesia, 'on-off' phenomenon", "Assess orthostatic BP", "Provide fall precautions", "Encourage fluid intake to prevent dry mouth", "Review meds q 3 months"]
  },
  "Antipsychotic Therapy": {
    goal: "Control behaviours with lowest effective dose through review",
    ints: ["Administer as ordered", "Monitor for EPS (tremor, rigidity, akathisia)", "Assess fall risk", "Use non-pharmacologic interventions first", "Review need q 3 months", "Document behavioural triggers"]
  },
  "Behavioral Symptoms": {
    goal: "Decrease behavioral episodes through review",
    ints: ["Identify triggers and avoid when possible", "Use calm approach/redirect", "Provide structured meaningful activities", "Monitor medication response/side effects", "Apply least-restraint principles", "Document antecedent-behavior-consequence", "Offer snacks/music/diversional tasks", "Ensure basic needs met (pain, toileting, thirst)"]
  },
  "Bowel Incontinence": {
    goal: "Maintain continence and skin integrity through review",
    ints: ["Toileting schedule q2h while awake", "Prompted voiding PRN", "Perineal care after each episode", "Monitor for UTI s/s", "Encourage 1500-2000 mL fluid/day unless CI", "Offer toilet before meals/therapy", "Document voiding pattern", "Apply barrier cream PRN"]
  },
  "Bowel Management: Constipation": {
    goal: "Pass soft formed stool every 3 days without complications",
    ints: ["Encourage fluids and high-fiber foods", "Follow facility bowel protocol", "Administer stool softeners/laxatives as ordered", "Monitor BM pattern daily", "Provide privacy during toileting", "Report no BM >72 h"]
  },
  "Cardiovascular / Circulatory": {
    goal: "Remain free from cardiac complications through review",
    ints: ["Monitor vital signs and rhythm", "Administer cardiac meds as ordered", "Educate on energy conservation", "Apply oxygen as ordered", "Monitor for edema and report", "Daily weight and report gain >2 lb", "Elevate legs when sitting", "Reposition q2h"]
  },
  "Cellulitis": {
    goal: "Infection resolves without complications through review",
    ints: ["Administer antibiotics as ordered", "Elevate affected area", "Monitor for red streaks, fever, increased pain", "Provide daily wound measurement", "Mark margins with ink", "Educate on skin hygiene"]
  },
  "Chronic Pain": {
    goal: "Pain <3/10 through review",
    ints: ["Assess pain (PQRST) q shift", "Administer ordered analgesic", "Provide non-pharmacologic comfort (ice, music, reposition)", "Document effectiveness", "Pre-medicate before painful procedures"]
  },
  "Cognitive Loss/Dementia": {
    goal: "Maintain current cognitive/ADL level through review",
    ints: ["Break tasks into 1-step directions", "Use resident's preferred name/eye contact", "Cue/reorient/supervise PRN", "Encourage choices during care", "Provide consistent routine/caregivers", "Monitor/report changes in cognition", "Engage in simple structured activities", "Reminisce with family photos", "Provide safety measures", "Review meds for cognitive side effects"]
  },
  "Communication Impaired": {
    goal: "Communicate needs effectively through review",
    ints: ["Use resident's preferred name/eye contact", "Reduce background noise", "Allow time to respond", "Use yes/no questions", "Validate message by repeating", "Provide communication aids (board, pictures)", "Refer to speech therapy PRN", "Monitor hearing aid function", "Encourage non-verbal cues (gestures, writing)"]
  },
  "Community Referral": {
    goal: "Facilitate safe discharge to community through review",
    ints: ["Assess home supports and barriers", "Coordinate home-care evaluation", "Order durable medical equipment", "Schedule follow-up MD appointments", "Educate resident/family on care needs", "Provide medication list/discharge instructions", "Arrange transportation", "Make post-discharge follow-up call"]
  },
  "Dehydration / Fluid Volume Deficit": {
    goal: "Maintain adequate hydration through review",
    ints: ["Offer 150 mL fluids q2h while awake", "Provide preferred beverages", "Monitor I&O per policy", "Assess skin turgor and mucous membranes", "Weigh daily if imbalance suspected", "Hold diuretics if AMS/hypotension"]
  },
  "Delirium": {
    goal: "Resident free of s/s of delirium through review",
    ints: ["Check urine for color/odor", "Use resident's preferred name/reduce distractions", "Consult IDT for baseline", "Educate resident/family on s/s to report", "Encourage family at bedside", "Engage in simple structured activities", "Ensure 1500 cc fluid/24 h", "Ensure hearing aids/glasses worn", "Enforce bowel/bladder routine", "Monitor I&O", "Monitor environment for change/noise", "Monitor safety (specify risks)", "Monitor/report new onset s/s", "Promote appropriate sensory stimulation", "Redirect/reorient PRN", "Review meds for reversible causes", "Turn/reposition q2h off-load heels"]
  },
  "Diabetes Mellitus": {
    goal: "Blood glucose 80-180 mg/dL and no complications through review",
    ints: ["Check finger-stick glucose as ordered", "Administer insulin/antidiabetics as ordered", "Encourage diabetic diet and meal completion", "Monitor for hypo/hyperglycemia s/s", "Provide foot care daily", "Place orange ID charm and check q shift"]
  },
  "Dysphagia / Aspiration Risk": {
    goal: "Remain free from aspiration through review",
    ints: ["Provide prescribed diet consistency", "Thicken liquids as ordered", "Position upright 30 min post meals", "Supervise all oral intake", "Encourage small bites/sips", "Provide oral care after meals", "Monitor for coughing/wet voice"]
  },
  "Edema / Fluid Overload": {
    goal: "Edema reduced by 1 cm within 48 h",
    ints: ["Elevate affected limb 15-20°", "Measure circumference daily", "Apply compression stockings", "Monitor for pitting", "Administer diuretics as ordered", "Restrict fluids as ordered"]
  },
  "Fall Risk (generic)": {
    goal: "Zero falls through review",
    ints: ["Yellow fall-risk charm checked q shift", "Bed/chair alarm on and tested", "Keep bed lowest position/locked", "Call light & belongings within reach", "Non-skid footwear while OOB", "Toilet q2-4h to prevent urgency"]
  },
  "Falls": {
    goal: "Remain free of falls/injury through review",
    ints: ["Yellow fall-risk charm checked every shift", "Bed/chair alarm on & tested per policy", "Keep bed lowest position/locked", "Call light & personal items within reach", "Non-skid footwear while OOB", "Toilet q2-4h to prevent urgency", "Monitor medications causing orthostasis", "Educate resident/family on safety"]
  },
  "Fever / Hyperthermia": {
    goal: "Temperature <37.2 C (99 F) through review",
    ints: ["Monitor temperature q4h", "Administer antipyretics as ordered", "Provide light clothing and cool environment", "Encourage fluids", "Offer tepid sponge baths PRN", "Report temperature >38.5 C (101.3 F)"]
  },
  "GERD": {
    goal: "Remain free from reflux discomfort through review",
    ints: ["Administer PPI/H2-blockers as ordered", "Elevate head of bed 30-45°", "Provide small frequent meals", "Avoid caffeine, alcohol, spicy foods", "Monitor for heartburn, regurgitation", "Educate on dietary triggers"]
  },
  "Heart Failure (CHF)": {
    goal: "Remain free from decompensation through review",
    ints: ["Monitor daily weight and report gain >2 lb", "Administer diuretics as ordered", "Restrict sodium and fluids as ordered", "Monitor for edema and JVD", "Elevate legs when sitting", "Auscultate lungs for crackles"]
  },
  "Hypertension": {
    goal: "BP <140/90 mmHg through review",
    ints: ["Monitor BP q shift and report >160/100", "Administer antihypertensives as ordered", "Encourage low-sodium diet", "Provide calm environment", "Educate on stress reduction", "Report headaches, vision changes"]
  },
  "Hypotension": {
    goal: "SBP >90 mmHg without symptoms through review",
    ints: ["Monitor BP before and after position changes", "Encourage fluid intake unless CI", "Administer volume expanders as ordered", "Elevate legs when sitting", "Educate on rising slowly", "Report dizziness or syncope"]
  },
  "Immune-Compromise / Infection Risk": {
    goal: "Remain free from infection through review",
    ints: ["Maintain neutropenic precautions if indicated", "Monitor temperature q4h", "Encourage hand hygiene", "Provide private room if WBC <1,000", "Avoid fresh flowers/undercooked foods", "Report fever >38 C (100.4 F)"]
  },
  "Infection": {
    goal: "Infection resolves without complication",
    ints: ["Monitor temp q4h", "Encourage >2 L fluid/day", "Hand hygiene q contact", "Obtain cultures per order"]
  },
  "IV Therapy": {
    goal: "IV site remains free from phlebitis and infiltration through review",
    ints: ["Assess site q8h for redness, swelling, pain", "Change tubing and dressing per policy", "Maintain patency with saline flushes", "Use sterile technique for all accesses", "Report temperature >38 C (100.4 F)", "Elevate limb if infiltration suspected"]
  },
  "Lung Sounds (Abnormal)": {
    goal: "Return to clear breath sounds through review",
    ints: ["Auscultate lungs q shift", "Administer bronchodilators as ordered", "Encourage coughing/deep breathing", "Provide chest physiotherapy", "Monitor O2 saturation", "Report increased work of breathing"]
  },
  "Medication Refusal": {
    goal: "Resume medication regimen without complications through review",
    ints: ["Assess reason for refusal", "Provide education on risks/benefits", "Offer liquid or crushed forms if appropriate", "Involve family or proxy", "Document refusal and notify MD", "Monitor for withdrawal or rebound"]
  },
  "Mood State": {
    goal: "Stabilize mood and reduce depressive s/s through review",
    ints: ["Administer antidepressant as ordered & monitor response", "Encourage attendance in group activities", "Provide positive reinforcement", "Assess sleep/appetite changes", "Offer counseling/psychotherapy PRN", "Involve family in care conferences", "Monitor for suicidal ideation per policy", "Document mood rating scale q shift"]
  },
  "Nutritional Status": {
    goal: "Maintain adequate nutrition/weight through review",
    ints: ["Offer >75% of meals/snacks", "Provide prescribed supplements", "Monitor weight weekly & document", "Encourage preferred foods within diet", "Assess denture fit/oral cavity", "Refer to dietitian for intake <50%", "Monitor labs (albumin, BMI) PRN", "Provide feeding assistance/devices as needed"]
  },
  "Oxygen Therapy": {
    goal: "Maintain O2 sat >92% through review",
    ints: ["Verify oxygen delivery device and flow rate", "Monitor O2 sat q shift", "Secure tubing and check for kinks", "Place 'O2 in use' sign on door", "Provide oral care q shift", "Report sat <90% or increased work of breathing"]
  },
  "Pain (generic)": {
    goal: "Pain <3/10 through review",
    ints: ["Assess pain (PQRST) q shift", "Administer ordered analgesic", "Provide non-pharmacologic comfort (ice, music, reposition)", "Document effectiveness", "Pre-medicate before painful procedures"]
  },
  "Pressure Ulcers": {
    goal: "Prevent skin breakdown and promote healing through review",
    ints: ["Turn/reposition q2h PRN", "Off-load heels with pillows", "Apply barrier cream after incontinent care", "Use pressure-redistribution mattress/cushion", "Monitor skin q shift & report redness", "Provide protein supplements as ordered", "Keep skin clean/dry", "Document wound measurements weekly"]
  },
  "Psychosocial Well-Being": {
    goal: "Maintain psychosocial comfort and reduce distress through review",
    ints: ["Assess/support family/significant relationships", "Encourage participation in preferred activities", "Provide 1:1 visits to verbalize feelings", "Support cultural/spiritual practices", "Discuss advance directives", "Facilitate family visits/phone calls", "Monitor mood/affect changes", "Refer to psychology/psychiatry PRN"]
  },
  "Renal Failure / Insufficiency": {
    goal: "Remain free from fluid/electrolyte imbalance through review",
    ints: ["Monitor I&O and daily weight", "Restrict sodium, potassium, phosphorus as ordered", "Administer phosphate binders with meals", "Monitor BUN/Cr and report", "Provide oral care q shift", "Observe access site for infection"]
  },
  "Respiratory Tract Infection": {
    goal: "Infection resolves without complications through review",
    ints: ["Administer antibiotics/antivirals as ordered", "Provide droplet precautions if indicated", "Encourage coughing/deep breathing", "Elevate head of bed 30-45°", "Monitor O2 saturation", "Offer warm fluids to loosen secretions"]
  },
  "Seizure Disorder": {
    goal: "Remain free from injury during seizure through review",
    ints: ["Maintain seizure precautions (padded rails, bed low)", "Administer anticonvulsants on time", "Monitor drug levels as ordered", "Observe and document seizure activity", "Suction and O2 available at bedside", "Educate on trigger avoidance"]
  },
  "Shortness of Breath": {
    goal: "Maintain O2 sat >92% with minimal dyspnea through review",
    ints: ["Administer bronchodilators as ordered", "Apply oxygen via prescribed device", "Elevate head of bed 30-45°", "Coach pursed-lip breathing", "Monitor respiratory rate and effort", "Report increased work of breathing"]
  },
  "Skin Integrity Risk": {
    goal: "Skin remains intact through review",
    ints: ["Reposition q2h while in bed", "Use pressure-redistribution cushion", "Keep skin clean and dry", "Apply barrier cream to at-risk areas", "Ensure adequate nutrition/hydration", "Daily skin inspection and report changes"]
  },
  "Stroke (CVA)": {
    goal: "Maintain optimal neurological function and prevent complications through review",
    ints: ["Monitor neuro status q shift", "Administer anticoagulants as ordered", "Provide PT/OT for motor deficits", "Encourage swallow evaluation if dysphagia", "Support affected side to prevent neglect", "Educate family on transfer techniques"]
  },
  "UTI": {
    goal: "Infection resolves without complications through review",
    ints: ["Administer antibiotics as ordered", "Encourage 2-3 L fluid/day unless CI", "Monitor I&O and urine color/odor", "Obtain urine C&S before first dose", "Provide perineal care after each void/BM", "Report dysuria, fever, confusion"]
  },
  "Wound / Surgical Incision": {
    goal: "Wound heals without infection or dehiscence through review",
    ints: ["Perform sterile dressing change as ordered", "Monitor for erythema, drainage, separation", "Maintain approximated edges with tape or Steri-Strips", "Report fever >38 C (100.4 F)", "Provide protein supplements", "Keep area dry and intact for 48 h"]
  }
};

const NewAdmissionForm: React.FC = () => {
  const [data, setData] = useState<any>({
    admitDate: '',
    admitTime: '',
    admitType: 'New admission',
    age: '',
    sex: '',
    unit: '',
    room: '',
    arrivalVia: '',
    fromFacility: '',
    primaryDx: '',
    secondaryDx: '',
    allergies: '',
    diet: '',
    liquids: '',
    temp: '',
    rr: '',
    hr: '',
    bp: '',
    o2: '',
    o2mode: 'room air',
    height: '',
    weight: '',
    orientation: '',
    pain: '',
    resp: '',
    cardio: '',
    gi: '',
    skin: '',
    functional: '',
    providerNote: 'Primary provider was notified of admission; orders were received and implemented. Medication reconciliation was completed and the comprehensive care plan was initiated.',
    heldMeds: '',
    vaccines: '',
    customPlan: ''
  });

  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>([]);
  const [selectedInterventions, setSelectedInterventions] = useState<string[]>([]);
  const [isPolishing, setIsPolishing] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleFocusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const picked = Array.from(e.target.selectedOptions).map(o => o.value);
    setSelectedFocusAreas(picked);
    
    // Auto-update interventions when focus changes
    const newIntSet = new Set<string>();
    picked.forEach(k => {
      carePlanLibrary[k]?.ints.forEach(i => newIntSet.add(i));
    });
    setSelectedInterventions(Array.from(newIntSet));
  };

  const handleIntToggle = (int: string) => {
    setSelectedInterventions(prev => 
      prev.includes(int) ? prev.filter(i => i !== int) : [...prev, int]
    );
  };

  const computeAdmitDay = (ymd: string) => {
    if (!ymd) return '';
    const start = new Date(ymd + 'T12:00:00');
    const now = new Date();
    const diff = Math.floor((now.getTime() - start.getTime()) / 86400000) + 1;
    return Math.min(7, Math.max(1, diff));
  };

  const generatedNote = useMemo(() => {
    const lines: string[] = [];
    const day = computeAdmitDay(data.admitDate);
    const dayPrefix = data.admitDate ? `${data.admitType} Day ${day}` : '';

    if (dayPrefix) lines.push(dayPrefix + '.');

    const who = `${data.age ? data.age + '-year-old ' : ''}${data.sex || 'resident'}`;
    const locParts = ['Long Beach NRC', data.unit, data.room].filter(Boolean);
    const loc = locParts.join(', ');
    
    const timeStr = data.admitTime ? ` at approximately ${data.admitTime} hrs` : '';
    const viaStr = data.arrivalVia ? ` via ${data.arrivalVia}` : '';
    const fromStr = data.fromFacility ? ` from ${data.fromFacility}` : '';

    if (data.admitDate) {
      lines.push(`${who} admitted to ${loc} on ${new Date(data.admitDate + 'T00:00:00').toLocaleDateString()} ${timeStr}${viaStr}${fromStr}.`);
    }

    if (data.primaryDx) lines.push(`Primary problems on admission include ${data.primaryDx}.`);
    
    const secDx = data.secondaryDx.split('
').map((s: string) => s.trim()).filter(Boolean);
    if (secDx.length) lines.push(`Secondary diagnoses include ${secDx.join(', ')}.`);

    if (data.orientation) lines.push(`On arrival, orientation: ${data.orientation}.`);
    if (data.allergies) lines.push(`Allergies per admission record: ${data.allergies}.`);

    const v = [];
    if (data.temp) v.push(`T ${data.temp}`);
    if (data.rr) v.push(`R ${data.rr}`);
    if (data.hr) v.push(`P ${data.hr}`);
    if (data.bp) v.push(`BP ${data.bp}`);
    if (data.o2) v.push(`O2 ${data.o2}${data.o2mode ? ' on ' + data.o2mode : ''}`);
    if (data.height) v.push(`Ht ${data.height}`);
    if (data.weight) v.push(`Wt ${data.weight}`);
    if (v.length) lines.push(`Vital signs on admission: ${v.join(', ')}.`);

    const dietBits = [];
    if (data.diet) dietBits.push(data.diet);
    if (data.liquids) dietBits.push(data.liquids);
    if (dietBits.length) lines.push(`Diet order: ${dietBits.join(' with ')}.`);

    if (data.resp) lines.push(`Respiratory: ${data.resp}.`);
    if (data.cardio) lines.push(`Cardiovascular: ${data.cardio}.`);
    if (data.gi) lines.push(`GI/GU: ${data.gi}.`);
    if (data.skin) lines.push(`Skin: ${data.skin}.`);
    if (data.functional) lines.push(`Functional status: ${data.functional}.`);
    if (data.pain) lines.push(`Pain: ${data.pain}.`);

    if (selectedInterventions.length) lines.push(`Interventions initiated: ${selectedInterventions.join('; ')}.`);
    if (data.customPlan) lines.push(data.customPlan + (data.customPlan.endsWith('.') ? '' : '.'));
    if (data.vaccines) lines.push(data.vaccines + (data.vaccines.endsWith('.') ? '' : '.'));
    if (data.providerNote) lines.push(data.providerNote + (data.providerNote.endsWith('.') ? '' : '.'));

    const held = data.heldMeds.split('
').map((s: string) => s.trim()).filter(Boolean);
    if (held.length) lines.push(`Following due medications were held on admission pending delivery: ${held.join(', ')}.`);

    lines.push(`Will continue to monitor and notify the provider of any significant change in condition.`);

    return lines.join(' ').replace(/\s{2,}/g, ' ').trim();
  }, [data, selectedInterventions]);

  const handlePolish = async () => {
    setIsPolishing(true);
    try {
      const polished = await polishNote(generatedNote);
      setData({ ...data, providerNote: polished });
    } catch (e) {
      console.error(e);
    } finally {
      setIsPolishing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card title="1. Admission Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Admission Date" name="admitDate" type="date" value={data.admitDate} onChange={handleChange} />
          <Input label="Admission Time (Optional)" name="admitTime" type="time" value={data.admitTime} onChange={handleChange} />
          <Select 
            label="Admission Type" 
            name="admitType" 
            value={data.admitType} 
            onChange={handleChange}
            options={[{ value: 'New admission', label: 'New admission' }, { value: 'Re-admission', label: 'Re-admission' }]}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input label="Age" name="age" type="number" value={data.age} onChange={handleChange} />
            <Select 
              label="Sex" 
              name="sex" 
              value={data.sex} 
              onChange={handleChange}
              options={[{ value: '', label: 'Select' }, { value: 'female', label: 'Female' }, { value: 'male', label: 'Male' }]}
            />
          </div>
          <Input label="Unit" name="unit" value={data.unit} onChange={handleChange} placeholder="e.g., Unit 2" />
          <Input label="Room" name="room" value={data.room} onChange={handleChange} placeholder="e.g., 255A" />
          <Input label="Arrival Via" name="arrivalVia" value={data.arrivalVia} onChange={handleChange} placeholder="e.g., EMS stretcher" />
          <Input label="Admitted From" name="fromFacility" value={data.fromFacility} onChange={handleChange} placeholder="e.g., Hospital name" />
        </div>
      </Card>

      <Card title="2. Diagnoses">
        <Textarea label="Primary Diagnosis / Problem List" name="primaryDx" value={data.primaryDx} onChange={handleChange} />
        <Textarea label="Secondary Diagnoses (one per line)" name="secondaryDx" value={data.secondaryDx} onChange={handleChange} />
      </Card>

      <Card title="3. Allergies & Diet">
        <Textarea label="Allergies" name="allergies" value={data.allergies} onChange={handleChange} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Input label="Diet" name="diet" value={data.diet} onChange={handleChange} />
          <Input label="Liquids" name="liquids" value={data.liquids} onChange={handleChange} />
        </div>
      </Card>

      <Card title="4. Vital Signs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Input label="Temp" name="temp" value={data.temp} onChange={handleChange} />
          <Input label="RR" name="rr" value={data.rr} onChange={handleChange} />
          <Input label="HR" name="hr" value={data.hr} onChange={handleChange} />
          <Input label="BP" name="bp" value={data.bp} onChange={handleChange} />
          <Input label="O2 Sat" name="o2" value={data.o2} onChange={handleChange} />
          <Select 
            label="O2 Mode" 
            name="o2mode" 
            value={data.o2mode} 
            onChange={handleChange}
            options={[
              { value: 'room air', label: 'Room air' },
              { value: 'nasal cannula', label: 'Nasal cannula' },
              { value: 'mask', label: 'Mask' }
            ]}
          />
          <Input label="Height" name="height" value={data.height} onChange={handleChange} />
          <Input label="Weight" name="weight" value={data.weight} onChange={handleChange} />
        </div>
      </Card>

      <Card title="5. Admission Assessment">
        <Select 
          label="Orientation" 
          name="orientation" 
          value={data.orientation} 
          onChange={handleChange}
          options={[
            { value: '', label: 'Select' },
            { value: 'Alert and oriented to person, place, and time', label: 'AO x3' },
            { value: 'Alert and oriented to person and place; intermittently confused', label: 'AO x2' },
            { value: 'Alert and oriented to person only; confused', label: 'AO x1' },
            { value: 'Not oriented; confused/disoriented', label: 'Disoriented' },
            { value: 'Drowsy/lethargic but arousable', label: 'Drowsy' }
          ]}
        />
        <Input label="Pain" name="pain" value={data.pain} onChange={handleChange} />
        <Textarea label="Respiratory" name="resp" value={data.resp} onChange={handleChange} />
        <Textarea label="Cardiovascular" name="cardio" value={data.cardio} onChange={handleChange} />
        <Textarea label="GI/GU" name="gi" value={data.gi} onChange={handleChange} />
        <Textarea label="Skin" name="skin" value={data.skin} onChange={handleChange} />
        <Textarea label="Functional Status" name="functional" value={data.functional} onChange={handleChange} />
      </Card>

      <Card title="6. Monitoring Plan">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Focus Areas (Pick one or more)</label>
          <select 
            multiple 
            className="w-full border rounded-md p-2 h-40"
            onChange={handleFocusChange}
            value={selectedFocusAreas}
          >
            {Object.keys(carePlanLibrary).map(k => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Suggested Interventions</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto border p-2 rounded">
            {Array.from(new Set(selectedFocusAreas.flatMap(k => carePlanLibrary[k]?.ints || []))).map(int => (
              <label key={int} className="flex items-center space-x-2 text-sm cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={selectedInterventions.includes(int)} 
                  onChange={() => handleIntToggle(int)} 
                />
                <span>{int}</span>
              </label>
            ))}
          </div>
        </div>
        
        <Textarea label="Custom Monitoring Plan" name="customPlan" value={data.customPlan} onChange={handleChange} />
      </Card>

      <Card title="7. Provider Orders & Misc.">
        <Textarea label="Provider Notification / Orders" name="providerNote" value={data.providerNote} onChange={handleChange} />
        <Textarea label="Medications Held (one per line)" name="heldMeds" value={data.heldMeds} onChange={handleChange} />
        <Textarea label="Vaccines" name="vaccines" value={data.vaccines} onChange={handleChange} />
      </Card>

      <Card title="Note Preview">
        <div className="p-4 bg-gray-900 text-gray-100 rounded-lg font-mono text-sm whitespace-pre-wrap min-h-[200px]">
          {generatedNote || "Fill the form to generate the note preview"}
        </div>
        <div className="flex gap-4 mt-6">
          <Button onClick={() => navigator.clipboard.writeText(generatedNote)}>Copy Note</Button>
          <Button onClick={handlePolish} loading={isPolishing} variant="secondary">Polish with AI</Button>
          <Button onClick={() => setData({
            admitDate: '', admitTime: '', admitType: 'New admission', age: '', sex: '', unit: '', room: '', arrivalVia: '', fromFacility: '',
            primaryDx: '', secondaryDx: '', allergies: '', diet: '', liquids: '', temp: '', rr: '', hr: '', bp: '', o2: '', o2mode: 'room air',
            height: '', weight: '', orientation: '', pain: '', resp: '', cardio: '', gi: '', skin: '', functional: '',
            providerNote: 'Primary provider was notified of admission; orders were received and implemented. Medication reconciliation was completed and the comprehensive care plan was initiated.',
            heldMeds: '', vaccines: '', customPlan: ''
          })} variant="danger">Clear Form</Button>
        </div>
      </Card>
    </div>
  );
};

export default NewAdmissionForm;

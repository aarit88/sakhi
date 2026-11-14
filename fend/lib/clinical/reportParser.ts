export type MarkerStatus = 'low' | 'normal' | 'high' | 'critical' | 'unknown';

export interface PatientContext {
  age?: number;
  pregnant?: boolean;
}

export interface ParsedMarker {
  key: string;
  label: string;
  category: string;
  value: number;
  rawValue: string;
  unit: string;
  detectedUnit?: string;
  status: MarkerStatus;
  referenceRange: string;
  finding: string;
  confidence: 'high' | 'verify_unit';
}

export interface ReportAlert {
  severity: 'info' | 'caution' | 'urgent';
  title: string;
  message: string;
}

export interface ClinicalReportResult {
  markers: ParsedMarker[];
  alerts: ReportAlert[];
  summary: string;
  possibleFocusAreas: string[];
  suggestedQuestions: string[];
  uncertaintyFlags: string[];
  rawTextPreview: string;
  disclaimer: string;
}

type MarkerDefinition = {
  key: string;
  label: string;
  category: string;
  aliases: string[];
  unit: string;
  unitPattern?: string;
  min?: number;
  max?: number;
  criticalLow?: number;
  criticalHigh?: number;
  lowFinding?: string;
  highFinding?: string;
  normalFinding: string;
  normalize?: (value: number, unit?: string) => number;
};

const numberPattern = '([-+]?\\d{1,3}(?:,\\d{3})*(?:\\.\\d+)?|[-+]?\\d+(?:\\.\\d+)?)';
const defaultUnitPattern = '[a-zA-Z%/\\^0-9.uLmcgdl-]+';

const markerDefinitions: MarkerDefinition[] = [
  {
    key: 'hemoglobin',
    label: 'Hemoglobin',
    category: 'CBC',
    aliases: ['hemoglobin', 'haemoglobin', 'hb'],
    unit: 'g/dL',
    unitPattern: 'g\\s*/?\\s*dL|gm\\s*%|g%',
    min: 12,
    max: 15.5,
    criticalLow: 7,
    criticalHigh: 18,
    lowFinding: 'Low hemoglobin can fit anemia and should be interpreted with ferritin, B12, folate, and bleeding history.',
    highFinding: 'High hemoglobin can happen with dehydration or other medical causes and needs clinician review if persistent.',
    normalFinding: 'Hemoglobin is within a typical adult female range.',
  },
  {
    key: 'rbc',
    label: 'RBC Count',
    category: 'CBC',
    aliases: ['rbc count', 'red blood cell count', 'rbc'],
    unit: 'million/uL',
    min: 3.8,
    max: 5.1,
    lowFinding: 'Low RBC count may support anemia when hemoglobin or hematocrit are also low.',
    highFinding: 'High RBC count may need review with hydration status, oxygen levels, and hemoglobin.',
    normalFinding: 'RBC count is within a typical adult female range.',
  },
  {
    key: 'wbc',
    label: 'WBC Count',
    category: 'CBC',
    aliases: ['total leukocyte count', 'total leucocyte count', 'white blood cell count', 'wbc count', 'tlc', 'wbc'],
    unit: '10^3/uL',
    min: 4,
    max: 11,
    criticalLow: 2,
    criticalHigh: 30,
    normalize: (value) => (value > 1000 ? value / 1000 : value),
    lowFinding: 'Low WBC can increase infection risk and should be reviewed with the differential count.',
    highFinding: 'High WBC can occur with infection, inflammation, stress, steroids, or other causes.',
    normalFinding: 'WBC count is within a typical adult range.',
  },
  {
    key: 'platelets',
    label: 'Platelet Count',
    category: 'CBC',
    aliases: ['platelet count', 'platelets', 'plt'],
    unit: '10^3/uL',
    min: 150,
    max: 450,
    criticalLow: 50,
    criticalHigh: 1000,
    normalize: (value) => (value > 1000 ? value / 1000 : value),
    lowFinding: 'Low platelets can increase bleeding risk and should be discussed promptly.',
    highFinding: 'High platelets can be reactive to inflammation, iron deficiency, or other conditions.',
    normalFinding: 'Platelet count is within a typical adult range.',
  },
  {
    key: 'neutrophils',
    label: 'Neutrophils',
    category: 'CBC Differential',
    aliases: ['neutrophils', 'neutrophil'],
    unit: '%',
    unitPattern: '%',
    min: 40,
    max: 75,
    lowFinding: 'Low neutrophil percentage should be interpreted with absolute neutrophil count.',
    highFinding: 'High neutrophil percentage can occur with infection, inflammation, or stress.',
    normalFinding: 'Neutrophil percentage is within a typical range.',
  },
  {
    key: 'lymphocytes',
    label: 'Lymphocytes',
    category: 'CBC Differential',
    aliases: ['lymphocytes', 'lymphocyte'],
    unit: '%',
    unitPattern: '%',
    min: 20,
    max: 45,
    lowFinding: 'Low lymphocyte percentage can occur with stress, steroid use, or infections.',
    highFinding: 'High lymphocyte percentage can occur with viral infections or immune responses.',
    normalFinding: 'Lymphocyte percentage is within a typical range.',
  },
  {
    key: 'esr',
    label: 'ESR',
    category: 'Inflammation',
    aliases: ['erythrocyte sedimentation rate', 'esr'],
    unit: 'mm/hr',
    unitPattern: 'mm\\s*/?\\s*hr|mm\\s*1st\\s*hr',
    min: 0,
    max: 20,
    highFinding: 'High ESR is a nonspecific inflammation marker and needs symptom context.',
    normalFinding: 'ESR is within a typical adult female range.',
  },
  {
    key: 'tsh',
    label: 'TSH',
    category: 'Thyroid',
    aliases: ['thyroid stimulating hormone', 'serum tsh', 'tsh'],
    unit: 'mIU/L',
    unitPattern: 'mIU\\s*/?\\s*L|uIU\\s*/?\\s*mL|microIU\\s*/?\\s*mL',
    min: 0.4,
    max: 4,
    criticalLow: 0.05,
    criticalHigh: 10,
    lowFinding: 'Low TSH can fit hyperthyroid patterns and should be checked with free T4/T3.',
    highFinding: 'High TSH can fit hypothyroid patterns and should be reviewed with free T4 and symptoms.',
    normalFinding: 'TSH is within a common adult reference range.',
  },
  {
    key: 'fasting_glucose',
    label: 'Fasting Glucose',
    category: 'Glucose',
    aliases: ['fasting blood sugar', 'fasting plasma glucose', 'fasting glucose', 'fbs'],
    unit: 'mg/dL',
    unitPattern: 'mg\\s*/?\\s*dL',
    min: 70,
    max: 99,
    criticalLow: 54,
    criticalHigh: 300,
    lowFinding: 'Low fasting glucose can cause shakiness or faintness and needs review.',
    highFinding: 'High fasting glucose can suggest impaired glucose regulation and should be confirmed by a clinician.',
    normalFinding: 'Fasting glucose is within a typical target range.',
  },
  {
    key: 'random_glucose',
    label: 'Random Glucose',
    category: 'Glucose',
    aliases: ['random blood sugar', 'random plasma glucose', 'random glucose', 'rbs'],
    unit: 'mg/dL',
    unitPattern: 'mg\\s*/?\\s*dL',
    min: 70,
    max: 140,
    criticalLow: 54,
    criticalHigh: 300,
    lowFinding: 'Low random glucose may need urgent attention if symptomatic.',
    highFinding: 'High random glucose should be interpreted with meal timing and HbA1c.',
    normalFinding: 'Random glucose is within a common non-fasting range.',
  },
  {
    key: 'hba1c',
    label: 'HbA1c',
    category: 'Glucose',
    aliases: ['glycated hemoglobin', 'glycosylated hemoglobin', 'hba1c', 'hb a1c'],
    unit: '%',
    unitPattern: '%',
    min: 4,
    max: 5.6,
    highFinding: 'High HbA1c can suggest prediabetes or diabetes depending on clinical context.',
    normalFinding: 'HbA1c is within a typical non-diabetic range.',
  },
  {
    key: 'vitamin_d',
    label: 'Vitamin D',
    category: 'Vitamins',
    aliases: ['25 hydroxy vitamin d', '25-oh vitamin d', 'vitamin d3', 'vitamin d'],
    unit: 'ng/mL',
    unitPattern: 'ng\\s*/?\\s*mL',
    min: 30,
    max: 100,
    lowFinding: 'Low vitamin D is common and should be discussed for sunlight/diet/supplement planning.',
    highFinding: 'High vitamin D should be reviewed with supplement intake and calcium levels.',
    normalFinding: 'Vitamin D is within a common target range.',
  },
  {
    key: 'vitamin_b12',
    label: 'Vitamin B12',
    category: 'Vitamins',
    aliases: ['vitamin b12', 'b12'],
    unit: 'pg/mL',
    unitPattern: 'pg\\s*/?\\s*mL',
    min: 200,
    max: 900,
    lowFinding: 'Low B12 can contribute to fatigue, nerve tingling, anemia, or brain fog.',
    highFinding: 'High B12 is often supplement-related; interpret clinically if unexplained.',
    normalFinding: 'Vitamin B12 is within a common reference range.',
  },
  {
    key: 'ferritin',
    label: 'Ferritin',
    category: 'Iron',
    aliases: ['serum ferritin', 'ferritin'],
    unit: 'ng/mL',
    unitPattern: 'ng\\s*/?\\s*mL',
    min: 15,
    max: 150,
    lowFinding: 'Low ferritin suggests low iron stores and relates closely to heavy periods, fatigue, or hair shedding.',
    highFinding: 'High ferritin can rise with inflammation, liver disease, or iron overload.',
    normalFinding: 'Ferritin is within a typical adult female range.',
  },
  {
    key: 'creatinine',
    label: 'Creatinine',
    category: 'Kidney',
    aliases: ['serum creatinine', 'creatinine'],
    unit: 'mg/dL',
    unitPattern: 'mg\\s*/?\\s*dL',
    min: 0.6,
    max: 1.1,
    criticalHigh: 2,
    lowFinding: 'Low creatinine can reflect lower muscle mass and is interpreted with context.',
    highFinding: 'High creatinine can suggest reduced kidney filtering and should be reviewed with eGFR.',
    normalFinding: 'Creatinine is within a typical adult female range.',
  },
  {
    key: 'alt',
    label: 'ALT/SGPT',
    category: 'Liver',
    aliases: ['sgpt', 'alt'],
    unit: 'U/L',
    unitPattern: 'U\\s*/?\\s*L|IU\\s*/?\\s*L',
    min: 7,
    max: 35,
    criticalHigh: 200,
    lowFinding: 'Low ALT is usually not clinically significant.',
    highFinding: 'High ALT can reflect liver irritation and should be reviewed with AST and medicines.',
    normalFinding: 'ALT is within a typical adult female range.',
  },
  {
    key: 'ast',
    label: 'AST/SGOT',
    category: 'Liver',
    aliases: ['sgot', 'ast'],
    unit: 'U/L',
    unitPattern: 'U\\s*/?\\s*L|IU\\s*/?\\s*L',
    min: 8,
    max: 40,
    criticalHigh: 200,
    lowFinding: 'Low AST is usually not clinically significant.',
    highFinding: 'High AST can reflect liver or muscle irritation and should be interpreted with ALT.',
    normalFinding: 'AST is within a typical adult range.',
  },
  {
    key: 'total_cholesterol',
    label: 'Total Cholesterol',
    category: 'Lipids',
    aliases: ['total cholesterol', 'cholesterol total'],
    unit: 'mg/dL',
    unitPattern: 'mg\\s*/?\\s*dL',
    max: 199,
    highFinding: 'High total cholesterol should be reviewed with LDL, HDL, and triglycerides.',
    normalFinding: 'Total cholesterol is within a common desirable range.',
  },
  {
    key: 'ldl',
    label: 'LDL Cholesterol',
    category: 'Lipids',
    aliases: ['ldl cholesterol', 'ldl-c', 'ldl'],
    unit: 'mg/dL',
    unitPattern: 'mg\\s*/?\\s*dL',
    max: 100,
    highFinding: 'High LDL can increase long-term cardiovascular risk and should be discussed with a clinician.',
    normalFinding: 'LDL is within a common target range.',
  },
  {
    key: 'hdl',
    label: 'HDL Cholesterol',
    category: 'Lipids',
    aliases: ['hdl cholesterol', 'hdl-c', 'hdl'],
    unit: 'mg/dL',
    unitPattern: 'mg\\s*/?\\s*dL',
    min: 50,
    lowFinding: 'Low HDL can increase cardiovascular risk and is interpreted with the full lipid profile.',
    normalFinding: 'HDL is at or above a common protective target for women.',
  },
  {
    key: 'triglycerides',
    label: 'Triglycerides',
    category: 'Lipids',
    aliases: ['triglycerides', 'tg'],
    unit: 'mg/dL',
    unitPattern: 'mg\\s*/?\\s*dL',
    max: 150,
    criticalHigh: 500,
    highFinding: 'High triglycerides can be affected by diet, insulin resistance, thyroid status, or genetics.',
    normalFinding: 'Triglycerides are within a common target range.',
  },
];

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function aliasToPattern(alias: string) {
  return escapeRegExp(alias).replace(/\s+/g, '\\s+').replace(/-/g, '[-\\s]?');
}

function parseNumber(rawValue: string) {
  return Number(rawValue.replace(/,/g, ''));
}

function findMarkerValue(text: string, definition: MarkerDefinition) {
  for (const alias of definition.aliases) {
    const aliasPattern = aliasToPattern(alias);
    const unitPattern = definition.unitPattern ?? defaultUnitPattern;
    const pattern = new RegExp(
      `(?:^|[^A-Za-z0-9])${aliasPattern}[^\\d\\n-]{0,45}${numberPattern}\\s*(${unitPattern})?`,
      'im'
    );
    const match = text.match(pattern);
    if (!match) continue;

    const rawValue = match[1];
    const detectedUnit = match[2]?.trim();
    const parsedValue = parseNumber(rawValue);
    if (!Number.isFinite(parsedValue)) continue;

    const normalizedValue = definition.normalize
      ? definition.normalize(parsedValue, detectedUnit)
      : parsedValue;

    return {
      rawValue,
      value: Number(normalizedValue.toFixed(2)),
      detectedUnit,
      confidence: (detectedUnit ? 'high' : 'verify_unit') as 'high' | 'verify_unit',
    };
  }
  return null;
}

function statusFor(value: number, definition: MarkerDefinition): MarkerStatus {
  if (definition.criticalLow !== undefined && value <= definition.criticalLow) return 'critical';
  if (definition.criticalHigh !== undefined && value >= definition.criticalHigh) return 'critical';
  if (definition.min !== undefined && value < definition.min) return 'low';
  if (definition.max !== undefined && value > definition.max) return 'high';
  return 'normal';
}

function referenceRange(definition: MarkerDefinition) {
  if (definition.min !== undefined && definition.max !== undefined) {
    return `${definition.min}-${definition.max} ${definition.unit}`;
  }
  if (definition.min !== undefined) return `>= ${definition.min} ${definition.unit}`;
  if (definition.max !== undefined) return `<= ${definition.max} ${definition.unit}`;
  return `See lab range (${definition.unit})`;
}

function findingFor(status: MarkerStatus, definition: MarkerDefinition) {
  if (status === 'low') return definition.lowFinding ?? `${definition.label} is below the expected range.`;
  if (status === 'high') return definition.highFinding ?? `${definition.label} is above the expected range.`;
  if (status === 'critical') {
    if (definition.criticalLow !== undefined && definition.lowFinding)
      return `Critical low range. ${definition.lowFinding}`;
    if (definition.criticalHigh !== undefined && definition.highFinding)
      return `Critical high range. ${definition.highFinding}`;
    return `${definition.label} is in a critical range and should be reviewed urgently.`;
  }
  return definition.normalFinding;
}

export function parseClinicalReport(
  rawText: string,
  context?: PatientContext,
  extraUncertainty: string[] = []
): ClinicalReportResult {
  const normalizedText = rawText
    .replace(/\r/g, '\n')
    .replace(/[|]/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .slice(0, 20_000);

  const markers = markerDefinitions
    .map((definition): ParsedMarker | null => {
      const detected = findMarkerValue(normalizedText, definition);
      if (!detected) return null;

      const status = statusFor(detected.value, definition);
      return {
        key: definition.key,
        label: definition.label,
        category: definition.category,
        value: detected.value,
        rawValue: detected.rawValue,
        unit: definition.unit,
        detectedUnit: detected.detectedUnit,
        status,
        referenceRange: referenceRange(definition),
        finding: findingFor(status, definition),
        confidence: detected.confidence,
      };
    })
    .filter((m): m is ParsedMarker => m !== null);

  const uncertaintyFlags = [...extraUncertainty];
  markers
    .filter((m) => m.confidence === 'verify_unit')
    .forEach((m) =>
      uncertaintyFlags.push(
        `Unit was not printed next to ${m.label} (${m.value}); assumed ${m.unit}. Please verify against your lab sheet.`
      )
    );

  const focus = new Set<string>();
  const abnormal = markers.filter((m) => m.status !== 'normal');
  if (abnormal.some((m) => ['hemoglobin', 'rbc', 'ferritin', 'vitamin_b12'].includes(m.key))) {
    focus.add('Anemia, iron stores, or B12 status');
  }
  if (abnormal.some((m) => m.category === 'Thyroid')) focus.add('Thyroid function');
  if (abnormal.some((m) => m.category === 'Glucose')) focus.add('Glucose regulation');
  if (abnormal.some((m) => m.category === 'Lipids')) focus.add('Cardiometabolic risk');
  if (abnormal.some((m) => m.category === 'Liver')) focus.add('Liver enzymes');
  if (abnormal.some((m) => m.category === 'Kidney')) focus.add('Kidney function');
  if (abnormal.some((m) => ['wbc', 'neutrophils', 'lymphocytes', 'esr'].includes(m.key))) {
    focus.add('Infection or inflammation context');
  }
  if (abnormal.some((m) => m.category === 'Vitamins')) focus.add('Vitamin status and supplementation plan');
  const possibleFocusAreas = Array.from(focus);

  const alerts: ReportAlert[] = [];
  const critical = markers.filter((m) => m.status === 'critical');
  if (critical.length > 0) {
    alerts.push({
      severity: 'urgent',
      title: 'Urgent review recommended',
      message: `${critical.map((m) => m.label).join(', ')} reached a critical threshold. Please contact a clinician urgently.`,
    });
  }
  if (abnormal.filter((m) => m.status !== 'critical').length > 0) {
    alerts.push({
      severity: 'caution',
      title: 'Out-of-range markers detected',
      message: `${abnormal.length} marker${abnormal.length === 1 ? '' : 's'} fall outside typical adult female reference ranges.`,
    });
  }
  if (context?.pregnant) {
    alerts.push({
      severity: 'info',
      title: 'Pregnancy reference note',
      message: 'Pregnancy shifts several laboratory reference ranges; review these figures with your obstetric clinician.',
    });
  }
  if (markers.length === 0) {
    alerts.push({
      severity: 'info',
      title: 'Manual review recommended',
      message: 'No standard lab markers matched automatically. Paste clear report text or verify OCR scan clarity.',
    });
  }

  const questions = [
    'Which values are most important for my symptoms and cycle stage?',
    'Should any of these markers be repeated or confirmed?',
    'Do my lab’s printed reference ranges differ from typical adult ranges?',
  ];
  if (possibleFocusAreas.includes('Anemia, iron stores, or B12 status')) {
    questions.push('Could menstrual blood loss, ferritin, or B12 explain my fatigue or symptoms?');
  }
  if (possibleFocusAreas.includes('Thyroid function')) {
    questions.push('Should we check free T4, free T3, or thyroid antibodies?');
  }
  if (possibleFocusAreas.includes('Glucose regulation')) {
    questions.push('Do these glucose markers suggest HbA1c follow-up or nutrition adjustments?');
  }

  const summary =
    markers.length === 0
      ? 'No supported lab markers were detected automatically from the provided text.'
      : `Detected ${markers.length} clinical marker${markers.length === 1 ? '' : 's'}; ${abnormal.length} outside typical adult female reference ranges.`;

  return {
    markers,
    alerts,
    summary,
    possibleFocusAreas,
    suggestedQuestions: questions,
    uncertaintyFlags,
    rawTextPreview: normalizedText.slice(0, 1200),
    disclaimer:
      'Automated report parsing can contain OCR errors and does not diagnose disease. Always verify readings against your printed lab report and discuss results with a qualified clinician.',
  };
}

export function isValidFileType(buffer: Buffer, claimedMime?: string): { valid: boolean; ext?: string; mime?: string } {
  if (buffer.length < 4) return { valid: false };

  // PDF: %PDF
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return { valid: true, ext: 'pdf', mime: 'application/pdf' };
  }
  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, ext: 'jpg', mime: 'image/jpeg' };
  }
  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return { valid: true, ext: 'png', mime: 'image/png' };
  }
  // WEBP: RIFF....WEBP
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer.slice(8, 12).toString('ascii') === 'WEBP'
  ) {
    return { valid: true, ext: 'webp', mime: 'image/webp' };
  }
  // Plain text report upload
  if (claimedMime === 'text/plain') {
    return { valid: true, ext: 'txt', mime: 'text/plain' };
  }

  return { valid: false };
}

export function compareParsedReports(
  older: ParsedMarker[],
  newer: ParsedMarker[]
): Array<{
  key: string;
  label: string;
  unit: string;
  previousValue: number;
  currentValue: number;
  delta: number;
  direction: 'increased' | 'decreased' | 'unchanged';
  currentStatus: MarkerStatus;
}> {
  const olderMap = new Map(older.map((m) => [m.key, m]));
  const diffs: Array<{
    key: string;
    label: string;
    unit: string;
    previousValue: number;
    currentValue: number;
    delta: number;
    direction: 'increased' | 'decreased' | 'unchanged';
    currentStatus: MarkerStatus;
  }> = [];

  for (const curr of newer) {
    const prev = olderMap.get(curr.key);
    if (!prev) continue;
    const delta = Number((curr.value - prev.value).toFixed(2));
    diffs.push({
      key: curr.key,
      label: curr.label,
      unit: curr.unit,
      previousValue: prev.value,
      currentValue: curr.value,
      delta,
      direction: delta > 0 ? 'increased' : delta < 0 ? 'decreased' : 'unchanged',
      currentStatus: curr.status,
    });
  }
  return diffs;
}

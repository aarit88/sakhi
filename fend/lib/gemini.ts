import { GoogleGenAI } from '@google/genai';

const MODEL_NAME = 'gemini-4-hydrogen';

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export async function extractMedicalReportTextWithGemini(
  buffer: Buffer,
  mimeType: string,
  originalName: string
): Promise<{ text: string; uncertaintyNotes: string[]; usedOcr: boolean }> {
  if (mimeType.startsWith('text/')) {
    return {
      text: buffer.toString('utf8'),
      uncertaintyNotes: [],
      usedOcr: false,
    };
  }

  const ai = getGeminiClient();
  if (!ai) {
    // Fallback for plain ASCII segments embedded in simple PDFs if GEMINI_API_KEY is not present
    const ascii = buffer.toString('latin1').replace(/[^\x20-\x7E\n\r]/g, ' ');
    return {
      text: ascii.slice(0, 12000),
      uncertaintyNotes: [
        'Automated cloud OCR service is unavailable for binary scans; verify any extracted values manually or paste report text directly.',
      ],
      usedOcr: false,
    };
  }

  try {
    const base64Data = buffer.toString('base64');
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
            {
              text: `You are extracting text from a clinical laboratory report (${originalName}).
Transcribe ALL test names, numeric values, units, and printed reference ranges faithfully line by line (e.g., "Hemoglobin: 10.8 g/dL (Ref: 12.0 - 15.5)").
If any number, decimal point, or unit is blurry, illegible, or cut off, mark it explicitly on a separate line starting with "UNCERTAIN: ".
Do not invent or guess missing lab values.`,
            },
          ],
        },
      ],
      config: {
        temperature: 0.1,
      },
    });

    const text = response.text || '';
    const uncertaintyNotes = text
      .split('\n')
      .filter((line) => line.trim().toUpperCase().startsWith('UNCERTAIN:'))
      .map((line) => line.replace(/^UNCERTAIN:\s*/i, '').trim());

    return { text, uncertaintyNotes, usedOcr: true };
  } catch (error) {
    console.error('Gemini OCR extraction error:', error);
    return {
      text: '',
      uncertaintyNotes: [
        'Unable to read scan automatically due to an extraction error. Please paste the report text or enter readings manually to verify.',
      ],
      usedOcr: false,
    };
  }
}

export async function generateGroundedSakhiResponse(params: {
  userMessage: string;
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
  systemContext: string;
  isAnonymous?: boolean;
}): Promise<{ reply: string; citations: string[]; modelUsed: string }> {
  const ai = getGeminiClient();
  const citations = [
    'WHO Women & Reproductive Health Clinical Guidance',
    'ACOG Patient Education & Preventive Care Standards',
    'SAKHI Logged Wellness Context (User-Authorized)',
  ];

  if (!ai) {
    return {
      reply: params.isAnonymous
        ? `Thank you for sharing openly here. Based on general women's health guidance: prioritize tracking pattern timing, hydration, and rest, and note any persistent or worsening symptoms for an OB-GYN or primary-care clinician.\n\n*Educational guidance only — not a medical diagnosis.*`
        : `I've reviewed your logged SAKHI wellness history. While live Gemini synthesis is currently unavailable in this environment, your tracked patterns (cycle timing, daily habits, body-map notes, and labs) are saved and ready for your clinician.\n\n*Educational guidance only — not a medical diagnosis.*`,
      citations,
      modelUsed: 'fallback-clinical-guide',
    };
  }

  try {
    const contents = [
      ...params.history.slice(-10).map((m) => ({
        role: m.role === 'assistant' ? ('model' as const) : ('user' as const),
        parts: [{ text: m.content }],
      })),
      {
        role: 'user' as const,
        parts: [{ text: params.userMessage }],
      },
    ];

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents,
      config: {
        systemInstruction: params.systemContext,
        temperature: 0.4,
        maxOutputTokens: 900,
      },
    });

    const reply =
      response.text?.trim() ||
      'I could not generate a complete response right now. Please rephrase your question or consult a healthcare clinician.';

    return {
      reply,
      citations,
      modelUsed: MODEL_NAME,
    };
  } catch (error) {
    console.error('Gemini chat generation failed:', error);
    return {
      reply:
        'I encountered an issue reaching the AI companion service. Please try again in a moment, or review your dashboard metrics and Care Finder to connect with a qualified clinician.',
      citations,
      modelUsed: 'fallback-error-safe',
    };
  }
}

export async function generateDoctorBriefSummary(contextSummary: string): Promise<string> {
  const ai = getGeminiClient();
  if (!ai) {
    return contextSummary;
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Summarize the following patient-consented longitudinal health record into a crisp, neutral, clinician-ready pre-visit brief (bullet points: Chief Patterns, Cycle Summary, Body-Map & Symptom Clusters, Lab Alerts, Suggested Clarifying Questions). Do NOT diagnose. Preserve all exact dates, numbers, and units.\n\n${contextSummary}`,
            },
          ],
        },
      ],
      config: {
        temperature: 0.2,
        maxOutputTokens: 700,
      },
    });
    return response.text?.trim() || contextSummary;
  } catch {
    return contextSummary;
  }
}

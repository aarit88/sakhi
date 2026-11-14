import { NextRequest, NextResponse } from 'next/server';
import { db } from '@db/index.ts';
import { ayurvedicKnowledge } from '@db/schema.ts';

export async function GET(request: NextRequest) {
  try {
    const dosha = request.nextUrl.searchParams.get('dosha')?.toLowerCase();
    const evidence = request.nextUrl.searchParams.get('evidence')?.toLowerCase();
    const query = request.nextUrl.searchParams.get('q')?.toLowerCase();

    const rows = await db.select().from(ayurvedicKnowledge);
    const items = rows
      .map((r) => ({
        id: r.id,
        slug: r.slug,
        title: r.title,
        condition: r.condition,
        dosha: r.dosha,
        cyclePhase: r.cyclePhase,
        symptoms: JSON.parse(r.symptomsJson) as string[],
        traditionalExplanation: r.traditionalExplanation,
        pathya: JSON.parse(r.pathyaJson) as string[],
        apathya: JSON.parse(r.apathyaJson) as string[],
        lifestyleGuidance: JSON.parse(r.lifestyleGuidanceJson) as string[],
        contraindications: JSON.parse(r.contraindicationsJson) as string[],
        evidenceLevel: r.evidenceLevel,
        evidenceSummary: r.evidenceSummary,
        sources: JSON.parse(r.sourcesJson) as string[],
      }))
      .filter((item) => {
        if (dosha && dosha !== 'all' && !item.dosha.toLowerCase().includes(dosha)) return false;
        if (evidence && evidence !== 'all' && item.evidenceLevel.toLowerCase() !== evidence) return false;
        if (
          query &&
          !item.title.toLowerCase().includes(query) &&
          !item.condition.toLowerCase().includes(query) &&
          !item.symptoms.some((s) => s.toLowerCase().includes(query))
        ) {
          return false;
        }
        return true;
      });

    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error('Ayurveda GET error:', error);
    return NextResponse.json({ message: 'Failed to load Ayurveda knowledge base' }, { status: 500 });
  }
}

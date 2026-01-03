import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { parseFitFile } from '@/domain/garmin/fit';
import { insertGarminActivity } from '@/infrastructure/garmin/store';
import { logCompletedWorkoutFromActivity } from '@/infrastructure/garmin/activity-log';
import { resolveAthleteId } from '@/infrastructure/garmin/auth';
import { garminConfig } from '@/infrastructure/garmin/config';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    const formData = await request.formData();
    const { athleteId } = await resolveAthleteId(request);
    const file = formData.get('file');

    if (!athleteId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!file || typeof file === 'string') {
        return NextResponse.json({ error: 'Missing FIT file' }, { status: 400 });
    }

    if ((file as File).size > garminConfig.maxFitSizeBytes) {
        return NextResponse.json({ error: 'FIT file too large' }, { status: 413 });
    }

    const filename = (file as File).name || '';
    if (filename && !filename.toLowerCase().endsWith('.fit')) {
        return NextResponse.json({ error: 'Invalid FIT file' }, { status: 400 });
    }

    const buffer = await (file as File).arrayBuffer();
    const hash = crypto.createHash('sha256').update(Buffer.from(buffer)).digest('hex');
    let fit;
    try {
        fit = parseFitFile(buffer);
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'FIT parse failed' }, { status: 400 });
    }
    const summary = { ...fit.summary, source: 'manual' as const };
    const activityId = `manual:${hash}`;

    await insertGarminActivity(
        athleteId,
        null,
        activityId,
        summary.activityType ?? null,
        summary,
        fit.summary as Record<string, unknown>,
        fit.laps,
        fit.records,
        'manual'
    );

    let matchResult;
    try {
        matchResult = await logCompletedWorkoutFromActivity(athleteId, summary, { allowUnmatched: true });
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Workout logging failed' }, { status: 500 });
    }

    return NextResponse.json({
        ok: true,
        match: matchResult.match,
    });
}

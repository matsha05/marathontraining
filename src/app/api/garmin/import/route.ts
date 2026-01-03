import { NextResponse } from 'next/server';
import { resolveAthleteId } from '@/infrastructure/garmin/auth';
import { garminConfig } from '@/infrastructure/garmin/config';
import { importGarminExportZip } from '@/infrastructure/garmin/importer';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    const { athleteId } = await resolveAthleteId(request);
    if (!athleteId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
        return NextResponse.json({ error: 'Missing export zip' }, { status: 400 });
    }

    if ((file as File).size > garminConfig.maxExportSizeBytes) {
        return NextResponse.json({ error: 'Export zip too large' }, { status: 413 });
    }

    const filename = (file as File).name || '';
    if (filename && !filename.toLowerCase().endsWith('.zip')) {
        return NextResponse.json({ error: 'Invalid export file' }, { status: 400 });
    }

    const buffer = await (file as File).arrayBuffer();
    try {
        const result = await importGarminExportZip(athleteId, buffer);
        return NextResponse.json({
            ok: true,
            result,
        });
    } catch (error) {
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Garmin export import failed',
        }, { status: 500 });
    }
}

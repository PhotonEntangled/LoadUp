import { NextResponse } from 'next/server';
import { SimulationInput } from '@/types/simulation'; // Adjust path as needed
import { logger } from '@/utils/logger'; // Adjust path as needed
import fs from 'fs'; // Node.js File System module
import path from 'path'; // Node.js Path module

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { scenarioFilename } = body;

    logger.info('[API /api/simulation] Received request', { scenarioFilename });

    if (!scenarioFilename || typeof scenarioFilename !== 'string' || !scenarioFilename.endsWith('.json')) {
        logger.warn('[API /api/simulation] Invalid or missing scenario filename received', { scenarioFilename });
        return NextResponse.json({ success: false, error: 'Invalid scenario filename' }, { status: 400 });
    }

    const safeFilename = path.basename(scenarioFilename);
    if (safeFilename !== scenarioFilename) { 
        logger.error('[API /api/simulation] Potentially unsafe filename detected', { original: scenarioFilename, safe: safeFilename });
        return NextResponse.json({ success: false, error: 'Invalid filename format' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'data', 'mocks', safeFilename);
    logger.debug(`[API /api/simulation] Attempting to read file: ${filePath}`);

    let fileContent;
    try {
        fileContent = fs.readFileSync(filePath, 'utf-8');
    } catch (readError: any) {
        logger.error(`[API /api/simulation] Error reading scenario file: ${filePath}`, readError);
        if (readError.code === 'ENOENT') {
            return NextResponse.json({ success: false, error: `Scenario file not found: ${safeFilename}` }, { status: 404 });
        }
        return NextResponse.json({ success: false, error: 'Error reading scenario file' }, { status: 500 });
    }

    let scenarios;
    try {
        scenarios = JSON.parse(fileContent);
    } catch (parseError) {
        logger.error(`[API /api/simulation] Error parsing JSON from file: ${safeFilename}`, parseError);
        return NextResponse.json({ success: false, error: `Invalid JSON format in scenario file: ${safeFilename}` }, { status: 500 });
    }

    if (!Array.isArray(scenarios) || scenarios.length === 0) {
         logger.error(`[API /api/simulation] Expected an array with at least one scenario in file: ${safeFilename}`, { parsedType: typeof scenarios });
         return NextResponse.json({ success: false, error: `Invalid data structure in scenario file: ${safeFilename}` }, { status: 500 });
    }
    const scenarioInput = scenarios[0] as SimulationInput;

    logger.info('[API /api/simulation] Successfully read and parsed scenario input.', { scenarioId: scenarioInput?.scenarioId });
    return NextResponse.json({ success: true, scenarioInput: scenarioInput });

  } catch (error) {
    logger.error('[API /api/simulation] Error processing request:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
} 
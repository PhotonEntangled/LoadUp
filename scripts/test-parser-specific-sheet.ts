import path from 'path';
import fs from 'fs'; // Needed to read the file into a buffer
import * as XLSX from 'xlsx'; // Need xlsx library directly
import { ExcelParserService } from '../services/excel/ExcelParserService'; // Adjusted import path
import { ParsedShipmentBundle, ExcelParseOptions } from '../types/parser.types'; // Adjusted import path
import { DocumentType } from '../types/shipment'; // Added DocumentType import if needed for options

const runTest = async () => {
  const filePath = path.resolve(
    __dirname,
    '../docs/NIRO OUTSTATION (RATES) 30.12.24 - 31.12.2024.xlsx',
  );
  const targetSheetName = 'RETAIL OUTSTATION - OTHER STATES'; // Exact sheet name is crucial

  console.log(
    `[PARSER TEST] Starting test for file: ${filePath}`,
  );
  console.log(`[PARSER TEST] Targeting sheet: "${targetSheetName}"`);

  if (!fs.existsSync(filePath)) {
    console.error(`[PARSER TEST][ERROR] File not found at path: ${filePath}`);
    return;
  }

  const parserService = new ExcelParserService();
  // Define default options, mirroring what ExcelParserService might use
  // Crucially, determine the correct DocumentType for options
  const options: ExcelParseOptions = {
    hasHeaderRow: true,
    headerRowIndex: 0, // This will likely be overridden by internal logic
    aiFieldMappingEnabled: false,
    aiMappingConfidenceThreshold: 0.7,
    documentType: DocumentType.OUTSTATION_RATES, // Assuming this is the correct type
  };

  try {
    // 1. Read the file into a buffer
    const fileBuffer = fs.readFileSync(filePath);

    // 2. Parse the workbook using XLSX
    const workbook = XLSX.read(fileBuffer, { type: 'buffer', cellDates: true });

    // 3. Get the specific worksheet
    const worksheet = workbook.Sheets[targetSheetName];
    if (!worksheet) {
      console.error(
        `[PARSER TEST][ERROR] Target sheet "${targetSheetName}" not found in the workbook.`,
      );
      console.error(`Available sheets: ${workbook.SheetNames.join(', ')}`);
      return;
    }

    console.log(`[PARSER TEST] Successfully loaded worksheet "${targetSheetName}"`);

    // 4. Call the internal processSheet method
    // NOTE: processSheet is likely private or protected. If this fails due to access,
    // we might need to temporarily make it public for testing or refactor.
    // Assuming it's callable for now.
    const bundles: ParsedShipmentBundle[] = await (parserService as any).processSheet(
      worksheet,
      targetSheetName,
      options,
    );

    console.log(
      `[PARSER TEST] Successfully processed sheet "${targetSheetName}" via processSheet.`, // Updated log message
    );
    console.log(
      `[PARSER TEST] Number of bundles generated: ${bundles.length}`,
    );
    console.log('[PARSER TEST] Generated bundles:');
    console.log(JSON.stringify(bundles, null, 2)); // Pretty print the output

    // Verification log based on expected outcome
    if (bundles.length === 2) {
      const bundle60033 = bundles.find(
        (b) =>
          b.customDetailsData?.customerShipmentNumber === '60033',
      );
      const bundle60034 = bundles.find(
        (b) =>
          b.customDetailsData?.customerShipmentNumber === '60034',
      );
      const reviewFlagCheck = bundles.every((b) => b.metadata?.needsReview);

      if (bundle60033 && bundle60034 && reviewFlagCheck) {
        console.log(
          '[PARSER TEST][SUCCESS] Found 2 bundles for loads 60033 & 60034 with needsReview flag set.',
        );
      } else {
        console.error(
          '[PARSER TEST][FAILURE] Generated 2 bundles, but data or flags are incorrect. Needs inspection.',
        );
      }
    } else {
      console.error(
        `[PARSER TEST][FAILURE] Expected 2 bundles, but got ${bundles.length}. Needs inspection.`,
      );
    }
  } catch (error) {
    console.error(`[PARSER TEST][ERROR] Error during processing:`, error);
  }
};

runTest(); 
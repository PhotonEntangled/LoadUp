import fs from 'fs/promises';
import path from 'path';
import { ExcelParserService } from '@/services/excel/ExcelParserService';
import { DocumentType } from '@/types/shipment'; // Assuming DocumentType enum/const is here
import { logger } from '@/utils/logger';

// Configuration
const TEST_FILE_RELATIVE_PATH = 'docs/LOADUP-ETD-7.1.2025-2.xls.xlsx'; // ADJUST IF NEEDED
const DOCUMENT_TYPE_TO_TEST = DocumentType.ETD_REPORT;

async function runParserTest() {
  logger.info(`--- Starting Parser Test for ${TEST_FILE_RELATIVE_PATH} ---`);

  const localExcelParserService = new ExcelParserService();

  const filePath = path.resolve(process.cwd(), TEST_FILE_RELATIVE_PATH);
  logger.info(`Resolved file path: ${filePath}`);

  let fileBuffer: Buffer;
  try {
    fileBuffer = await fs.readFile(filePath);
    logger.info(`Successfully read file: ${filePath} (${fileBuffer.byteLength} bytes)`);
  } catch (error: any) {
    logger.error(`Failed to read test file: ${filePath}`, { error: error.message });
    process.exit(1);
  }

  try {
    logger.info(`Calling excelParserService.parseExcelFile with DocumentType: ${DOCUMENT_TYPE_TO_TEST}`);
    
    // Convert Buffer to ArrayBuffer (required by xlsx library)
    const arrayBuffer = fileBuffer.buffer.slice(
        fileBuffer.byteOffset, 
        fileBuffer.byteOffset + fileBuffer.byteLength
    ) as ArrayBuffer; // Explicit cast to ArrayBuffer

    const bundles = await localExcelParserService.parseExcelFile(arrayBuffer, {
      documentType: DOCUMENT_TYPE_TO_TEST
      // Explicitly set other options if needed (e.g., headerRowIndex, though it should be picked up by PARSER_CONFIG)
      // headerRowIndex: 2 
    });

    logger.info(`--- Parser Test Finished ---`);
    logger.info(`Total bundles parsed: ${bundles.length}`);

    if (bundles.length > 0) {
      logger.info('Sample of first bundle:');
      // Use console.dir for better object inspection in terminal
      console.dir(bundles[0], { depth: 5 }); 
    } else {
      logger.warn('No bundles were parsed.');
    }

    // Optional: Write full output to a debug file
    const debugOutputPath = path.resolve(process.cwd(), '.debug_output', `test_script_output_${Date.now()}.json`);
    try {
      await fs.writeFile(debugOutputPath, JSON.stringify(bundles, null, 2));
      logger.info(`Full test output saved to: ${debugOutputPath}`);
    } catch(writeError: any) {
      logger.error(`Failed to write test debug output to ${debugOutputPath}`, { error: writeError.message });
    }

  } catch (error: any) {
    logger.error(`--- Parser Test Failed ---`);
    logger.error(`Error during parsing: ${error.message}`, { stack: error.stack });
    process.exit(1);
  }
}

runParserTest(); 
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var promises_1 = __importDefault(require("fs/promises"));
var path_1 = __importDefault(require("path"));
var ExcelParserService_1 = require("@/services/excel/ExcelParserService");
var shipment_1 = require("@/types/shipment"); // Assuming DocumentType enum/const is here
var logger_1 = require("@/utils/logger");
// Configuration
var TEST_FILE_RELATIVE_PATH = 'docs/LOADUP-ETD-7.1.2025-2.xls.xlsx'; // ADJUST IF NEEDED
var DOCUMENT_TYPE_TO_TEST = shipment_1.DocumentType.ETD_REPORT;
function runParserTest() {
    return __awaiter(this, void 0, void 0, function () {
        var filePath, fileBuffer, error_1, arrayBuffer, bundles, debugOutputPath, writeError_1, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logger_1.logger.info("--- Starting Parser Test for ".concat(TEST_FILE_RELATIVE_PATH, " ---"));
                    filePath = path_1.default.resolve(process.cwd(), TEST_FILE_RELATIVE_PATH);
                    logger_1.logger.info("Resolved file path: ".concat(filePath));
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, promises_1.default.readFile(filePath)];
                case 2:
                    fileBuffer = _a.sent();
                    logger_1.logger.info("Successfully read file: ".concat(filePath, " (").concat(fileBuffer.byteLength, " bytes)"));
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    logger_1.logger.error("Failed to read test file: ".concat(filePath), { error: error_1.message });
                    process.exit(1);
                    return [3 /*break*/, 4];
                case 4:
                    _a.trys.push([4, 10, , 11]);
                    logger_1.logger.info("Calling excelParserService.parseExcelFile with DocumentType: ".concat(DOCUMENT_TYPE_TO_TEST));
                    arrayBuffer = fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength);
                    return [4 /*yield*/, ExcelParserService_1.excelParserService.parseExcelFile(arrayBuffer, {
                            documentType: DOCUMENT_TYPE_TO_TEST
                            // Explicitly set other options if needed (e.g., headerRowIndex, though it should be picked up by PARSER_CONFIG)
                            // headerRowIndex: 2 
                        })];
                case 5:
                    bundles = _a.sent();
                    logger_1.logger.info("--- Parser Test Finished ---");
                    logger_1.logger.info("Total bundles parsed: ".concat(bundles.length));
                    if (bundles.length > 0) {
                        logger_1.logger.info('Sample of first bundle:');
                        // Use console.dir for better object inspection in terminal
                        console.dir(bundles[0], { depth: 5 });
                    }
                    else {
                        logger_1.logger.warn('No bundles were parsed.');
                    }
                    debugOutputPath = path_1.default.resolve(process.cwd(), '.debug_output', "test_script_output_".concat(Date.now(), ".json"));
                    _a.label = 6;
                case 6:
                    _a.trys.push([6, 8, , 9]);
                    return [4 /*yield*/, promises_1.default.writeFile(debugOutputPath, JSON.stringify(bundles, null, 2))];
                case 7:
                    _a.sent();
                    logger_1.logger.info("Full test output saved to: ".concat(debugOutputPath));
                    return [3 /*break*/, 9];
                case 8:
                    writeError_1 = _a.sent();
                    logger_1.logger.error("Failed to write test debug output to ".concat(debugOutputPath), { error: writeError_1.message });
                    return [3 /*break*/, 9];
                case 9: return [3 /*break*/, 11];
                case 10:
                    error_2 = _a.sent();
                    logger_1.logger.error("--- Parser Test Failed ---");
                    logger_1.logger.error("Error during parsing: ".concat(error_2.message), { stack: error_2.stack });
                    process.exit(1);
                    return [3 /*break*/, 11];
                case 11: return [2 /*return*/];
            }
        });
    });
}
runParserTest();

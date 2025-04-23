// simple-test.ts
// Purpose: Isolate and test the extractDateField function outside Next.js

// Use async IIFE (Immediately Invoked Function Expression) to allow top-level await
(async () => {
  console.log("--- Loading extractDateField --- CWD:", process.cwd());

  let extractDateField;
  try {
    // Use dynamic import() for ES Modules
    const parserUtils = await import('./services/excel/parserUtils.js'); // IMPORTANT: Node often needs the .js extension for relative imports in ESM
    extractDateField = parserUtils.extractDateField;
    if (typeof extractDateField !== 'function') {
      throw new Error('extractDateField is not a function after import');
    }
    console.log("--- extractDateField loaded successfully ---");
  } catch (error) {
    console.error("!!! Failed to load extractDateField:", error);
    process.exit(1); // Exit if loading fails
  }

  // Test case 1: Problematic date format
  const testRow1 = { promisedShipDate: "12/28/24" };
  console.log("\n--- Running test case 1: MM/DD/YY --- Input:", JSON.stringify(testRow1));
  try {
    const result1 = extractDateField(testRow1, 'promisedShipDate');
    console.log("Result 1:", result1); // Should log the Date object or undefined
  } catch (error) {
    console.error("Error during test case 1:", error);
  }

  // Test case 2: Working date format
  const testRow2 = { promisedShipDate: "27/12/2024" };
  console.log("\n--- Running test case 2: DD/MM/YYYY --- Input:", JSON.stringify(testRow2));
  try {
    const result2 = extractDateField(testRow2, 'promisedShipDate');
    console.log("Result 2:", result2); // Should log the Date object
  } catch (error) {
    console.error("Error during test case 2:", error);
  }

  // Test case 3: Empty value
  const testRow3 = { promisedShipDate: "" };
  console.log("\n--- Running test case 3: Empty String --- Input:", JSON.stringify(testRow3));
  try {
    const result3 = extractDateField(testRow3, 'promisedShipDate');
    console.log("Result 3:", result3); // Should log undefined
  } catch (error) {
    console.error("Error during test case 3:", error);
  }

  // Test case 4: Null value
  const testRow4 = { promisedShipDate: null };
  console.log("\n--- Running test case 4: Null --- Input:", JSON.stringify(testRow4));
  try {
    const result4 = extractDateField(testRow4, 'promisedShipDate');
    console.log("Result 4:", result4); // Should log undefined
  } catch (error) {
    console.error("Error during test case 4:", error);
  }

  // Test case 5: Excel numeric date
  const excelDateNumber = 45655; // Example Excel date number (e.g., for 12/28/2024)
  const testRow5 = { promisedShipDate: excelDateNumber };
  console.log(`\n--- Running test case 5: Excel Number (${excelDateNumber}) --- Input:`, JSON.stringify(testRow5));
  try {
    const result5 = extractDateField(testRow5, 'promisedShipDate');
    console.log("Result 5:", result5); // Should log the Date object
  } catch (error) {
    console.error("Error during test case 5:", error);
  }

  console.log("\n--- Test script finished ---");

})(); // End IIFE 
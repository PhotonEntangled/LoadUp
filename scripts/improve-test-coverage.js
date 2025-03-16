#!/usr/bin/env node

/**
 * Script to help improve test coverage by:
 * 1. Analyzing the coverage report to identify untested files
 * 2. Prioritizing files based on importance (services, utilities, etc.)
 * 3. Generating test templates for untested files
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Priority patterns for testing (in order of importance)
const priorityPatterns = [
  { pattern: /services\/.*\.ts$/, priority: 1, type: 'service' },
  { pattern: /utils\/.*\.ts$/, priority: 2, type: 'utility' },
  { pattern: /hooks\/.*\.ts$/, priority: 3, type: 'hook' },
  { pattern: /components\/.*\.tsx$/, priority: 4, type: 'component' },
  { pattern: /pages\/.*\.tsx$/, priority: 5, type: 'page' },
  { pattern: /api\/.*\.ts$/, priority: 6, type: 'api' },
];

// Function to run tests with coverage
function runTestsWithCoverage() {
  console.log('Running tests with coverage...');
  
  try {
    execSync('npm run test:coverage', { stdio: 'inherit' });
    console.log('✅ Coverage report generated');
    return true;
  } catch (err) {
    console.warn('⚠️ Tests failed, but continuing with coverage analysis');
    return false;
  }
}

// Function to find all source files
function findSourceFiles() {
  try {
    const command = 'git ls-files "**/*.ts" "**/*.tsx"';
    const result = execSync(command, { encoding: 'utf-8' });
    return result.split('\n')
      .filter(Boolean)
      .filter(file => 
        !file.includes('node_modules') && 
        !file.includes('dist') && 
        !file.includes('.d.ts') &&
        !file.includes('__tests__') &&
        !file.includes('.test.') &&
        !file.includes('.spec.')
      );
  } catch (err) {
    console.error('Error finding source files:', err.message);
    return [];
  }
}

// Function to parse coverage report
function parseCoverageReport() {
  const coveragePath = path.join(rootDir, 'coverage', 'coverage-final.json');
  
  if (!fs.existsSync(coveragePath)) {
    console.error('❌ Coverage report not found. Run tests with coverage first.');
    return null;
  }
  
  try {
    const coverageData = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
    return coverageData;
  } catch (err) {
    console.error('Error parsing coverage report:', err.message);
    return null;
  }
}

// Function to identify untested files
function identifyUntestedFiles(sourceFiles, coverageData) {
  if (!coverageData) return [];
  
  const coveredFiles = Object.keys(coverageData).map(key => {
    // Convert absolute path to relative
    return key.replace(rootDir.replace(/\\/g, '/'), '').replace(/^\//, '');
  });
  
  // Find files not in coverage report
  const untestedFiles = sourceFiles.filter(file => {
    // Check if file is in coverage report
    return !coveredFiles.some(coveredFile => coveredFile.includes(file));
  });
  
  return untestedFiles;
}

// Function to prioritize untested files
function prioritizeUntestedFiles(untestedFiles) {
  return untestedFiles.map(file => {
    // Find matching priority pattern
    const matchingPattern = priorityPatterns.find(({ pattern }) => pattern.test(file));
    
    return {
      file,
      priority: matchingPattern ? matchingPattern.priority : 999,
      type: matchingPattern ? matchingPattern.type : 'other'
    };
  })
  .sort((a, b) => a.priority - b.priority);
}

// Function to generate test template for a file
function generateTestTemplate(filePath, fileType) {
  // Extract file name without extension
  const fileName = path.basename(filePath).replace(/\.(ts|tsx)$/, '');
  
  // Determine test directory and file path
  let testDir;
  let importPath;
  
  if (filePath.includes('src/')) {
    // For files in src directory, create test in __tests__ directory
    const srcRelativePath = filePath.substring(filePath.indexOf('src/') + 4);
    const dirName = path.dirname(srcRelativePath);
    testDir = path.join(rootDir, 'src', '__tests__', dirName);
    importPath = `@/${dirName}/${fileName}`;
  } else {
    // For other files, create test alongside the file
    const dirName = path.dirname(filePath);
    testDir = path.join(rootDir, dirName);
    importPath = `./${fileName}`;
  }
  
  // Create test directory if it doesn't exist
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }
  
  // Determine test file path
  const testFilePath = path.join(testDir, `${fileName}.test.ts${filePath.endsWith('x') ? 'x' : ''}`);
  
  // Generate test content based on file type
  let testContent;
  
  switch (fileType) {
    case 'service':
      testContent = generateServiceTestTemplate(fileName, importPath);
      break;
    case 'utility':
      testContent = generateUtilityTestTemplate(fileName, importPath);
      break;
    case 'hook':
      testContent = generateHookTestTemplate(fileName, importPath);
      break;
    case 'component':
      testContent = generateComponentTestTemplate(fileName, importPath);
      break;
    case 'page':
      testContent = generatePageTestTemplate(fileName, importPath);
      break;
    case 'api':
      testContent = generateApiTestTemplate(fileName, importPath);
      break;
    default:
      testContent = generateGenericTestTemplate(fileName, importPath);
  }
  
  // Write test file if it doesn't exist
  if (!fs.existsSync(testFilePath)) {
    fs.writeFileSync(testFilePath, testContent, 'utf8');
    console.log(`✅ Generated test template: ${testFilePath}`);
    return testFilePath;
  } else {
    console.log(`ℹ️ Test file already exists: ${testFilePath}`);
    return null;
  }
}

// Template generators for different file types
function generateServiceTestTemplate(serviceName, importPath) {
  return `import { ${serviceName} } from '${importPath}';

describe('${serviceName}', () => {
  beforeEach(() => {
    // Setup before each test
  });

  afterEach(() => {
    // Cleanup after each test
    jest.resetAllMocks();
  });

  test('should initialize correctly', () => {
    // Test initialization
    expect(${serviceName}).toBeDefined();
  });

  test('should perform main functionality', async () => {
    // Test main functionality
    // const result = await ${serviceName}.someMethod();
    // expect(result).toEqual(expectedValue);
  });

  test('should handle errors correctly', async () => {
    // Test error handling
    // jest.spyOn(someModule, 'someMethod').mockRejectedValueOnce(new Error('Test error'));
    // await expect(${serviceName}.methodThatMightFail()).rejects.toThrow('Test error');
  });
});
`;
}

function generateUtilityTestTemplate(utilityName, importPath) {
  return `import * as ${utilityName}Utils from '${importPath}';

describe('${utilityName} utilities', () => {
  test('should export expected functions', () => {
    // Verify exports
    expect(${utilityName}Utils).toBeDefined();
    // expect(${utilityName}Utils.someFunction).toBeDefined();
  });

  // Add tests for each utility function
  // test('someFunction should work correctly', () => {
  //   const result = ${utilityName}Utils.someFunction(testInput);
  //   expect(result).toEqual(expectedOutput);
  // });

  // test('should handle edge cases', () => {
  //   expect(${utilityName}Utils.someFunction(null)).toBeNull();
  //   expect(${utilityName}Utils.someFunction(undefined)).toBeUndefined();
  //   expect(${utilityName}Utils.someFunction('')).toEqual('');
  // });
});
`;
}

function generateHookTestTemplate(hookName, importPath) {
  return `import { renderHook, act } from '@testing-library/react-hooks';
import { ${hookName} } from '${importPath}';

describe('${hookName}', () => {
  test('should initialize with default values', () => {
    const { result } = renderHook(() => ${hookName}());
    
    // Check initial state
    // expect(result.current.someValue).toEqual(defaultValue);
  });

  test('should update values correctly', () => {
    const { result } = renderHook(() => ${hookName}());
    
    act(() => {
      // Call hook methods to update state
      // result.current.someMethod();
    });
    
    // Check updated state
    // expect(result.current.someValue).toEqual(newValue);
  });

  test('should handle side effects', async () => {
    // Mock dependencies
    // jest.spyOn(someModule, 'someMethod').mockResolvedValueOnce(mockData);
    
    const { result, waitForNextUpdate } = renderHook(() => ${hookName}());
    
    // Trigger async action
    act(() => {
      // result.current.fetchData();
    });
    
    // Wait for async updates
    await waitForNextUpdate();
    
    // Check final state
    // expect(result.current.data).toEqual(mockData);
  });
});
`;
}

function generateComponentTestTemplate(componentName, importPath) {
  return `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ${componentName} } from '${importPath}';

describe('${componentName}', () => {
  test('should render correctly', () => {
    render(<${componentName} />);
    
    // Check if component renders
    // expect(screen.getByText('Some Text')).toBeInTheDocument();
  });

  test('should handle user interactions', () => {
    render(<${componentName} />);
    
    // Simulate user interaction
    // fireEvent.click(screen.getByRole('button'));
    
    // Check if the expected changes occurred
    // expect(screen.getByText('New Text')).toBeInTheDocument();
  });

  test('should handle props correctly', () => {
    const testProps = {
      // Add test props here
    };
    
    render(<${componentName} {...testProps} />);
    
    // Check if props are used correctly
    // expect(screen.getByText(testProps.someValue)).toBeInTheDocument();
  });
});
`;
}

function generatePageTestTemplate(pageName, importPath) {
  return `import React from 'react';
import { render, screen } from '@testing-library/react';
import ${pageName} from '${importPath}';

// Mock any required providers or context
// jest.mock('next/router', () => ({
//   useRouter: () => ({
//     query: {},
//     push: jest.fn(),
//   }),
// }));

describe('${pageName} page', () => {
  test('should render correctly', () => {
    render(<${pageName} />);
    
    // Check if page renders key elements
    // expect(screen.getByRole('heading')).toBeInTheDocument();
  });

  test('should fetch and display data', async () => {
    // Mock data fetching
    // jest.spyOn(someService, 'fetchData').mockResolvedValueOnce(mockData);
    
    render(<${pageName} />);
    
    // Check loading state
    // expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    // Wait for data to load
    // await screen.findByText('Data Loaded');
    
    // Check if data is displayed
    // expect(screen.getByText(mockData.title)).toBeInTheDocument();
  });

  test('should handle errors', async () => {
    // Mock error in data fetching
    // jest.spyOn(someService, 'fetchData').mockRejectedValueOnce(new Error('Failed to fetch'));
    
    render(<${pageName} />);
    
    // Wait for error message
    // await screen.findByText('Error');
    
    // Check if error is displayed
    // expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
  });
});
`;
}

function generateApiTestTemplate(apiName, importPath) {
  return `import { createMocks } from 'node-mocks-http';
import handler from '${importPath}';

describe('${apiName} API', () => {
  test('should handle GET request', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      // Add query parameters if needed
      // query: { id: '1' },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({
        // Expected response data
      })
    );
  });

  test('should handle POST request', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        // Request body
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({
        // Expected response data
      })
    );
  });

  test('should handle errors', async () => {
    // Mock a dependency to throw an error
    // jest.spyOn(someService, 'someMethod').mockRejectedValueOnce(new Error('Test error'));

    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({
        error: expect.any(String),
      })
    );
  });
});
`;
}

function generateGenericTestTemplate(fileName, importPath) {
  return `import * as ${fileName}Module from '${importPath}';

describe('${fileName}', () => {
  test('should be defined', () => {
    expect(${fileName}Module).toBeDefined();
  });

  // Add more specific tests based on the file's functionality
  // test('should perform expected functionality', () => {
  //   // Test code here
  // });
});
`;
}

// Function to create a test coverage report
function createTestCoverageReport(prioritizedFiles, generatedTests) {
  const reportPath = path.join(rootDir, 'test-coverage-report.md');
  
  const content = `# Test Coverage Improvement Report

Generated on: ${new Date().toISOString().split('T')[0]}

## Summary

- Untested files identified: ${prioritizedFiles.length}
- Test templates generated: ${generatedTests.length}

## Untested Files by Priority

${prioritizedFiles.map(({ file, priority, type }) => {
  return `### Priority ${priority}: ${type}
- ${file}`;
}).join('\n\n')}

## Generated Test Templates

${generatedTests.map(testPath => {
  return `- ${testPath.replace(rootDir, '')}`;
}).join('\n')}

## Next Steps

1. Review and complete the generated test templates
2. Focus on high-priority files first (services, utilities)
3. Run \`npm run test:coverage\` again to see improved coverage
4. Continue adding tests until you reach your coverage goals
`;
  
  fs.writeFileSync(reportPath, content, 'utf8');
  console.log(`✅ Created test coverage report at ${reportPath}`);
}

// Main function
async function main() {
  console.log('Starting test coverage improvement...');
  
  // Run tests with coverage
  runTestsWithCoverage();
  
  // Find all source files
  const sourceFiles = findSourceFiles();
  console.log(`\nFound ${sourceFiles.length} source files`);
  
  // Parse coverage report
  const coverageData = parseCoverageReport();
  if (!coverageData) {
    console.error('❌ Cannot proceed without coverage data');
    return;
  }
  
  // Identify untested files
  const untestedFiles = identifyUntestedFiles(sourceFiles, coverageData);
  console.log(`\nIdentified ${untestedFiles.length} untested files`);
  
  // Prioritize untested files
  const prioritizedFiles = prioritizeUntestedFiles(untestedFiles);
  console.log('\nPrioritized untested files:');
  
  // Group by priority and log
  const priorityGroups = {};
  prioritizedFiles.forEach(({ priority, type }) => {
    priorityGroups[priority] = priorityGroups[priority] || { count: 0, type };
    priorityGroups[priority].count++;
  });
  
  Object.entries(priorityGroups).forEach(([priority, { count, type }]) => {
    console.log(`- Priority ${priority} (${type}): ${count} files`);
  });
  
  // Generate test templates for top priority files (limit to 10)
  console.log('\nGenerating test templates for high-priority files...');
  const topPriorityFiles = prioritizedFiles.slice(0, 10);
  
  const generatedTests = [];
  for (const { file, type } of topPriorityFiles) {
    const testPath = generateTestTemplate(file, type);
    if (testPath) {
      generatedTests.push(testPath);
    }
  }
  
  console.log(`\nGenerated ${generatedTests.length} test templates`);
  
  // Create test coverage report
  createTestCoverageReport(prioritizedFiles, generatedTests);
  
  console.log('\nTest coverage improvement process complete!');
  console.log('\nNext steps:');
  console.log('1. Review the test-coverage-report.md file');
  console.log('2. Complete the generated test templates');
  console.log('3. Run tests again to see improved coverage');
}

// Run the script
main().catch(console.error); 
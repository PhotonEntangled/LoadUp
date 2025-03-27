const fs = require('fs');
const path = require('path');

// Paths
const adminDashboardDir = path.join(__dirname, 'apps', 'admin-dashboard');
const apiDir = path.join(adminDashboardDir, 'app', 'api', 'shipments');
const oldParamDir = path.join(apiDir, '[shipmentId]');
const newParamDir = path.join(apiDir, '[id]');

// Check if the problematic directory exists
if (fs.existsSync(oldParamDir)) {
  console.log('Found [shipmentId] directory, removing it...');
  
  // Create the new directory structure if it doesn't exist
  if (!fs.existsSync(newParamDir)) {
    fs.mkdirSync(newParamDir, { recursive: true });
    console.log('Created [id] directory');
  }
  
  // Get all subdirectories in the old parameter directory
  const subdirs = fs.readdirSync(oldParamDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  // Process each subdirectory
  for (const subdir of subdirs) {
    const oldSubdirPath = path.join(oldParamDir, subdir);
    const newSubdirPath = path.join(newParamDir, subdir);
    
    // Create the subdirectory in the new location if it doesn't exist
    if (!fs.existsSync(newSubdirPath)) {
      fs.mkdirSync(newSubdirPath, { recursive: true });
      console.log(`Created ${subdir} directory in [id]`);
    }
    
    // Get all files in the old subdirectory
    const files = fs.readdirSync(oldSubdirPath, { withFileTypes: true })
      .filter(dirent => dirent.isFile())
      .map(dirent => dirent.name);
    
    // Process each file
    for (const file of files) {
      const oldFilePath = path.join(oldSubdirPath, file);
      const newFilePath = path.join(newSubdirPath, file);
      
      // Read the file content
      let content = fs.readFileSync(oldFilePath, 'utf8');
      
      // Replace parameter references
      content = content.replace(/params: \{ shipmentId: string \}/g, 'params: { id: string }');
      content = content.replace(/params\.shipmentId/g, 'params.id');
      
      // Write the updated content to the new location
      fs.writeFileSync(newFilePath, content);
      console.log(`Processed ${file} in ${subdir}`);
    }
  }
  
  // Remove the old directory
  fs.rmSync(oldParamDir, { recursive: true, force: true });
  console.log('Removed [shipmentId] directory');
  
  console.log('Route parameter naming has been fixed!');
} else {
  console.log('[shipmentId] directory not found, no action needed.');
} 
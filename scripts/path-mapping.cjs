/**
 * Path Mappings
 * 
 * This file exports the path mappings used in tsconfig.json and jest.config.mjs.
 * It is used by the import validation and fixing scripts.
 */

const pathMappings = {
  // Packages
  '@packages/api/*': 'packages/api/*',
  '@packages/db/*': 'packages/db/*',
  '@packages/database/*': 'packages/database/*',
  '@packages/shared/*': 'packages/shared/*',
  
  // Apps
  '@admin/*': 'apps/admin-dashboard/*',
  '@driver/*': 'apps/driver-app/*',
  
  // Root-level directories
  '@/app/*': 'app/*',
  '@/components/*': 'components/*',
  '@/lib/*': 'lib/*',
  '@/utils/*': 'utils/*',
  '@/services/*': 'services/*',
  '@/styles/*': 'styles/*',
  '@/types/*': 'types/*',
  '@/hooks/*': 'hooks/*',
  '@/contexts/*': 'contexts/*',
  '@/constants/*': 'constants/*',
  '@/config/*': 'config/*',
  '@/api/*': 'api/*',
  '@/tests/*': 'tests/*',
  '@/mocks/*': 'mocks/*',
  '@/*': '*',
};

module.exports = pathMappings; 
# LoadUp - Modern Logistics Platform

LoadUp is a full-stack logistics platform built with modern technologies, designed to streamline shipment management and delivery operations.

## 🚀 Features

- **Admin Dashboard**
  - Shipment Management
  - Driver Management
  - Real-time Tracking
  - Analytics & Reporting

- **Driver Mobile App**
  - Live Navigation
  - Shipment Updates
  - Status Management
  - Customer Communication

- **API Server**
  - RESTful Endpoints
  - Authentication
  - Shipment Management
  - Driver Tracking

## 🛠️ Tech Stack

### Frontend
- Admin Dashboard: Next.js 14, TailwindCSS
- Driver App: React Native (Expo)
- State Management: Zustand
- Maps: Mapbox

### Backend
- Node.js with TypeScript
- PostgreSQL with Drizzle ORM
- Authentication: NextAuth.js
- API Server: Express.js

### Infrastructure
- Monorepo with Turborepo
- CI/CD with GitHub Actions
- Deployment: Vercel (Admin), Expo (Mobile)

## 📦 Project Structure

```
loadup/
├── apps/
│   ├── admin-dashboard/    # Next.js admin panel
│   └── driver-app/         # React Native driver app
├── packages/
│   ├── database/           # Drizzle ORM schema and migrations
│   ├── shared/             # Shared utilities and types
│   └── api/                # API server
├── scripts/                # Utility scripts
├── docs/                   # Documentation
└── PowerShell Scripts:
    ├── run-nextjs.ps1      # Run the admin dashboard
    ├── run-driver-app.ps1  # Run the driver app
    └── deploy-admin.ps1    # Deploy admin dashboard to Vercel
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database
- Supabase account (for authentication)
- Google Cloud Vision API key (for OCR)
- Mapbox API key (for maps)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/loadup.git
   cd loadup
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   ```
   cp .env.example .env
   # Edit .env with your configuration
   ```

### Running the Applications

#### Windows (PowerShell)

Run the admin dashboard:
```powershell
.\run-nextjs.ps1
```

Run the driver app:
```powershell
.\run-driver-app.ps1
```

#### macOS/Linux (Bash)

Run the admin dashboard:
```bash
cd apps/admin-dashboard && npm run dev
```

Run the driver app:
```bash
cd apps/driver-app && npm run start
```

### Deployment

Deploy the admin dashboard to Vercel:
```powershell
.\deploy-admin.ps1
```

## 📚 Documentation

For more detailed documentation, please refer to the following:

- [PowerShell Compatibility Guide](docs/POWERSHELL_GUIDE.md)
- [Vercel Deployment Guide](docs/VERCEL_DEPLOYMENT.md)
- [Project Planning](docs/PLANNING.md)
- [Current Status](docs/CURRENT_STATUS.md)
- [Next Steps](docs/NEXT_STEPS.md)
- [Testing Guide](docs/TESTING.md)

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific app tests
npm test --filter=admin-dashboard
npm test --filter=driver-app
```

## 📱 Mobile App Development

1. Install Expo Go on your device
2. Start the driver app:
   ```bash
   cd apps/driver-app
   npm start
   ```
3. Scan the QR code with Expo Go

## 🚀 Deployment

### Admin Dashboard
```bash
cd apps/admin-dashboard
vercel deploy
```

### Driver App
```bash
cd apps/driver-app
expo publish
```

### API Server
```bash
# From the root directory
node deploy.js
```

For more detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request 

## Testing Infrastructure

Our testing infrastructure is built on several layers to ensure comprehensive coverage:

### Unit Tests
- Located in `__tests__/**/*.unit.ts(x)`
- Run with `npm run test:unit`
- Focus on individual components and functions
- Uses Jest with ts-jest

### Integration Tests
- Located in `__tests__/**/*.integration.ts(x)`
- Run with `npm run test:integration`
- Tests interactions between components
- Includes API and database tests

### E2E Tests
- Located in `e2e/**/*.spec.ts`
- Run with `npm run test:e2e`
- Uses Playwright for browser testing
- Tests complete user flows
- Supports multiple browsers and devices

### Coverage Requirements
- 80% branch coverage
- 80% function coverage
- 80% line coverage
- 80% statement coverage

### Running Tests
```bash
# Install dependencies
npm install

# Install Playwright browsers
npm run playwright:install

# Run all tests
npm test

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:e2e

# Run tests with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### CI/CD Integration
- Tests run automatically on pull requests
- All tests must pass before deployment
- Coverage reports uploaded to Codecov
- E2E test videos and screenshots on failure 

## CI/CD Pipeline

We use GitHub Actions for continuous integration and deployment:

- **Admin Dashboard**: Deployed to Vercel
- **Driver App**: Deployed to Expo
- **API**: Deployed to Railway

### Workflow Status

| Application | Status |
|-------------|--------|
| Admin Dashboard | [![Admin Dashboard CI/CD](https://github.com/yourusername/loadup/actions/workflows/admin-dashboard.yml/badge.svg)](https://github.com/yourusername/loadup/actions/workflows/admin-dashboard.yml) |
| Driver App | [![Driver App CI/CD](https://github.com/yourusername/loadup/actions/workflows/driver-app.yml/badge.svg)](https://github.com/yourusername/loadup/actions/workflows/driver-app.yml) |
| API | [![API CI/CD](https://github.com/yourusername/loadup/actions/workflows/api.yml/badge.svg)](https://github.com/yourusername/loadup/actions/workflows/api.yml) |

### Deployment Environments

- **Production**: Deployed from the `main` branch
- **Staging/Preview**: Deployed from the `develop` branch

For more details on the CI/CD setup, see [.github/workflows/README.md](.github/workflows/README.md).

## Error Tracking

We use Sentry for error tracking across all applications. Error boundaries are set up to capture and report issues automatically.

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

# LoadUp: AI-Enhanced Excel Parser

## Overview

The LoadUp logistics application includes an AI-enhanced Excel parser that intelligently maps column names from uploaded Excel files to standardized field names in the system. This allows for processing of Excel shipment files with varying column naming conventions without requiring manual field mapping.

## Key Features

1. **Tiered Field Mapping Approach**:
   - Direct mapping for exact matches
   - Case-insensitive matching for minor variations
   - Fuzzy matching for similar names
   - AI-powered mapping using OpenAI API for unrecognized columns
   - Normalized field names as a final fallback

2. **AI Integration with OpenAI**:
   - Intelligent field mapping using contextual analysis
   - Confidence scoring for each mapping
   - Caching mechanism to minimize API calls
   - Graceful fallbacks for API failures

3. **Data Confidence Scoring**:
   - Overall confidence score for each processed shipment
   - Identification of shipments that need manual review
   - Special handling for critical fields
   - Confidence thresholds configurable via environment variables

4. **Enhanced UI Feedback**:
   - Visual indicators for AI-mapped fields
   - Color-coded confidence levels
   - Tooltips showing original field names and confidence scores
   - CSV export with AI mapping annotations

## Project Structure

- `services/excel/ExcelParserService.ts` - Core Excel parsing logic with AI field mapping
- `services/ai/OpenAIService.ts` - OpenAI API integration with caching
- `services/ai/schema-reference.ts` - Standardized field definitions and synonyms
- `services/document-processing.ts` - Document processing orchestration
- `types/shipment.ts` - TypeScript types for shipment data

## Usage

### Environment Setup

Configure the application with the following environment variables:

```
# OpenAI API Configuration
OPENAI_API_KEY=your_api_key_here

# AI Mapping Configuration
ENABLE_AI_MAPPING=true
AI_MAPPING_CONFIDENCE_THRESHOLD=0.7

# Logging
LOG_LEVEL=info
```

### Processing Excel Files

```typescript
import { processDocument } from './services/document-processing';

// Process an Excel file with AI mapping
const result = await processDocument('shipments.xlsx', { 
  useAIMapping: true,
  aiConfidenceThreshold: 0.7
});

// Check if any shipments need review
if (result.needsReview) {
  console.log(result.message);
}

// Access the parsed shipment data
const shipments = result.data;
```

## Testing

Run the tests using Vitest:

```
npm test
```

## Future Enhancements

1. **Custom Field Mapping Templates**: Allow users to create and save custom field mapping templates for specific vendors
2. **Feedback Loop for AI**: Incorporate user corrections to improve future AI mappings
3. **Batch Processing Optimization**: Enhance performance for large batch file processing
4. **Advanced Validation Rules**: Add domain-specific validation rules for shipment data
5. **Multi-language Support**: Extend AI mapping to handle column names in multiple languages 
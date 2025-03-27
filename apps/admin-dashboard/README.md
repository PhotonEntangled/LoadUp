# LoadUp Admin Dashboard

A modern logistics management dashboard built with Next.js, React, and TailwindCSS.

## Features

- **Document Management**: Upload, process, and manage logistics documents with automated data extraction
- **Shipment Tracking**: Real-time tracking of shipments with Mapbox integration
- **User Management**: Manage drivers, customers, and admin users
- **Analytics**: Comprehensive reporting and analytics dashboard
- **Mobile Responsive**: Fully responsive design for all devices

## Document Processing

The LoadUp Admin Dashboard includes a powerful document processing system that can:

- Extract structured data from various logistics document formats
- Process ETD Reports and Outstation Rates documents
- Convert unstructured text data into standardized shipment records
- Display processed shipment data in both table and card views
- Export shipment data to CSV format
- Create shipments directly from processed documents

### Supported Document Types

- ETD Reports
- Outstation Rates
- Bill of Lading
- Invoice
- Packing List
- Customs Declaration
- Delivery Order
- Other logistics documents

## Tech Stack

- **Next.js 14**: App Router, Server Components, API Routes
- **React**: Functional Components, Hooks
- **TailwindCSS**: Utility-first CSS framework
- **Zustand**: State management
- **NextAuth.js**: Authentication
- **API Integrations**: Mapbox (Live Tracking), Stripe (Payments)
- **AI Processing**: Document OCR and data extraction

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
cd apps/admin-dashboard
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

### Deploying to Vercel

1. Push your changes to a Git repository
2. Connect your repository to Vercel
3. Configure your environment variables
4. Deploy!

Alternatively, use the deployment script:

```bash
# For Windows PowerShell
./scripts/deploy.ps1

# For Unix/Linux/Mac
./scripts/deploy.sh
```

## Project Structure

```
apps/admin-dashboard/
├── app/                  # Next.js App Router
│   ├── api/              # API Routes
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # Dashboard pages
│   ├── documents/        # Document management pages
│   ├── shipments/        # Shipment management pages
│   └── ...
├── components/           # React components
│   ├── logistics/        # Logistics-specific components
│   ├── shared/           # Shared UI components
│   └── ui/               # UI components
├── lib/                  # Utility functions and libraries
│   ├── document-processing.ts  # Document processing utilities
│   └── ...
├── public/               # Static assets
└── ...
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. 
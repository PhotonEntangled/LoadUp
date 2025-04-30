import React from 'react';
import TrackingPageView from './_components/TrackingPageView';
import { logger } from '@/utils/logger';

interface TrackingPageProps {
  params: {
    // Corrected parameter name
    documentId: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default function TrackingPage({ params, searchParams }: TrackingPageProps) {
  // Corrected parameter extraction
  const { documentId } = params;

  if (!documentId) {
    logger.error('[TrackingPage] documentId param is missing.');
    // TODO: Implement proper not found handling (e.g., using next/navigation notFound())
    return <div>Error: Document ID is missing.</div>;
  }

  logger.info(`[TrackingPage] Rendering for documentId: ${documentId}`);

  // Render the main client component, passing the documentId
  return (
    <TrackingPageView documentId={documentId} />
  );
} 
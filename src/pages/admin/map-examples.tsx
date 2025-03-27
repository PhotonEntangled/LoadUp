import React from 'react';
import { NextPage } from 'next';
import Link from 'next/link';

interface ExampleCard {
  title: string;
  description: string;
  link: string;
  complexity: 'Basic' | 'Intermediate' | 'Advanced';
}

const examples: ExampleCard[] = [
  {
    title: 'Basic Map',
    description: 'A simple map component with just the essentials.',
    link: '/admin/basic-map',
    complexity: 'Basic'
  },
  {
    title: 'Store-Based Map',
    description: 'A map that uses Zustand store for state management.',
    link: '/admin/store-map',
    complexity: 'Basic'
  },
  {
    title: 'Marker Map',
    description: 'A map with interactive markers and info panels.',
    link: '/admin/marker-map',
    complexity: 'Intermediate'
  },
  {
    title: 'Route Map',
    description: 'A map displaying routes between multiple stops.',
    link: '/admin/route-map',
    complexity: 'Advanced'
  }
];

const ExampleCard: React.FC<ExampleCard> = ({ title, description, link, complexity }) => {
  // Color based on complexity
  const complexityColor = 
    complexity === 'Basic' ? 'bg-green-100 text-green-800' :
    complexity === 'Intermediate' ? 'bg-blue-100 text-blue-800' : 
    'bg-purple-100 text-purple-800';
  
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-lg">{title}</h3>
          <span className={`${complexityColor} text-xs px-2 py-1 rounded-full`}>
            {complexity}
          </span>
        </div>
        <p className="text-gray-600 mb-4">{description}</p>
        <Link 
          href={link} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md inline-block transition-colors"
        >
          View Example
        </Link>
      </div>
    </div>
  );
};

const MapExamplesPage: NextPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">LoadUp Map Component Examples</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our collection of map components from basic to advanced.
            Each example builds on the previous one, showcasing progressive enhancement.
          </p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {examples.map(example => (
            <ExampleCard key={example.title} {...example} />
          ))}
        </div>
        
        <div className="mt-12 max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Development Approach</h2>
          <p className="text-gray-700 mb-3">
            Our map components are built using an atomic design methodology, starting with the most basic 
            functionality and progressively adding features. This approach allows for:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li>Easier troubleshooting of issues at each step</li>
            <li>Clean separation of concerns between components</li>
            <li>Progressive enhancement of functionality</li>
            <li>Better reusability of component parts</li>
          </ul>
          <p className="text-gray-700">
            Each example showcases a different aspect of map functionality, from basic rendering 
            to advanced route planning and real-time tracking.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MapExamplesPage; 
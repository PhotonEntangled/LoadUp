import React from 'react';
import { NextPage } from 'next';
import Link from 'next/link';

const Home: NextPage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-600 mb-4">LoadUp App</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Welcome to the LoadUp application. Select one of the options below to navigate to different sections of the app.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Map Component Test Pages */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-blue-700 mb-4">Map Component Testing</h2>
            <ul className="space-y-3">
              <li>
                <Link href="/admin/map-examples" className="text-blue-600 hover:underline flex items-center">
                  <span className="mr-2">→</span> Map Examples Overview
                </Link>
              </li>
              <li>
                <Link href="/admin/basic-map" className="text-blue-600 hover:underline flex items-center">
                  <span className="mr-2">→</span> Basic Map
                </Link>
              </li>
              <li>
                <Link href="/admin/store-map" className="text-blue-600 hover:underline flex items-center">
                  <span className="mr-2">→</span> Store-Based Map
                </Link>
              </li>
              <li>
                <Link href="/admin/marker-map" className="text-blue-600 hover:underline flex items-center">
                  <span className="mr-2">→</span> Marker Map
                </Link>
              </li>
              <li>
                <Link href="/admin/route-map" className="text-blue-600 hover:underline flex items-center">
                  <span className="mr-2">→</span> Route Map
                </Link>
              </li>
              <li>
                <Link href="/vehicle-tracking" className="text-blue-600 hover:underline flex items-center font-bold">
                  <span className="mr-2">→</span> New Vehicle Tracking Page
                </Link>
              </li>
            </ul>
          </div>

          {/* Administration */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-blue-700 mb-4">Administration</h2>
            <ul className="space-y-3">
              <li>
                <Link href="/admin/dashboard" className="text-blue-600 hover:underline flex items-center">
                  <span className="mr-2">→</span> Admin Dashboard
                </Link>
              </li>
              <li>
                <Link href="/admin/fleet" className="text-blue-600 hover:underline flex items-center">
                  <span className="mr-2">→</span> Fleet Management
                </Link>
              </li>
              <li>
                <Link href="/tracking-demo" className="text-blue-600 hover:underline flex items-center">
                  <span className="mr-2">→</span> Original Tracking Demo
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 text-center text-sm text-gray-500">
          <p>
            Visit the <a href="/docs/map_implementation_plan.md" className="text-blue-500 hover:underline">Map Implementation Plan</a> for more details.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home; 
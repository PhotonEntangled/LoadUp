'use client';

import React from 'react';
import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-600 mb-4">LoadUp Admin</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Welcome to the LoadUp admin dashboard. Select one of the options below to navigate to different sections.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Map Component Test Pages */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-blue-700 mb-4">Map Component Testing</h2>
            <ul className="space-y-3">
              <li>
                <Link href="/admin/basic-map" className="text-blue-600 hover:underline flex items-center">
                  <span className="mr-2">→</span> Basic Map
                </Link>
              </li>
              <li>
                <Link href="/admin/simulation" className="text-blue-600 hover:underline flex items-center">
                  <span className="mr-2">→</span> Vehicle Simulation
                </Link>
              </li>
            </ul>
          </div>

          {/* Administration */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-blue-700 mb-4">Administration</h2>
            <ul className="space-y-3">
              <li>
                <Link href="/dashboard" className="text-blue-600 hover:underline flex items-center">
                  <span className="mr-2">→</span> Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 text-center text-sm text-gray-500">
          <p>
            Map components are being implemented using an atomic design methodology.
          </p>
        </div>
      </div>
    </div>
  );
} 
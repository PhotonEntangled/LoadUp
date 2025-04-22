// ✅ Merged from /v0-imports reference
// Manual V0 Integration: 2025-03-30

// Note: Original redirect/debug logic was removed as it's not suitable for the root dashboard page.

import Link from "next/link" // Assuming basic imports might be needed later

// Component Definition matching V0 structure
export default function RootPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-[#0B1F3A]">Dashboard</h1>
      <p className="mt-2 text-gray-500">Welcome to LoadUp logistics management system.</p>
      {/* Future dashboard widgets/components will go here */}
    </div>
  )
}

// Ensure no trailing code remains from the original file 
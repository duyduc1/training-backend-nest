"use client";

import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-60 bg-blue-700 text-white flex flex-col">
      <div className="p-4 text-lg font-bold border-b border-blue-500">
        My Dashboard
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <Link href="/dashboard" className="block px-3 py-2 rounded hover:bg-blue-600">
          Home
        </Link>
        <Link href="/dashboard/reports" className="block px-3 py-2 rounded hover:bg-blue-600">
          Reports
        </Link>
        <Link href="/dashboard/settings" className="block px-3 py-2 rounded hover:bg-blue-600">
          Settings
        </Link>
      </nav>
    </aside>
  );
}

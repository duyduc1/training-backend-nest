"use client";

export default function Header() {
  return (
    <header className="bg-white border-b px-6 py-3 flex justify-between items-center shadow-sm">
      <h2 className="text-lg font-semibold">Dashboard</h2>
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600">👋 Hi, Admin</span>
        <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
          Logout
        </button>
      </div>
    </header>
  );
}

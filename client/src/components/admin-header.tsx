import { Link } from "wouter";

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/admin" className="flex items-center space-x-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-[#1693a5] to-[#45b5c4] text-transparent bg-clip-text font-roboto">
            TripCheck
          </span>
        </Link>
        
        <div className="flex items-center space-x-4">
          <Link to="/dashboard" className="text-gray-600 hover:text-[#1693a5]">
            Voltar para Dashboard
          </Link>
        </div>
      </div>
    </header>
  );
}
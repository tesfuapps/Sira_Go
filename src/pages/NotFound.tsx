import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Home } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-8">
          <Search size={64} className="text-gray-400 dark:text-gray-600" strokeWidth={1.5} />
        </div>
        <h1 className="text-6xl font-extrabold text-sira-blue dark:text-white mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-sira-orange text-black rounded-full font-bold text-lg hover:bg-[#E66E00] transition-colors shadow-lg"
        >
          <Home size={20} />
          Back to Sira Go Home
        </Link>
      </div>
    </div>
  );
}

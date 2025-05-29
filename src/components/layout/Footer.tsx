import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="w-full py-4 text-sm bg-white border-t">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <p className="text-gray-600">© 2025 Simple CAD</p>
          <Link to="/about" className="text-gray-600 hover:text-gray-900">About us</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
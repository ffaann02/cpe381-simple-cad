import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="w-full py-4 text-sm bg-white border-t mt-auto mb-0">
      <div className="container mx-auto px-4">
        <div className="w-full text-center">
          <p className="text-gray-600 text-center">© 2025 Simple CAD</p>
          <Link to="/about" className="underline text-gray-600 hover:text-gray-900">About us</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 

import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700">
      <div className="container mx-auto px-4 py-6 text-center text-gray-500 dark:text-gray-400">
        <p>&copy; {new Date().getFullYear()} EchoAid. A Humanitarian Tech Initiative.</p>
        <p className="text-sm mt-1">Contact: info@echoaid.org</p>
      </div>
    </footer>
  );
};

export default Footer;

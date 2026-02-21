
import React, { useState } from 'react';

interface HeaderProps {
  onMenuClick: () => void;
  isAdmin: boolean;
  onAdminToggle: () => void;
  onSearch: (term: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, isAdmin, onAdminToggle, onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleAdminBtnClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Header Admin Button Clicked");
    onAdminToggle();
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-[#0f0f0f] flex items-center justify-between px-4 z-[50] border-b border-[#222222]">
      <div className="flex items-center space-x-4">
        <button 
          type="button"
          onClick={onMenuClick}
          className="p-2 hover:bg-[#272727] rounded-full transition-colors hidden md:block"
        >
          <i className="fas fa-bars text-xl text-white"></i>
        </button>
        <div className="flex items-center space-x-1 cursor-pointer" onClick={() => window.location.reload()}>
          <div className="bg-red-600 rounded-lg p-1.5 shadow-lg shadow-red-900/20">
            <i className="fas fa-play text-white text-xs"></i>
          </div>
          <span className="text-xl font-bold tracking-tighter text-white">AS-Tube</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="hidden md:flex flex-1 max-w-[600px] items-center ml-10 h-10">
        <div className="flex flex-1 items-center h-full bg-[#121212] border border-[#303030] rounded-l-full px-4 focus-within:border-blue-500 transition-all shadow-inner">
          <input 
            type="text" 
            placeholder="Search"
            className="bg-transparent outline-none w-full text-white placeholder-gray-500 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          type="submit"
          className="bg-[#222222] border border-l-0 border-[#303030] rounded-r-full px-6 h-full hover:bg-[#272727] transition-colors flex items-center justify-center"
        >
          <i className="fas fa-search text-gray-300"></i>
        </button>
      </form>

      <div className="flex items-center space-x-4">
        <button 
          type="button"
          onClick={handleAdminBtnClick}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center space-x-2 shadow-lg ${
            isAdmin 
              ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-900/30' 
              : 'bg-[#272727] text-gray-200 hover:bg-[#3f3f3f] border border-[#333]'
          }`}
        >
          <i className={`fas ${isAdmin ? 'fa-crown' : 'fa-lock'}`}></i>
          <span className="hidden sm:inline">{isAdmin ? 'Admin Panel' : 'Admin Login'}</span>
        </button>
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${isAdmin ? 'bg-red-600 border-red-300 text-white' : 'bg-purple-600 border-[#444] text-white'}`}>
          {isAdmin ? 'A' : 'U'}
        </div>
      </div>
    </header>
  );
};

export default Header;

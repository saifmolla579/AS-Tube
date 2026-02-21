
import React, { useState } from 'react';

interface HeaderProps {
  onMenuClick: () => void;
  isAdmin: boolean;
  onAdminToggle: () => void;
  onSearch: (term: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, isAdmin, onAdminToggle, onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleAdminBtnClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Admin button clicked in menu");
    setIsMenuOpen(false);
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

      <div className="flex items-center space-x-2 relative">
        {isAdmin && (
          <button 
            onClick={() => {
              console.log("Header Close Admin clicked");
              onAdminToggle();
            }}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition-all mr-1 sm:mr-2 shadow-lg shadow-red-900/20 border border-red-500/50"
          >
            <i className="fas fa-times-circle"></i>
            <span className="hidden xs:inline">Close Admin Panel</span>
            <span className="xs:hidden">Close</span>
          </button>
        )}

        <div className="relative">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-[#272727] rounded-full text-white transition-colors"
          >
            <i className="fas fa-ellipsis-v"></i>
          </button>

          {isMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)}></div>
              <div className="absolute right-0 mt-2 w-56 bg-[#282828] border border-[#3e3e3e] rounded-xl shadow-2xl z-50 py-2 animate-in fade-in zoom-in duration-200 origin-top-right">
                <button 
                  onClick={handleAdminBtnClick}
                  className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-[#3e3e3e] transition-colors text-left"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isAdmin ? 'bg-red-600' : 'bg-gray-600'}`}>
                    <i className={`fas ${isAdmin ? 'fa-crown' : 'fa-lock'} text-xs text-white`}></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{isAdmin ? 'Admin Dashboard' : 'Admin Login'}</p>
                    <p className="text-[11px] text-gray-400">{isAdmin ? 'You have full access' : 'Restricted access'}</p>
                  </div>
                </button>
                <div className="h-[1px] bg-[#3e3e3e] my-1"></div>
                <button className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-[#3e3e3e] transition-colors text-left">
                  <i className="fas fa-circle-question text-gray-400 w-8 text-center"></i>
                  <span className="text-sm text-white">Help & Feedback</span>
                </button>
                <button className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-[#3e3e3e] transition-colors text-left">
                  <i className="fas fa-gear text-gray-400 w-8 text-center"></i>
                  <span className="text-sm text-white">Settings</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

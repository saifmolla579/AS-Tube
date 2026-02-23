
import React from 'react';
import AdsterraAd from './AdsterraAd';

interface SidebarProps {
  isOpen: boolean;
  activeSection: string;
  onSectionChange: (section: string) => void;
  isAdmin: boolean;
  onAdminToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, activeSection, onSectionChange, isAdmin, onAdminToggle }) => {
  const menuItems = [
    { icon: 'fa-house', label: 'Home', id: 'Home' },
    { icon: 'fa-clapperboard', label: 'Subscriptions', id: 'Subscriptions' },
    { divider: true },
    { icon: 'fa-clock-rotate-left', label: 'History', id: 'History' },
    { icon: 'fa-list-ul', label: 'Playlists', id: 'Playlists' },
    { icon: 'fa-clock', label: 'Watch Later', id: 'Watch Later' },
    { icon: 'fa-thumbs-up', label: 'Liked Videos', id: 'Liked Videos' },
  ];

  if (!isOpen) return null;

  return (
    <aside className="fixed top-16 left-0 bottom-0 w-64 bg-[#0f0f0f] py-3 overflow-y-auto hidden md:block scrollbar-hide z-40 border-r border-[#222222]">
      <div className="flex flex-col space-y-1">
        {menuItems.map((item, idx) => (
          item.divider ? (
            <div key={idx} className="h-[1px] bg-[#3f3f3f] my-3 mx-4"></div>
          ) : (
            <button 
              key={idx}
              onClick={() => onSectionChange(item.id || '')}
              className={`flex items-center space-x-5 px-4 py-2.5 hover:bg-[#272727] mx-2 rounded-xl transition-colors ${
                activeSection === item.id ? 'bg-[#272727] font-medium' : ''
              }`}
            >
              <i className={`fas ${item.icon} text-lg w-6`}></i>
              <span className="text-sm">{item.label}</span>
            </button>
          )
        ))}
        
        <div className="h-[1px] bg-[#3f3f3f] my-3 mx-4"></div>
        <button 
          onClick={onAdminToggle}
          className={`flex items-center space-x-5 px-4 py-2.5 hover:bg-[#272727] mx-2 rounded-xl transition-colors ${isAdmin ? 'text-red-500' : 'text-gray-400'}`}
        >
          <i className={`fas ${isAdmin ? 'fa-unlock-alt' : 'fa-lock'} text-lg w-6`}></i>
          <span className="text-sm font-medium">{isAdmin ? 'Close Admin Panel' : 'Admin Login'}</span>
        </button>
      </div>
      
      <div className="px-6 py-4 mt-4 text-[13px] text-[#aaaaaa] font-medium flex flex-wrap gap-x-2 leading-relaxed">
        <a href="#" className="hover:text-white">About</a>
        <a href="#" className="hover:text-white">Press</a>
        <a href="#" className="hover:text-white">Copyright</a>
        <a href="#" className="hover:text-white">Contact us</a>
      </div>
      <div className="px-6 py-1 text-[12px] text-[#717171] mb-4">
        © 2024 AS-Tube LLC
      </div>

      {/* Adsterra Sidebar Ad Slot */}
      <div className="px-4 mt-2">
        <AdsterraAd 
          id="adsterra_sidebar_id" 
          width={200} 
          height={200} 
          className="bg-[#1a1a1a] rounded-xl border border-[#333]"
        />
        <p className="text-[10px] text-center text-gray-600 mt-1 uppercase tracking-widest">Advertisement</p>
      </div>
    </aside>
  );
};

export default Sidebar;

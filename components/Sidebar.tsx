
import React from 'react';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const menuItems = [
    { icon: 'fa-house', label: 'Home', active: true },
    { icon: 'fa-bolt', label: 'Shorts', active: false },
    { icon: 'fa-clapperboard', label: 'Subscriptions', active: false },
    { divider: true },
    { icon: 'fa-clock-rotate-left', label: 'History', active: false },
    { icon: 'fa-list-ul', label: 'Playlists', active: false },
    { icon: 'fa-clock', label: 'Watch Later', active: false },
    { icon: 'fa-thumbs-up', label: 'Liked Videos', active: false },
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
              className={`flex items-center space-x-5 px-4 py-2.5 hover:bg-[#272727] mx-2 rounded-xl transition-colors ${
                item.active ? 'bg-[#272727] font-medium' : ''
              }`}
            >
              <i className={`fas ${item.icon} text-lg w-6`}></i>
              <span className="text-sm">{item.label}</span>
            </button>
          )
        ))}
      </div>
      
      <div className="px-6 py-4 mt-4 text-[13px] text-[#aaaaaa] font-medium flex flex-wrap gap-x-2 leading-relaxed">
        <a href="#" className="hover:text-white">About</a>
        <a href="#" className="hover:text-white">Press</a>
        <a href="#" className="hover:text-white">Copyright</a>
        <a href="#" className="hover:text-white">Contact us</a>
      </div>
      <div className="px-6 py-1 text-[12px] text-[#717171]">
        © 2024 AS-Tube LLC
      </div>
    </aside>
  );
};

export default Sidebar;

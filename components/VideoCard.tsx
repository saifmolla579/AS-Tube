
import React, { useState } from 'react';
import { Video } from '../types';

interface VideoCardProps {
  video: Video;
  onClick: (id: string) => void;
  isAdmin?: boolean;
  onDelete?: (id: string, e: React.MouseEvent) => void;
  onEdit?: (video: Video, e: React.MouseEvent) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onClick, isAdmin, onDelete, onEdit }) => {
  const [imgError, setImgError] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div 
      className="flex flex-col cursor-pointer group relative"
      onClick={() => onClick(video.id)}
    >
      {isAdmin && (
        <div className="absolute top-2 right-2 z-20">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="bg-black/60 hover:bg-black/80 text-white w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-lg border border-white/10"
          >
            <i className="fas fa-ellipsis-v text-xs"></i>
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-2 w-32 bg-[#1e1e1e] border border-[#333] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                  if (onEdit) onEdit(video, e);
                }}
                className="w-full px-4 py-2.5 text-left text-xs font-bold text-gray-300 hover:bg-[#272727] hover:text-white flex items-center space-x-2 transition-colors"
              >
                <i className="fas fa-edit text-blue-400"></i>
                <span>Edit Video</span>
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                  if (onDelete) onDelete(video.id, e);
                }}
                className="w-full px-4 py-2.5 text-left text-xs font-bold text-red-400 hover:bg-red-600/10 flex items-center space-x-2 transition-colors"
              >
                <i className="fas fa-trash-alt"></i>
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      )}
      <div className="relative aspect-video rounded-xl overflow-hidden bg-[#272727] shadow-lg border border-white/5">
        {imgError ? (
          <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#333] flex items-center justify-center">
            <i className="fas fa-play-circle text-4xl text-gray-600"></i>
          </div>
        ) : (
          <img 
            src={video.thumbnail} 
            alt={video.title}
            onError={() => setImgError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[12px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm z-10">
          {video.duration}
        </div>
      </div>
      
      <div className="flex mt-3 space-x-3">
        <div className="flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-red-600 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shadow-md">
            AS
          </div>
        </div>
        <div className="flex flex-col">
          <h3 className="text-[14px] font-semibold line-clamp-2 leading-tight mb-1 text-white group-hover:text-blue-400 transition-colors">
            {video.title}
          </h3>
          <div className="text-[12px] text-gray-400">
            <p className="hover:text-white transition-colors flex items-center">
              {video.creator}
              <i className="fas fa-check-circle text-[9px] ml-1 text-gray-500"></i>
            </p>
            <p>{video.views} views • {video.uploadedAt}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;

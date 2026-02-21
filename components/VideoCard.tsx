
import React, { useState } from 'react';
import { Video } from '../types';

interface VideoCardProps {
  video: Video;
  onClick: (id: string) => void;
  isAdmin?: boolean;
  onDelete?: (id: string, e: React.MouseEvent) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onClick, isAdmin, onDelete }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div 
      className="flex flex-col cursor-pointer group relative"
      onClick={() => onClick(video.id)}
    >
      {isAdmin && onDelete && (
        <button 
          onClick={(e) => onDelete(video.id, e)}
          className="absolute top-2 left-2 z-10 bg-black/60 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg"
          title="Delete Video"
        >
          <i className="fas fa-trash-alt text-xs"></i>
        </button>
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
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[12px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm">
          {video.duration}
        </div>
        {video.isYoutube && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-sm shadow-lg">
            YT
          </div>
        )}
        {video.isGoogleDrive && (
          <div className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-sm shadow-lg">
            GD
          </div>
        )}
      </div>
      
      <div className="flex mt-3 space-x-3">
        <div className="flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-red-600 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shadow-md">
            TS
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

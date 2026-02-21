
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Layout from './components/Layout';
import VideoCard from './components/VideoCard';
import UploadModal from './components/UploadModal';
import PinModal from './components/PinModal';
import { Video } from './types';
import { INITIAL_VIDEOS, CATEGORIES } from './constants';

const ADMIN_PIN = "1234"; 

const App: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Load state from localStorage
  useEffect(() => {
    try {
      const savedVideos = localStorage.getItem('as_tube_videos');
      if (savedVideos) {
        setVideos(JSON.parse(savedVideos));
      } else {
        setVideos(INITIAL_VIDEOS);
      }

      const adminSession = localStorage.getItem('as_tube_admin_session');
      if (adminSession === 'true') {
        setIsAdmin(true);
      }
    } catch (e) {
      console.error("Failed to load state:", e);
      setVideos(INITIAL_VIDEOS);
    }
  }, []);

  // Save videos to localStorage
  useEffect(() => {
    if (videos.length > 0) {
      localStorage.setItem('as_tube_videos', JSON.stringify(videos));
    }
  }, [videos]);

  const handleAdminToggleRequest = useCallback(() => {
    if (isAdmin) {
      if (window.confirm("Are you sure you want to log out?")) {
        setIsAdmin(false);
        localStorage.removeItem('as_tube_admin_session');
      }
    } else {
      setIsPinModalOpen(true);
    }
  }, [isAdmin]);

  const handlePinVerify = useCallback((pin: string) => {
    if (pin.trim() === ADMIN_PIN) {
      setIsAdmin(true);
      localStorage.setItem('as_tube_admin_session', 'true');
      setIsPinModalOpen(false);
      alert("Welcome, AS-Tube Creator!");
    } else {
      alert("Invalid PIN code.");
    }
  }, []);

  const filteredVideos = useMemo(() => {
    return videos.filter(v => {
      const matchesCategory = activeCategory === 'All' || v.category === activeCategory;
      const matchesSearch = v.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          v.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [videos, activeCategory, searchTerm]);

  const handleUpload = (newVideoData: Omit<Video, 'id' | 'views' | 'uploadedAt'>) => {
    const newVideo: Video = {
      ...newVideoData,
      id: Math.random().toString(36).substring(7),
      views: '0',
      uploadedAt: 'Just now'
    };
    setVideos([newVideo, ...videos]);
  };

  const handleVideoClick = (id: string) => {
    const video = videos.find(v => v.id === id);
    if (video) {
      setSelectedVideo(video);
      // Increment views (simulated)
      setVideos(prev => prev.map(v => {
        if (v.id === id) {
          const currentViews = parseInt(v.views.replace(/[^0-9]/g, '')) || 0;
          const suffix = v.views.replace(/[0-9]/g, '') || '';
          return { ...v, views: (currentViews + 1) + suffix };
        }
        return v;
      }));
    }
  };

  const handleDeleteVideo = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this video?")) {
      setVideos(prev => prev.filter(v => v.id !== id));
    }
  };

  // Robust YouTube URL construction using No-Cookie domain to fix Error 153
  const getYoutubeEmbedUrl = (videoId: string) => {
    // Using youtube-nocookie.com is often more reliable in sandboxed environments
    return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&showinfo=0`;
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <Layout 
        isAdmin={isAdmin} 
        onAdminToggle={handleAdminToggleRequest}
        onSearch={(term) => setSearchTerm(term)}
      >
        <div className="md:hidden mb-6 mt-2">
          <div className="flex items-center bg-[#272727] rounded-full px-5 py-2.5 shadow-lg border border-[#333]">
            <i className="fas fa-search text-gray-400 mr-3"></i>
            <input 
              type="text" 
              placeholder="Search AS-Tube"
              className="bg-transparent outline-none w-full text-sm placeholder-gray-500 text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex space-x-3 overflow-x-auto pb-4 mb-6 no-scrollbar sticky top-16 bg-[#0f0f0f] z-30 pt-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat ? 'bg-white text-black shadow-md scale-105' : 'bg-[#272727] hover:bg-[#3f3f3f] text-white border border-transparent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
          {filteredVideos.length > 0 ? (
            filteredVideos.map(video => (
              <VideoCard 
                key={video.id} 
                video={video} 
                onClick={handleVideoClick} 
                isAdmin={isAdmin}
                onDelete={handleDeleteVideo}
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center text-gray-500">
              <i className="fas fa-search text-4xl mb-4 opacity-20"></i>
              <p>No videos found matching your search.</p>
            </div>
          )}
        </div>

        {isAdmin && (
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="fixed bottom-8 right-8 w-16 h-16 bg-red-600 hover:bg-red-700 rounded-full shadow-2xl flex items-center justify-center text-white z-[50] transition-all active:scale-90 hover:scale-110 border-4 border-red-500/30"
            title="Upload Video"
          >
            <i className="fas fa-plus text-2xl"></i>
          </button>
        )}
      </Layout>

      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        onUpload={handleUpload} 
      />
      
      <PinModal 
        isOpen={isPinModalOpen} 
        onClose={() => setIsPinModalOpen(false)} 
        onVerify={handlePinVerify} 
      />

      {selectedVideo && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex flex-col md:flex-row p-0 md:p-6 overflow-y-auto animate-in fade-in zoom-in duration-300">
          <button 
            onClick={() => setSelectedVideo(null)}
            className="fixed top-4 right-4 z-[210] bg-white/10 hover:bg-red-600 w-12 h-12 rounded-full flex items-center justify-center border border-white/10 transition-all group"
          >
            <i className="fas fa-times text-xl text-white group-hover:scale-110"></i>
          </button>
          
          <div className="flex-1 lg:max-w-5xl mx-auto w-full pt-16 md:pt-0">
            <div className="aspect-video bg-black w-full rounded-none md:rounded-2xl overflow-hidden mb-4 shadow-2xl border border-white/5 ring-1 ring-white/10">
              {selectedVideo.isYoutube ? (
                <iframe 
                  title={selectedVideo.title}
                  src={getYoutubeEmbedUrl(selectedVideo.url)}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              ) : (
                <video src={selectedVideo.url} className="w-full h-full" controls autoPlay />
              )}
            </div>
            
            <div className="p-4 md:p-0">
              <h1 className="text-xl md:text-2xl font-bold text-white leading-tight mb-4">{selectedVideo.title}</h1>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between py-4 border-b border-[#303030] gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-red-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg border border-white/10">AS</div>
                  <div>
                    <h4 className="font-bold text-white flex items-center">
                      {selectedVideo.creator}
                      <i className="fas fa-check-circle text-blue-500 text-[10px] ml-2"></i>
                    </h4>
                    <p className="text-xs text-gray-400">Official AS-Tube Creator</p>
                  </div>
                  <button className="bg-white text-black px-4 py-2 rounded-full text-sm font-bold ml-4 hover:bg-gray-200 transition-colors">Subscribe</button>
                </div>
                <div className="flex items-center space-x-2">
                   <button className="bg-[#272727] hover:bg-[#3f3f3f] px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 transition-colors">
                     <i className="fas fa-thumbs-up"></i> <span>Like</span>
                   </button>
                   <button className="bg-[#272727] hover:bg-[#3f3f3f] px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 transition-colors">
                     <i className="fas fa-share"></i> <span>Share</span>
                   </button>
                </div>
              </div>
              
              <div className="mt-4 p-5 bg-[#1a1a1a] border border-[#222] rounded-2xl text-sm shadow-inner group">
                <div className="font-bold mb-2 text-white group-hover:text-blue-400 transition-colors">
                  {selectedVideo.views} views • {selectedVideo.uploadedAt}
                </div>
                <p className="whitespace-pre-wrap text-gray-300 leading-relaxed max-w-none">
                  {selectedVideo.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

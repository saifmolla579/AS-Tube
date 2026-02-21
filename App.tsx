
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Layout from './components/Layout';
import VideoCard from './components/VideoCard';
import UploadModal from './components/UploadModal';
import PinModal from './components/PinModal';
import { Video } from './types';
import { INITIAL_VIDEOS } from './constants.tsx';
import { supabase, isSupabaseConfigured } from './services/supabase';

const ADMIN_PIN = "72437700"; 

const App: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState('Home');
  const [likedVideoIds, setLikedVideoIds] = useState<string[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Load state from Supabase
  useEffect(() => {
    const fetchVideos = async () => {
      if (!isSupabaseConfigured()) {
        console.warn("Supabase not configured. Using initial videos.");
        setVideos(INITIAL_VIDEOS);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('videos')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Supabase fetch error:", error);
          setVideos(INITIAL_VIDEOS);
        } else if (data && data.length > 0) {
          setVideos(data);
        } else {
          setVideos(INITIAL_VIDEOS);
        }
      } catch (e) {
        console.error("Failed to load state:", e);
        setVideos(INITIAL_VIDEOS);
      }
    };

    fetchVideos();

    // Set up real-time subscription
    let channel: any = null;
    if (isSupabaseConfigured()) {
      channel = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'videos'
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setVideos(prev => [payload.new as Video, ...prev]);
            } else if (payload.eventType === 'DELETE') {
              setVideos(prev => prev.filter(v => v.id !== payload.old.id));
            } else if (payload.eventType === 'UPDATE') {
              setVideos(prev => prev.map(v => v.id === payload.new.id ? (payload.new as Video) : v));
            }
          }
        )
        .subscribe();
    }

    const savedLikes = localStorage.getItem('as_tube_liked_videos');
    if (savedLikes) {
      setLikedVideoIds(JSON.parse(savedLikes));
    }

    const savedSub = localStorage.getItem('as_tube_is_subscribed');
    if (savedSub === 'true') {
      setIsSubscribed(true);
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const handleAdminToggleRequest = useCallback(() => {
    if (isAdmin) {
      setIsAdmin(false);
      alert("Admin Panel Closed.");
    } else {
      setIsPinModalOpen(true);
    }
  }, [isAdmin]);

  const handlePinVerify = useCallback((pin: string) => {
    if (pin.trim() === ADMIN_PIN) {
      setIsAdmin(true);
      setIsPinModalOpen(false);
      alert("Welcome, TR SAIF!");
    } else {
      alert("Invalid PIN code.");
    }
  }, []);

  const filteredVideos = useMemo(() => {
    return videos.filter(v => {
      const matchesSearch = v.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          v.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (activeSection === 'Liked Videos') {
        return matchesSearch && likedVideoIds.includes(v.id);
      }

      if (activeSection === 'Subscriptions') {
        return matchesSearch && isSubscribed;
      }
      
      return matchesSearch;
    });
  }, [videos, searchTerm, activeSection, likedVideoIds]);

  const handleUpload = async (newVideoData: Omit<Video, 'id' | 'views' | 'uploadedAt'>) => {
    const newVideo: Video = {
      ...newVideoData,
      id: Math.random().toString(36).substring(7),
      views: '0',
      uploadedAt: new Date().toLocaleDateString()
    };
    
    if (!isSupabaseConfigured()) {
      alert("Supabase is not configured. Video will only be saved locally for this session.");
      setVideos([newVideo, ...videos]);
      return;
    }

    try {
      const { error } = await supabase.from('videos').insert([newVideo]);
      if (error) throw error;
      // Real-time subscription will handle the UI update
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload to Supabase. Make sure the 'videos' table exists.");
      // Fallback for demo
      setVideos([newVideo, ...videos]);
    }
  };

  const handleLike = async (id: string) => {
    const isLiked = likedVideoIds.includes(id);
    const newLikedIds = isLiked 
      ? likedVideoIds.filter(vid => vid !== id)
      : [...likedVideoIds, id];
    
    setLikedVideoIds(newLikedIds);
    localStorage.setItem('as_tube_liked_videos', JSON.stringify(newLikedIds));

    // Update video likes count
    const video = videos.find(v => v.id === id);
    if (video) {
      const newLikes = isLiked ? Math.max(0, video.likes - 1) : video.likes + 1;
      
      if (isSupabaseConfigured()) {
        try {
          await supabase
            .from('videos')
            .update({ likes: newLikes })
            .eq('id', id);
        } catch (error) {
          console.error("Like update error:", error);
        }
      } else {
        setVideos(prev => prev.map(v => v.id === id ? { ...v, likes: newLikes } : v));
      }
      
      // Update selected video state if open
      if (selectedVideo && selectedVideo.id === id) {
        setSelectedVideo({ ...selectedVideo, likes: newLikes });
      }
    }
  };

  const handleSubscribe = () => {
    const newSubState = !isSubscribed;
    setIsSubscribed(newSubState);
    localStorage.setItem('as_tube_is_subscribed', newSubState ? 'true' : 'false');
    if (newSubState) {
      alert("Subscribed to TR SAIF!");
    }
  };

  const handleVideoClick = async (id: string) => {
    const video = videos.find(v => v.id === id);
    if (video) {
      setSelectedVideo(video);
      
      // Increment views (simulated local update first)
      const currentViews = parseInt(video.views.replace(/[^0-9]/g, '')) || 0;
      const suffix = video.views.replace(/[0-9]/g, '') || '';
      const newViews = (currentViews + 1) + suffix;

      if (isSupabaseConfigured()) {
        try {
          await supabase
            .from('videos')
            .update({ views: newViews })
            .eq('id', id);
        } catch (error) {
          console.error("View increment error:", error);
        }
      } else {
        setVideos(prev => prev.map(v => v.id === id ? { ...v, views: newViews } : v));
      }
    }
  };

  const handleDeleteVideo = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this video?")) {
      // Update local state immediately for better responsiveness
      setVideos(prev => prev.filter(v => v.id !== id));

      if (isSupabaseConfigured()) {
        try {
          const { error } = await supabase.from('videos').delete().eq('id', id);
          if (error) {
            console.error("Supabase delete error:", error);
            alert("Failed to delete from database. Please try again.");
            // Optionally re-fetch videos here if needed
          }
        } catch (error) {
          console.error("Delete error:", error);
          alert("An error occurred while deleting.");
        }
      }
    }
  };

  const handleShare = (video: Video) => {
    let shareUrl = video.url;
    if (video.isYoutube) {
      shareUrl = `https://www.youtube.com/watch?v=${video.url}`;
    } else if (video.isGoogleDrive) {
      shareUrl = `https://drive.google.com/file/d/${video.url}/view`;
    }
    
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert("Link copied to clipboard!");
      }).catch(err => {
        console.error("Failed to copy:", err);
        fallbackCopyTextToClipboard(shareUrl);
      });
    } else {
      fallbackCopyTextToClipboard(shareUrl);
    }
  };

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        alert("Link copied to clipboard!");
      } else {
        alert("Unable to copy link. Please copy it manually: " + text);
      }
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
      alert("Unable to copy link. Please copy it manually: " + text);
    }

    document.body.removeChild(textArea);
  };

  // Robust YouTube URL construction using No-Cookie domain to fix Error 153
  const getYoutubeEmbedUrl = (videoId: string) => {
    // Using youtube-nocookie.com is often more reliable in sandboxed environments
    return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&showinfo=0`;
  };

  const getGoogleDriveEmbedUrl = (fileId: string) => {
    return `https://drive.google.com/file/d/${fileId}/preview`;
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <Layout 
        isAdmin={isAdmin} 
        onAdminToggle={handleAdminToggleRequest}
        onSearch={(term) => setSearchTerm(term)}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
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

        {isAdmin && (
          <div className="bg-red-600/10 border border-red-500/20 rounded-2xl p-4 mb-6 flex items-center justify-between backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white shadow-lg">
                <i className="fas fa-user-shield"></i>
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Admin Mode Active</h3>
                <div className="flex items-center space-x-2">
                  <p className="text-xs text-gray-400">You can now upload and delete videos.</p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/30 border border-white/10 flex items-center">
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isSupabaseConfigured() ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                    <span className="text-gray-300">{isSupabaseConfigured() ? 'Supabase Connected' : 'Local Mode'}</span>
                  </span>
                </div>
              </div>
            </div>
            <button 
              onClick={handleAdminToggleRequest}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2"
            >
              <i className="fas fa-sign-out-alt"></i>
              <span>Close Admin Panel</span>
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center">
            {activeSection === 'Home' ? 'Recommended' : activeSection}
            {activeSection === 'Liked Videos' && <span className="ml-2 text-sm font-normal text-gray-400">({filteredVideos.length})</span>}
          </h2>
          {activeSection !== 'Home' && (
            <button 
              onClick={() => setActiveSection('Home')}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Back to Home
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8">
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
              <i className={`fas ${activeSection === 'Subscriptions' && !isSubscribed ? 'fa-user-plus' : 'fa-search'} text-4xl mb-4 opacity-20`}></i>
              <p>
                {activeSection === 'Subscriptions' && !isSubscribed 
                  ? "Subscribe to TR SAIF to see videos here." 
                  : "No videos found matching your search."}
              </p>
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
              ) : selectedVideo.isGoogleDrive ? (
                <iframe 
                  title={selectedVideo.title}
                  src={getGoogleDriveEmbedUrl(selectedVideo.url)}
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
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-red-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg border border-white/10">TS</div>
                  <div>
                    <h4 className="font-bold text-white flex items-center">
                      {selectedVideo.creator}
                      <i className="fas fa-check-circle text-blue-500 text-[10px] ml-2"></i>
                    </h4>
                    <p className="text-xs text-gray-400">Official Creator</p>
                  </div>
                  <button 
                    onClick={handleSubscribe}
                    className={`px-4 py-2 rounded-full text-sm font-bold ml-4 transition-all ${
                      isSubscribed 
                        ? 'bg-[#272727] text-gray-400 hover:bg-[#3f3f3f]' 
                        : 'bg-white text-black hover:bg-gray-200'
                    }`}
                  >
                    {isSubscribed ? 'Subscribed' : 'Subscribe'}
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                   <button 
                     onClick={() => handleLike(selectedVideo.id)}
                     className={`px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 transition-colors ${
                       likedVideoIds.includes(selectedVideo.id)
                         ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                         : 'bg-[#272727] hover:bg-[#3f3f3f] text-white'
                     }`}
                   >
                     <i className={`fas fa-thumbs-up ${likedVideoIds.includes(selectedVideo.id) ? 'text-blue-400' : ''}`}></i> 
                     <span>{selectedVideo.likes.toLocaleString()}</span>
                   </button>
                   <button 
                     onClick={() => handleShare(selectedVideo)}
                     className="bg-[#272727] hover:bg-[#3f3f3f] px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 transition-colors text-white"
                   >
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

              {/* Recommended Videos Section */}
              <div className="mt-8 mb-12">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <i className="fas fa-play-circle text-red-500 mr-2"></i>
                  Recommended Videos
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {videos
                    .filter(v => v.id !== selectedVideo.id)
                    .slice(0, 6)
                    .map(video => (
                      <div 
                        key={video.id}
                        onClick={() => handleVideoClick(video.id)}
                        className="flex flex-col bg-[#1a1a1a] rounded-xl overflow-hidden cursor-pointer hover:bg-[#2a2a2a] transition-all border border-white/5 group"
                      >
                        <div className="aspect-video relative overflow-hidden">
                          <img 
                            src={video.thumbnail} 
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                            {video.duration}
                          </div>
                        </div>
                        <div className="p-3">
                          <h4 className="text-white text-sm font-bold line-clamp-2 mb-1 group-hover:text-blue-400 transition-colors">
                            {video.title}
                          </h4>
                          <div className="text-[11px] text-gray-400">
                            {video.creator} • {video.views} views
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

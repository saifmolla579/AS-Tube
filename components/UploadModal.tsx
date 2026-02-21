
import React, { useState, useEffect, useRef } from 'react';
import { generateVideoMetadata } from '../services/geminiService';
import { Video } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (video: Omit<Video, 'id' | 'views' | 'uploadedAt'>) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUpload }) => {
  const [uploadType, setUploadType] = useState<'file' | 'youtube'>('youtube');
  const [ytUrl, setYtUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Ref to track if the current fetch should be ignored (canceled)
  const isCanceledRef = useRef(false);

  const extractYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleFetchMetadata = async () => {
    const prompt = uploadType === 'youtube' ? ytUrl : title || file?.name;
    if (!prompt) {
      alert(uploadType === 'youtube' ? "Please enter a valid YouTube URL first." : "Please enter a title or select a file first.");
      return;
    }

    // Check for API key if using a model that requires it (though we switched to flash, it's good practice)
    if (typeof window !== 'undefined' && (window as any).aistudio) {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        if (window.confirm("AI features require a Gemini API key. Would you like to select one now?")) {
          await (window as any).aistudio.openSelectKey();
          // After opening, we don't wait, just proceed if they selected it.
        } else {
          return;
        }
      }
    }

    setIsFetchingMetadata(true);
    isCanceledRef.current = false;
    
    try {
      const metadata = await generateVideoMetadata(prompt, uploadType === 'youtube');
      
      if (!isCanceledRef.current) {
        if (metadata.title) setTitle(metadata.title);
        if (metadata.description) setDescription(metadata.description);
      }
    } catch (error) {
      console.error("Failed to fetch metadata", error);
    } finally {
      if (!isCanceledRef.current) {
        setIsFetchingMetadata(false);
      }
    }
  };

  const handleCancelFetch = () => {
    isCanceledRef.current = true;
    setIsFetchingMetadata(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setVideoPreview(URL.createObjectURL(selectedFile));
      // Set title to filename if title is currently empty
      if (!title) setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalUrl = '';
    let finalThumbnail = '';
    let isYoutube = false;

    if (uploadType === 'youtube') {
      const id = extractYoutubeId(ytUrl);
      if (!id) {
        alert("Invalid YouTube URL");
        return;
      }
      finalUrl = id;
      finalThumbnail = `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
      isYoutube = true;
    } else {
      if (!file) {
        alert("Please select a file");
        return;
      }
      finalUrl = videoPreview || '';
      finalThumbnail = `https://picsum.photos/seed/${Math.random()}/640/360`;
    }

    setIsPublishing(true);
    setUploadProgress(0);

    if (uploadType === 'file') {
      const duration = 2000;
      const steps = 20;
      const interval = duration / steps;
      
      for (let i = 1; i <= steps; i++) {
        await new Promise(resolve => setTimeout(resolve, interval));
        setUploadProgress(Math.round((i / steps) * 100));
      }
    } else {
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    onUpload({
      title: title || 'Untitled Video',
      description,
      url: finalUrl,
      thumbnail: finalThumbnail,
      duration: uploadType === 'youtube' ? 'YT' : '5:00',
      likes: 0,
      creator: 'TR SAIF',
      isYoutube
    });
    
    setIsPublishing(false);
    setUploadProgress(0);
    setFile(null);
    setVideoPreview(null);
    setYtUrl('');
    setTitle('');
    setDescription('');
    onClose();
  };

  if (!isOpen) return null;

  const ytId = extractYoutubeId(ytUrl);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 backdrop-blur-sm px-4">
      <div className="bg-[#1e1e1e] w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-[#303030] animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between p-4 border-b border-[#303030] sticky top-0 bg-[#1e1e1e] z-10">
          <h2 className="text-xl font-bold">Add New Video</h2>
          <button onClick={onClose} className="p-2 hover:bg-[#303030] rounded-full transition-colors">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {isPublishing && (
          <div className="p-4 bg-blue-600/10 border-b border-blue-600/20 flex flex-col items-center justify-center space-y-3">
            <div className="flex items-center space-x-3 text-blue-400">
              <i className="fas fa-circle-notch fa-spin"></i>
              <span className="text-sm font-bold uppercase tracking-wider">
                {uploadType === 'file' ? `Uploading File: ${uploadProgress}%` : 'Publishing to AS-Tube...'}
              </span>
            </div>
            {uploadType === 'file' && (
              <div className="w-full max-w-md bg-[#121212] rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-blue-600 h-full transition-all duration-300 ease-out" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
          </div>
        )}

        <div className="p-4 bg-[#252525] flex space-x-4 border-b border-[#303030]">
          <button 
            type="button"
            disabled={isPublishing}
            onClick={() => setUploadType('youtube')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center space-x-2 ${uploadType === 'youtube' ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'bg-[#121212] text-gray-400 border border-[#333]'}`}
          >
            <i className="fab fa-youtube text-lg"></i> 
            <span>YouTube Link</span>
          </button>
          <button 
            type="button"
            disabled={isPublishing}
            onClick={() => setUploadType('file')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center space-x-2 ${uploadType === 'file' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'bg-[#121212] text-gray-400 border border-[#333]'}`}
          >
            <i className="fas fa-file-video text-lg"></i> 
            <span>Local File</span>
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 p-6">
          <div className="flex flex-col space-y-4">
            {uploadType === 'youtube' ? (
              <div className="flex flex-col space-y-4">
                <label className="text-sm font-medium text-gray-400">YouTube Video URL</label>
                <input 
                  type="text"
                  disabled={isPublishing}
                  placeholder="Paste link: https://www.youtube.com/watch?v=..."
                  className="bg-[#121212] border border-[#333] rounded-xl px-4 py-3 text-sm focus:border-red-600 outline-none transition-all text-white disabled:opacity-50"
                  value={ytUrl}
                  onChange={(e) => setYtUrl(e.target.value)}
                />
                {ytId && (
                  <div className="aspect-video rounded-xl overflow-hidden border border-[#333] relative shadow-lg bg-black group">
                    <img 
                      src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} 
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" 
                      alt="Preview"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                       <i className="fab fa-youtube text-4xl text-red-600"></i>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={`aspect-video border-2 border-dashed border-[#444] rounded-xl flex flex-col items-center justify-center relative overflow-hidden bg-black/20 hover:border-blue-500 transition-colors`}>
                {videoPreview ? (
                  <div className="relative w-full h-full">
                    <video src={videoPreview} className="w-full h-full object-contain" />
                    <button 
                      type="button" 
                      onClick={() => { setFile(null); setVideoPreview(null); }}
                      className="absolute top-2 right-2 bg-black/60 hover:bg-red-600 p-2 rounded-full text-white transition-colors"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                ) : (
                  <>
                    <i className="fas fa-cloud-arrow-up text-4xl mb-4 text-[#717171]"></i>
                    <p className="text-sm text-gray-400 mb-2 px-6 text-center">Select a video file from your device</p>
                    <input type="file" disabled={isPublishing} accept="video/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <button type="button" className="bg-blue-600 px-6 py-2 rounded-lg text-sm font-bold shadow-lg shadow-blue-900/20">CHOOSE FILE</button>
                  </>
                )}
              </div>
            )}
            
            {uploadType === 'youtube' ? (
              <div className="flex space-x-2">
                <button 
                  type="button"
                  onClick={handleFetchMetadata}
                  disabled={!ytId || isFetchingMetadata || isPublishing}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center space-x-2 border transition-all ${
                    !ytId || isFetchingMetadata
                      ? 'border-[#333] text-gray-600 cursor-not-allowed bg-[#1a1a1a]' 
                      : 'border-indigo-500/30 bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white shadow-lg shadow-indigo-900/10'
                  }`}
                >
                  {isFetchingMetadata ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      <span>Fetching Data...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-wand-magic-sparkles"></i>
                      <span>Fetch YouTube Info</span>
                    </>
                  )}
                </button>
                
                {isFetchingMetadata && (
                  <button 
                    type="button"
                    onClick={handleCancelFetch}
                    className="px-4 py-3 rounded-xl text-sm font-bold bg-red-600/10 text-red-500 border border-red-500/30 hover:bg-red-600 hover:text-white transition-all"
                    title="Cancel Fetch"
                  >
                    <i className="fas fa-stop"></i>
                  </button>
                )}
              </div>
            ) : (
              <div className="flex space-x-2">
                <button 
                  type="button"
                  onClick={handleFetchMetadata}
                  disabled={(!file && !title) || isFetchingMetadata || isPublishing}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center space-x-2 border transition-all ${
                    (!file && !title) || isFetchingMetadata
                      ? 'border-[#333] text-gray-600 cursor-not-allowed bg-[#1a1a1a]' 
                      : 'border-indigo-500/30 bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white shadow-lg shadow-indigo-900/10'
                  }`}
                >
                  {isFetchingMetadata ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-wand-magic-sparkles"></i>
                      <span>AI Generate Details</span>
                    </>
                  )}
                </button>
              </div>
            )}

            <div className="p-4 bg-indigo-600/5 border border-indigo-500/10 rounded-xl text-[11px] text-indigo-300 leading-relaxed">
              <i className="fas fa-info-circle mr-2"></i>
              Use the AI button to automatically generate or fetch video titles and descriptions.
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <div className="space-y-4">
              <div className="relative">
                <input 
                  type="text" required placeholder="Video Title"
                  disabled={isPublishing}
                  className="w-full bg-[#121212] border border-[#333] rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none text-white disabled:opacity-50 transition-all"
                  value={title} onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <textarea 
                rows={4} placeholder="Description..."
                disabled={isPublishing}
                className="w-full bg-[#121212] border border-[#333] rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none resize-none text-white disabled:opacity-50 transition-all"
                value={description} onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <button 
              type="submit"
              disabled={isPublishing || isFetchingMetadata}
              className={`w-full py-4 rounded-xl font-bold mt-4 transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${uploadType === 'youtube' ? 'bg-red-600 hover:bg-red-700 shadow-red-900/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-900/20'}`}
            >
              {isPublishing ? (uploadType === 'file' ? 'UPLOADING...' : 'PUBLISHING...') : 'PUBLISH TO AS-TUBE'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;

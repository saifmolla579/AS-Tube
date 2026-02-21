
import React, { useState, useEffect } from 'react';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (pin: string) => void;
}

const PinModal: React.FC<PinModalProps> = ({ isOpen, onClose, onVerify }) => {
  const [pin, setPin] = useState('');

  // Clear pin on open/close
  useEffect(() => {
    if (!isOpen) setPin('');
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length > 0) {
      onVerify(pin);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md px-4 overflow-hidden">
      <div 
        className="bg-[#1e1e1e] w-full max-w-sm rounded-2xl shadow-2xl border border-[#333] p-6 animate-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mb-4">
            <i className="fas fa-lock text-red-500 text-2xl"></i>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Admin Access</h2>
          <p className="text-gray-400 text-sm mb-6">Enter your secret PIN to unlock upload features.</p>
          
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <input 
              type="password" 
              autoFocus
              placeholder="Enter PIN"
              className="w-full bg-[#121212] border border-[#333] rounded-xl px-4 py-3 text-center text-2xl tracking-widest text-white focus:border-red-600 outline-none transition-all"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
            <div className="flex space-x-3">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl font-bold text-gray-400 hover:bg-[#272727] transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-1 py-3 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/20 transition-all active:scale-95"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PinModal;

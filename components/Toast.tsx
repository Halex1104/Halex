import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react'; // Added X for close button

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); 

    return () => clearTimeout(timer);
  }, [onClose]);

  let bgColor = 'bg-green-500 dark:bg-green-600';
  let textColor = 'text-white';
  let Icon = CheckCircle;

  if (type === 'error') {
    bgColor = 'bg-red-500 dark:bg-red-600';
    Icon = XCircle;
  } else if (type === 'warning') {
    bgColor = 'bg-yellow-500 dark:bg-yellow-600';
    Icon = AlertTriangle;
  }

  return (
    <div 
      className={`fixed bottom-20 sm:bottom-6 right-6 ${bgColor} ${textColor} p-3 rounded-lg shadow-lg flex items-center z-[100] transition-all duration-300 ease-in-out animate-fadeInOutToast`}
      role="alert"
      aria-live="assertive"
    >
      <Icon size={20} className="mr-2 flex-shrink-0" />
      <span className="flex-grow text-sm">{message}</span>
      <button 
        onClick={onClose} 
        className="ml-3 p-1 rounded-full text-white/80 hover:text-white hover:bg-black/10 focus:outline-none focus:bg-black/20 transition-transform duration-100 active:scale-90" 
        aria-label="Close toast"
      >
        <X size={18} />
      </button>
    </div>
  );
};
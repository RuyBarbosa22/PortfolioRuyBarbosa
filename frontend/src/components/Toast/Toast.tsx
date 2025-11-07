import { useEffect, useState } from 'react';

type ToastProps = {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  duration?: number;
};

export default function Toast({ message, type, onClose, duration = 5000 }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Start exit animation before actual removal
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, duration - 300);

    // Remove component after exit animation
    const removeTimer = setTimeout(() => {
      onClose();
    }, duration);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [duration, onClose]);

  const bgColor = type === 'success' 
    ? 'bg-gradient-to-r from-green-600 to-green-700' 
    : 'bg-gradient-to-r from-red-600 to-red-700';

  const icon = type === 'success' ? '✅' : '❌';

  return (
    <div className={`fixed top-8 left-8 z-[9999] ${isExiting ? 'animate-slideOutToLeft' : 'animate-slideInFromLeft'}`}>
      <div 
        className={`${bgColor} text-white px-6 py-4 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-sm min-w-[300px] max-w-[400px]`}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <p className="font-semibold text-sm leading-relaxed">{message}</p>
        </div>
      </div>
    </div>
  );
}

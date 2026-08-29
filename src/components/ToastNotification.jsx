import React from 'react';

export default function ToastNotification({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="sorur-toast">
      <span className="material-symbols-outlined text-warning" style={{ fontSize: '20px' }}>info</span>
      <span className="small fw-semibold">{message}</span>
      <button 
        onClick={onClose}
        className="text-white border-0 bg-transparent p-0 ms-2 opacity-75 hover:opacity-100"
        aria-label="إغلاق"
      >
        ✕
      </button>
    </div>
  );
}

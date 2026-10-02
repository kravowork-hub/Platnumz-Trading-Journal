import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Maximize2 } from 'lucide-react';

interface ImageViewerModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  caption?: string;
  onClose: () => void;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  isOpen,
  imageUrl,
  caption,
  onClose,
}) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  const zoomIn = () => setScale(prev => Math.min(3, prev + 0.3));
  const zoomOut = () => setScale(prev => Math.max(0.6, prev - 0.3));
  const rotate = () => setRotation(prev => (prev + 90) % 360);
  const reset = () => {
    setScale(1);
    setRotation(0);
  };

  if (!isOpen || !imageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 backdrop-blur-xl p-4 text-white select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between z-10">
        <div>
          <span className="text-[10px] font-mono text-emerald-400 uppercase">Interactive Chart Viewer</span>
          {caption && <h3 className="text-xs font-semibold text-gray-200">{caption}</h3>}
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-full bg-[#1A2234] hover:bg-[#283552] text-gray-300 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Image Pan & Zoom Container */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden my-4">
        <img
          src={imageUrl}
          alt="Chart Attachment"
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg)`,
            transition: 'transform 0.15s ease-out',
          }}
          className="max-w-full max-h-full object-contain cursor-grab active:cursor-grabbing shadow-2xl rounded-lg"
        />
      </div>

      {/* Floating Bottom Toolbar */}
      <div className="flex items-center justify-center gap-3 z-10 pb-safe">
        <div className="bg-[#121622]/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-[#20273A] flex items-center gap-4 shadow-xl">
          <button
            onClick={zoomOut}
            className="p-2 rounded-xl hover:bg-[#1C2336] text-gray-300 hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          
          <span className="text-xs font-mono text-emerald-400 w-12 text-center">
            {Math.round(scale * 100)}%
          </span>

          <button
            onClick={zoomIn}
            className="p-2 rounded-xl hover:bg-[#1C2336] text-gray-300 hover:text-white"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={rotate}
            className="p-2 rounded-xl hover:bg-[#1C2336] text-gray-300 hover:text-white"
            title="Rotate 90°"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            onClick={reset}
            className="text-[10px] font-mono text-gray-400 hover:text-white px-2 py-1 bg-[#1C2336] rounded-lg"
          >
            Reset
          </button>
        </div>
      </div>

    </div>
  );
};

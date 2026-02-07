// ============================================
// THE VIDEO POOL - IMAGE UPLOADER
// Custom image upload with position/opacity controls
// Allows users to replace card backgrounds
// ============================================

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Move, Droplets, Loader2, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  onImageChange: (image: string | null) => void;
  onPositionChange?: (position: { x: number; y: number }) => void;
  onOpacityChange?: (opacity: number) => void;
  onBlurChange?: (blur: number) => void;
  currentImage?: string | null;
  currentPosition?: { x: number; y: number };
  currentOpacity?: number;
  currentBlur?: number;
  accentColor?: string;
  className?: string;
}

export default function ImageUploader({
  onImageChange,
  onPositionChange,
  onOpacityChange,
  onBlurChange,
  currentImage,
  currentPosition = { x: 50, y: 50 },
  currentOpacity = 0.3,
  currentBlur = 0,
  accentColor = '#00d4ff',
  className,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Max file size: 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onImageChange(result);
      setIsLoading(false);
    };
    reader.onerror = () => {
      alert('Failed to read image file');
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  }, [onImageChange]);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  // Handle file input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  // Clear image
  const handleClearImage = useCallback(() => {
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onImageChange]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      <div
        onClick={() => !isLoading && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all',
          isDragging
            ? 'border-solid bg-opacity-20'
            : 'border-white/20 hover:border-white/40',
          isLoading && 'pointer-events-none opacity-50'
        )}
        style={{
          borderColor: isDragging ? accentColor : undefined,
          backgroundColor: isDragging ? `${accentColor}10` : undefined,
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />

        {isLoading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: accentColor }} />
            <span className="text-sm text-white/50">Processing image...</span>
          </div>
        ) : currentImage ? (
          <div className="relative">
            <img
              src={currentImage}
              alt="Custom background"
              className="w-full h-32 object-cover rounded-lg"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClearImage();
              }}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-red-500/80 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
            <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/60 text-xs text-white/70">
              Click to replace
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: `${accentColor}20` }}
            >
              <Upload className="w-6 h-6" style={{ color: accentColor }} />
            </div>
            <div>
              <p className="text-sm font-medium text-white/80">
                Drop your image here
              </p>
              <p className="text-xs text-white/50 mt-1">
                or click to browse • PNG, JPG up to 5MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Controls (only show when image is present) */}
      {currentImage && (
        <div className="space-y-3 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
          {/* Opacity Control */}
          {onOpacityChange && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-white/70">
                  <Droplets className="w-3.5 h-3.5" />
                  Opacity
                </div>
                <span className="text-xs font-mono" style={{ color: accentColor }}>
                  {Math.round(currentOpacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={currentOpacity * 100}
                onChange={(e) => onOpacityChange(parseInt(e.target.value) / 100)}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${accentColor} 0%, ${accentColor} ${currentOpacity * 100}%, rgba(255,255,255,0.2) ${currentOpacity * 100}%, rgba(255,255,255,0.2) 100%)`,
                }}
              />
            </div>
          )}

          {/* Blur Control */}
          {onBlurChange && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-white/70">
                  <ImageIcon className="w-3.5 h-3.5" />
                  Blur
                </div>
                <span className="text-xs font-mono" style={{ color: accentColor }}>
                  {currentBlur}px
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                value={currentBlur}
                onChange={(e) => onBlurChange(parseInt(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${accentColor} 0%, ${accentColor} ${(currentBlur / 20) * 100}%, rgba(255,255,255,0.2) ${(currentBlur / 20) * 100}%, rgba(255,255,255,0.2) 100%)`,
                }}
              />
            </div>
          )}

          {/* Position Control */}
          {onPositionChange && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-white/70">
                <Move className="w-3.5 h-3.5" />
                Position
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { x: 0, y: 0, label: '↖' },
                  { x: 50, y: 0, label: '↑' },
                  { x: 100, y: 0, label: '↗' },
                  { x: 0, y: 50, label: '←' },
                  { x: 50, y: 50, label: '●' },
                  { x: 100, y: 50, label: '→' },
                  { x: 0, y: 100, label: '↙' },
                  { x: 50, y: 100, label: '↓' },
                  { x: 100, y: 100, label: '↘' },
                ].map((pos) => (
                  <button
                    key={`${pos.x}-${pos.y}`}
                    onClick={() => onPositionChange({ x: pos.x, y: pos.y })}
                    className={cn(
                      'p-2 rounded-lg text-sm transition-all',
                      currentPosition.x === pos.x && currentPosition.y === pos.y
                        ? 'text-black'
                        : 'text-white/50 hover:text-white/80 bg-white/5 hover:bg-white/10'
                    )}
                    style={
                      currentPosition.x === pos.x && currentPosition.y === pos.y
                        ? { background: accentColor }
                        : undefined
                    }
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preset Images */}
      <div className="space-y-2">
        <div className="text-xs text-white/50">Or choose a preset:</div>
        <div className="grid grid-cols-4 gap-2">
          {[
            'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=200&h=200&fit=crop', // DJ booth
            'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop', // Concert crowd
            'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&h=200&fit=crop', // Club lights
            'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop', // DJ hands
          ].map((url, i) => (
            <button
              key={i}
              onClick={() => onImageChange(url)}
              className={cn(
                'aspect-square rounded-lg overflow-hidden border-2 transition-all',
                currentImage === url ? 'border-2' : 'border-transparent hover:border-white/30'
              )}
              style={currentImage === url ? { borderColor: accentColor } : undefined}
            >
              <img src={url} alt={`Preset ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

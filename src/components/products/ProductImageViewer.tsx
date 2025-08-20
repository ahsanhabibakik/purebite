"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize,
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Download,
  Share2,
  Heart,
  Camera,
  Move3D,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { FloatingActionButton } from "@/components/animations/InteractiveAnimations";

interface ProductImage {
  id: string;
  url: string;
  alt: string;
  type: "image" | "360";
  is360?: boolean;
  frames?: string[];
}

interface ProductImageViewerProps {
  images: ProductImage[];
  initialIndex?: number;
  onImageChange?: (index: number) => void;
  onZoomChange?: (zoom: number) => void;
  className?: string;
}

export function ProductImageViewer({
  images,
  initialIndex = 0,
  onImageChange,
  onZoomChange,
  className = "",
}: ProductImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [is360Mode, setIs360Mode] = useState(false);
  const [rotation360, setRotation360] = useState(0);
  const [isPlaying360, setIsPlaying360] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const animationRef = useRef<number>();

  const currentImage = images[currentIndex];
  const is360Image = currentImage?.is360 || currentImage?.type === "360";

  // Auto-play 360 rotation
  useEffect(() => {
    if (isPlaying360 && is360Image) {
      const animate = () => {
        setRotation360(prev => (prev + 2) % 360);
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying360, is360Image]);

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % images.length;
    setCurrentIndex(nextIndex);
    onImageChange?.(nextIndex);
    resetZoom();
  };

  const handlePrevious = () => {
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    setCurrentIndex(prevIndex);
    onImageChange?.(prevIndex);
    resetZoom();
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(zoom + 0.5, 4);
    setZoom(newZoom);
    onZoomChange?.(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom - 0.5, 0.5);
    setZoom(newZoom);
    onZoomChange?.(newZoom);
    
    if (newZoom === 1) {
      setPosition({ x: 0, y: 0 });
    }
  };

  const resetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    onZoomChange?.(1);
  };

  const handlePan = (event: any, info: PanInfo) => {
    if (zoom > 1) {
      setPosition({
        x: position.x + info.delta.x,
        y: position.y + info.delta.y,
      });
    }
  };

  const handle360Drag = (event: any, info: PanInfo) => {
    if (is360Image) {
      const sensitivity = 0.5;
      const deltaRotation = info.delta.x * sensitivity;
      setRotation360(prev => (prev + deltaRotation) % 360);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const toggle360Play = () => {
    setIsPlaying360(!isPlaying360);
  };

  const get360Frame = () => {
    if (!is360Image || !currentImage.frames) return currentImage.url;
    
    const frameIndex = Math.floor((rotation360 / 360) * currentImage.frames.length);
    return currentImage.frames[frameIndex] || currentImage.url;
  };

  const ImageDisplay = ({ isFullscreenMode = false }) => (
    <div className={`relative bg-white dark:bg-gray-900 rounded-lg overflow-hidden ${
      isFullscreenMode ? 'h-full w-full' : 'aspect-square'
    }`}>
      {/* Main Image Container */}
      <motion.div
        ref={containerRef}
        className="relative h-full w-full overflow-hidden cursor-grab active:cursor-grabbing"
        onDoubleClick={() => zoom === 1 ? handleZoomIn() : resetZoom()}
      >
        <motion.img
          ref={imageRef}
          src={is360Image ? get360Frame() : currentImage?.url}
          alt={currentImage?.alt || "Product image"}
          className="h-full w-full object-contain select-none"
          drag={zoom > 1 || is360Image}
          dragConstraints={containerRef}
          onDrag={is360Image ? handle360Drag : handlePan}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setIsDragging(false)}
          animate={{
            scale: zoom,
            x: zoom > 1 ? position.x : 0,
            y: zoom > 1 ? position.y : 0,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{
            transform: is360Image ? `rotate(${rotation360}deg)` : undefined,
          }}
        />

        {/* Zoom Indicator */}
        {zoom > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-4 left-4 bg-black/70 text-white px-2 py-1 rounded-md text-sm"
          >
            {Math.round(zoom * 100)}%
          </motion.div>
        )}

        {/* 360 Indicator */}
        {is360Image && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-4 right-4"
          >
            <Badge className="bg-blue-600 text-white flex items-center gap-1">
              <Move3D className="h-3 w-3" />
              360°
            </Badge>
          </motion.div>
        )}

        {/* Loading State for 360 */}
        {is360Image && isDragging && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-white border-t-transparent rounded-full"
            />
          </div>
        )}
      </motion.div>

      {/* Navigation Arrows */}
      {images.length > 1 && !isFullscreenMode && (
        <>
          <Button
            variant="secondary"
            size="sm"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-md z-10"
            onClick={handlePrevious}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-md z-10"
            onClick={handleNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Control Panel */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/70 backdrop-blur-sm rounded-full px-4 py-2">
        {/* Zoom Controls */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleZoomOut}
          disabled={zoom <= 0.5}
          className="text-white hover:bg-white/20 p-1 h-8 w-8"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        
        <div className="w-20 px-2">
          <Slider
            value={[zoom]}
            onValueChange={([value]) => {
              setZoom(value);
              onZoomChange?.(value);
            }}
            min={0.5}
            max={4}
            step={0.1}
            className="w-full"
          />
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleZoomIn}
          disabled={zoom >= 4}
          className="text-white hover:bg-white/20 p-1 h-8 w-8"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>

        {/* 360 Controls */}
        {is360Image && (
          <>
            <div className="w-px h-6 bg-white/30 mx-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={toggle360Play}
              className="text-white hover:bg-white/20 p-1 h-8 w-8"
            >
              {isPlaying360 ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          </>
        )}

        {/* Fullscreen */}
        <div className="w-px h-6 bg-white/30 mx-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleFullscreen}
          className="text-white hover:bg-white/20 p-1 h-8 w-8"
        >
          <Maximize className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <div className={`space-y-4 ${className}`}>
        {/* Main Image Display */}
        <ImageDisplay />

        {/* Thumbnail Navigation */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <motion.button
                key={image.id}
                className={`
                  relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all
                  ${currentIndex === index 
                    ? 'border-green-500 ring-2 ring-green-200' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
                onClick={() => {
                  setCurrentIndex(index);
                  onImageChange?.(index);
                  resetZoom();
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                />
                {image.is360 && (
                  <div className="absolute top-1 right-1">
                    <Badge className="bg-blue-600 text-white text-xs p-0.5">
                      360°
                    </Badge>
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        )}

        {/* Image Info */}
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>
            {currentIndex + 1} / {images.length}
          </span>
          {is360Image && (
            <span className="flex items-center gap-1">
              <Move3D className="h-4 w-4" />
              ড্র্যাগ করে ঘুরান বা প্লে বাটনে ক্লিক করুন
            </span>
          )}
        </div>
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            className="fixed inset-0 z-50 bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="relative h-full w-full">
              <ImageDisplay isFullscreenMode />
              
              {/* Fullscreen Controls */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-black/50 hover:bg-black/70 text-white border-white/20"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-black/50 hover:bg-black/70 text-white border-white/20"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="bg-black/50 hover:bg-black/70 text-white border-white/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Fullscreen Navigation */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/70 rounded-full px-4 py-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrevious}
                    className="text-white hover:bg-white/20"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <span className="text-white text-sm px-2">
                    {currentIndex + 1} / {images.length}
                  </span>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNext}
                    className="text-white hover:bg-white/20"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Quick Preview Component for Product Cards
export function QuickImagePreview({
  images,
  trigger,
}: {
  images: ProductImage[];
  trigger: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="relative max-w-2xl max-h-[90vh] w-full mx-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ProductImageViewer
                images={images}
                className="bg-white dark:bg-gray-900 rounded-lg p-4"
              />
              
              <Button
                variant="secondary"
                size="sm"
                className="absolute -top-2 -right-2 bg-white hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
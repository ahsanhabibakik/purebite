"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { X, Loader2, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  value?: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  folder?: string;
  className?: string;
  disabled?: boolean;
}

interface UploadedImage {
  url: string;
  publicId: string;
  isUploading?: boolean;
}

export function ImageUpload({
  value = [],
  onChange,
  maxImages = 5,
  folder = "products",
  className = "",
  disabled = false
}: ImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>(
    value.map(url => ({ url, publicId: "" }))
  );
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = async (file: File): Promise<UploadedImage> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    const result = await response.json();
    return {
      url: result.data.url,
      publicId: result.data.public_id,
    };
  };

  const handleFileSelect = async (files: FileList) => {
    if (disabled) return;

    const fileArray = Array.from(files);
    const remainingSlots = maxImages - images.length;
    const filesToUpload = fileArray.slice(0, remainingSlots);

    // Add uploading placeholders
    const uploadingImages = filesToUpload.map((file, index) => ({
      url: URL.createObjectURL(file),
      publicId: `uploading-${Date.now()}-${index}`,
      isUploading: true,
    }));

    const newImages = [...images, ...uploadingImages];
    setImages(newImages);

    // Upload files
    try {
      const uploadPromises = filesToUpload.map(async (file, index) => {
        try {
          const uploadedImage = await uploadImage(file);
          
          // Update the placeholder with actual uploaded image
          setImages(prevImages => 
            prevImages.map(img => 
              img.publicId === `uploading-${Date.now()}-${index}`
                ? { ...uploadedImage, isUploading: false }
                : img
            )
          );

          return uploadedImage.url;
        } catch (error) {
          console.error('Upload failed:', error);
          
          // Remove failed upload placeholder
          setImages(prevImages => 
            prevImages.filter(img => img.publicId !== `uploading-${Date.now()}-${index}`)
          );
          
          return null;
        }
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const successfulUrls = uploadedUrls.filter(Boolean) as string[];
      
      // Update parent component
      const allUrls = [...value, ...successfulUrls];
      onChange(allUrls);

    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const removeImage = async (index: number) => {
    if (disabled) return;

    const imageToRemove = images[index];
    
    // Remove from UI immediately
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    
    // Update parent component
    const newUrls = newImages.map(img => img.url);
    onChange(newUrls);

    // Delete from Cloudinary if it has a publicId
    if (imageToRemove.publicId && !imageToRemove.publicId.startsWith('uploading-')) {
      try {
        await fetch(`/api/upload?public_id=${imageToRemove.publicId}`, {
          method: 'DELETE',
        });
      } catch (error) {
        console.error('Failed to delete image:', error);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (!disabled && e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const canAddMore = images.length < maxImages;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      {canAddMore && (
        <div
          className={`
            border-2 border-dashed rounded-lg p-6 text-center transition-colors
            ${isDragging ? 'border-green-500 bg-green-50' : 'border-gray-300'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-green-400 hover:bg-gray-50 cursor-pointer'}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center space-y-2">
            <Camera className="h-8 w-8 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, WebP up to 5MB ({images.length}/{maxImages} images)
              </p>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
            className="hidden"
            disabled={disabled}
          />
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={image.publicId || index} className="relative group">
              <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
                {image.isUploading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <Image
                    src={image.url}
                    alt={`Upload ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                )}
                
                {!image.isUploading && !disabled && (
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(index);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
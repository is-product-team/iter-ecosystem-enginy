'use client';

import React, { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import getApi from '@/services/api';
import { toast } from 'sonner';

interface AvatarProps {
  url?: string | null;
  name: string;
  id?: string | number;
  type?: 'student' | 'user' | 'center';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  isCoordinator?: boolean;
  email?: string | null;
  onUpload?: (newUrl: string) => void;
  editable?: boolean;
}

export default function Avatar({ 
  url, 
  name, 
  id, 
  type = 'user', 
  size = 'md', 
  className = '', 
  isCoordinator, 
  email,
  onUpload,
  editable = false
}: AvatarProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[8px]',
    sm: 'w-8 h-8 text-[10px]',
    md: 'w-10 h-10 text-xs',
    lg: 'w-14 h-14 text-sm',
    xl: 'w-24 h-24 text-base'
  };

  const currentSize = sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.md;
  
  const fullUrl = url ? `${process.env.NEXT_PUBLIC_API_URL}${url}` : null;
  const isAdmin = email === 'admin@admin.com';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const api = getApi();
      const response = await api.post(`/upload/profile/${type}/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.success) {
        toast.success('Foto actualizada');
        if (onUpload) onUpload(response.data.photoUrl);
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  const showPhoto = fullUrl && !isAdmin;
  const isInteractive = editable && !!id;

  return (
    <div className={`relative shrink-0 group ${isInteractive ? 'cursor-pointer' : ''}`}>
      <div 
        className={`relative overflow-hidden bg-background-subtle text-text-primary flex items-center justify-center font-medium rounded-full ${currentSize} ${className} ${isInteractive ? 'group-hover:opacity-80 transition-all border-2 border-transparent group-hover:border-consorci-darkBlue' : ''}`}
        onClick={() => isInteractive && !uploading && fileInputRef.current?.click()}
      >
        {uploading ? (
          <Loader2 className="w-1/2 h-1/2 animate-spin text-consorci-darkBlue" />
        ) : showPhoto ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img 
            src={fullUrl!} 
            alt={name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : isCoordinator ? (
          <div className="flex flex-col items-center justify-center w-full h-full bg-background-subtle text-text-primary">
            <svg className="w-1/2 h-1/2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full bg-background-subtle text-text-primary">
            <svg className="w-1/2 h-1/2 opacity-40" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
        )}

        {isInteractive && !uploading && (
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Camera className="text-white w-1/3 h-1/3" />
          </div>
        )}
      </div>

      {isInteractive && (
        <>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*" 
          />
          <div 
            className="absolute -bottom-1 -right-1 bg-consorci-darkBlue text-white p-1.5 rounded-full shadow-lg border-2 border-background-surface z-10"
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            <Camera size={12} />
          </div>
        </>
      )}
    </div>
  );
}

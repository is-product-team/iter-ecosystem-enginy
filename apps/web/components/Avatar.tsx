'use client';

interface AvatarProps {
  url?: string | null;
  name: string;
  id?: string | number;
  type?: 'student' | 'user';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  isCoordinator?: boolean;
  email?: string | null;
}

export default function Avatar({ url, name, id, type, size = 'md', className = '', isCoordinator, email }: AvatarProps) {
  const sizeClasses = {
    xs: 'w-6 h-6 text-[8px]',
    sm: 'w-8 h-8 text-[10px]',
    md: 'w-10 h-10 text-xs',
    lg: 'w-14 h-14 text-sm',
    xl: 'w-20 h-20 text-base'
  };

  const currentSize = sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.md;
  
  const fullUrl = url ? `${process.env.NEXT_PUBLIC_API_URL}${url}` : null;
  const isAdmin = email === 'admin@admin.com';

  // We should NOT show a photo if it's the admin or if we don't have a URL
  const showPhoto = fullUrl && !isAdmin;

  return (
    <div className={`relative shrink-0 overflow-hidden bg-background-subtle text-text-primary flex items-center justify-center font-medium ${currentSize} ${className}`}>
      {showPhoto ? (
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
          <svg className="w-1/2 h-1/2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );

}

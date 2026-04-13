import Loading from '@/components/Loading';

/**
 * Global Loading fallback for the [locale] segment.
 * This component is automatically shown by Next.js during route transitions
 * and when server components are performing data fetching.
 */
export default function GlobalLoading() {
  return (
    <>
      {/* Top progress bar for immediate feedback */}
      <div className="fixed top-0 left-0 right-0 z-[10000] h-[2px]">
        <div className="h-full bg-consorci-lightBlue animate-progress" />
      </div>
      
      <Loading 
        fullScreen 
        message="Loading platform..." 
      />
    </>
  );
}

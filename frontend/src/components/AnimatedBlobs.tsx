import { useMemo } from 'react';

interface AnimatedBlobsProps {
  variant?: 'default' | 'minimal';
  className?: string;
}

export function AnimatedBlobs({ variant = 'default', className = '' }: AnimatedBlobsProps) {
  // Memoize dark mode detection to avoid re-reading DOM on every render
  const isDark = useMemo(() => {
    if (typeof document === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
  }, []);

  // Blob configuration - memoized to prevent recreation on every render
  const blobs = useMemo(() => [
    { id: 'blob-1', color: isDark ? 'linear-gradient(135deg, rgba(251, 146, 60, 0.3), rgba(234, 88, 12, 0.2))' : 'linear-gradient(135deg, rgba(251, 146, 60, 0.25), rgba(234, 88, 12, 0.15))', size: 'w-72 h-72', duration: 15, delay: 0, startX: -200, startY: -100, endX: 150, endY: 200 },
    { id: 'blob-2', color: isDark ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.25), rgba(251, 146, 60, 0.2))' : 'linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(251, 146, 60, 0.15))', size: 'w-80 h-80', duration: 18, delay: 2, startX: 400, startY: -50, endX: 200, endY: 250 },
    { id: 'blob-3', color: isDark ? 'linear-gradient(135deg, rgba(244, 63, 94, 0.2), rgba(249, 115, 22, 0.15))' : 'linear-gradient(135deg, rgba(244, 63, 94, 0.15), rgba(249, 115, 22, 0.1))', size: 'w-64 h-64', duration: 20, delay: 4, startX: -150, startY: 400, endX: 200, endY: -100 },
    { id: 'blob-4', color: isDark ? 'linear-gradient(135deg, rgba(251, 146, 60, 0.28), rgba(249, 115, 22, 0.18))' : 'linear-gradient(135deg, rgba(251, 146, 60, 0.22), rgba(249, 115, 22, 0.12))', size: 'w-96 h-96', duration: 22, delay: 1, startX: 500, startY: 350, endX: -150, endY: -200 },
    { id: 'blob-5', color: isDark ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.26), rgba(234, 88, 12, 0.17))' : 'linear-gradient(135deg, rgba(249, 115, 22, 0.19), rgba(234, 88, 12, 0.11))', size: 'w-80 h-80', duration: 19, delay: 3, startX: -100, startY: 800, endX: 250, endY: -150 },
    { id: 'blob-6', color: isDark ? 'linear-gradient(135deg, rgba(234, 88, 12, 0.24), rgba(251, 146, 60, 0.19))' : 'linear-gradient(135deg, rgba(234, 88, 12, 0.18), rgba(251, 146, 60, 0.13))', size: 'w-72 h-72', duration: 21, delay: 5, startX: 450, startY: 750, endX: -200, endY: -100 },
    { id: 'blob-7', color: isDark ? 'linear-gradient(135deg, rgba(244, 63, 94, 0.22), rgba(251, 146, 60, 0.16))' : 'linear-gradient(135deg, rgba(244, 63, 94, 0.16), rgba(251, 146, 60, 0.11))', size: 'w-96 h-96', duration: 25, delay: 6, startX: 150, startY: 450, endX: -200, endY: 200 },
    { id: 'blob-8', color: isDark ? 'linear-gradient(135deg, rgba(251, 146, 60, 0.32), rgba(249, 115, 22, 0.22))' : 'linear-gradient(135deg, rgba(251, 146, 60, 0.28), rgba(249, 115, 22, 0.18))', size: 'w-96 h-96', duration: 23, delay: 2, startX: 600, startY: 600, endX: 200, endY: 400 },
  ], [isDark]);

  // Create CSS keyframe animations dynamically
  const keyframes = useMemo(() => {
    const styles: { [key: string]: string } = {};
    blobs.forEach((blob) => {
      const keyframeName = `blob-${blob.id}`;
      styles[keyframeName] = `@keyframes ${keyframeName} { 0% { transform: translate(${blob.startX}px, ${blob.startY}px); } 50% { transform: translate(${blob.endX}px, ${blob.endY}px); } 100% { transform: translate(${blob.startX}px, ${blob.startY}px); } }`;
    });
    return styles;
  }, [blobs]);

  // Inject CSS keyframes into document head
  useMemo(() => {
    if (typeof document === 'undefined') return;
    let styleEl = document.getElementById('blob-animations');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'blob-animations';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = Object.values(keyframes).join('\n');
  }, [keyframes]);

  const blobsToRender = variant === 'minimal' ? [blobs[0], blobs[1], blobs[3], blobs[7]] : blobs;

  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none ${className}`}>
      {blobsToRender.map((blob) => (
        <div
          key={blob.id}
          className={`absolute rounded-full blur-3xl ${blob.size}`}
          style={{
            background: blob.color,
            filter: 'blur(40px)',
            animation: `blob-${blob.id} ${blob.duration}s ease-in-out ${blob.delay}s infinite`,
            willChange: 'transform',
            backfaceVisibility: 'hidden',
          }}
        />
      ))}
    </div>
  );
}

export default AnimatedBlobs;

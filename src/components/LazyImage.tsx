import { useState, useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Image as ImageIcon } from 'lucide-react';

interface LazyImageProps {
  src: string;
  webpSrc?: string;
  srcSet?: string;
  webpSrcSet?: string;
  sizes?: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
  onError?: () => void;
  priority?: boolean;
  width?: number;
  height?: number;
}

export const LazyImage = ({ 
  src,
  webpSrc,
  srcSet,
  webpSrcSet,
  sizes,
  alt, 
  className = '', 
  placeholderClassName = '',
  onError,
  priority = false,
  width,
  height
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.01
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  useEffect(() => {
    console.log('LazyImage Debug:', { src, isInView, isLoaded, hasError, priority });
  }, [src, isInView, isLoaded, hasError, priority]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div ref={imgRef} className={`relative ${placeholderClassName}`} style={{ minHeight: '100px' }}>
      {!isLoaded && !hasError && (
        <Skeleton className={`absolute inset-0 ${className}`} />
      )}

      {hasError && (
        <div className={`absolute inset-0 flex items-center justify-center bg-muted ${className}`}>
          <ImageIcon className="h-12 w-12 text-muted-foreground" />
        </div>
      )}

      {isInView && (
        <>
          {webpSrc || webpSrcSet ? (
            <picture>
              {webpSrcSet && (
                <source 
                  srcSet={webpSrcSet}
                  type="image/webp"
                  sizes={sizes}
                />
              )}
              {webpSrc && (
                <source 
                  src={webpSrc}
                  type="image/webp"
                />
              )}
              {srcSet && (
                <source 
                  srcSet={srcSet}
                  sizes={sizes}
                />
              )}
              <img
                src={src}
                alt={alt}
                loading={priority ? 'eager' : 'lazy'}
                decoding="async"
                width={width}
                height={height}
                className={`${className} transition-opacity duration-300 ${
                  isLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={handleLoad}
                onError={handleError}
                style={{ display: 'block' }}
              />
            </picture>
          ) : (
            <img
              src={src}
              alt={alt}
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
              width={width}
              height={height}
              srcSet={srcSet}
              sizes={sizes}
              className={`${className} transition-opacity duration-300 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={handleLoad}
              onError={handleError}
              style={{ display: 'block' }}
            />
          )}
        </>
      )}
    </div>
  );
};

'use client';

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import Image from 'next/image';
import { useGalleryPerformance } from '@/hooks/useGalleryPerformance';

// Image dimensions for better layout stability
interface GalleryImage {
  src: string;
  alt: string;
  height: number;
  aspectRatio: number;
}

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [isMarqueePaused, setIsMarqueePaused] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const { trackImageLoadStart, trackImageLoadComplete } =
    useGalleryPerformance();

  // Optimized gallery images with proper dimensions
  const images: GalleryImage[] = useMemo(
    () => [
      {
        src: '/Dhack Images/1.jpeg',
        alt: 'DhACK Event Image 1',
        height: 384,
        aspectRatio: 4 / 3,
      },
      {
        src: '/Dhack Images/2.jpeg',
        alt: 'DhACK Event Image 2',
        height: 256,
        aspectRatio: 16 / 9,
      },
      {
        src: '/Dhack Images/3.jpeg',
        alt: 'DhACK Event Image 3',
        height: 320,
        aspectRatio: 3 / 4,
      },
      {
        src: '/Dhack Images/4.jpeg',
        alt: 'DhACK Event Image 4',
        height: 288,
        aspectRatio: 4 / 3,
      },
      {
        src: '/Dhack Images/5.jpeg',
        alt: 'DhACK Event Image 5',
        height: 448,
        aspectRatio: 2 / 3,
      },
      {
        src: '/Dhack Images/6.jpeg',
        alt: 'DhACK Event Image 6',
        height: 224,
        aspectRatio: 16 / 9,
      },
      {
        src: '/Dhack Images/7.jpeg',
        alt: 'DhACK Event Image 7',
        height: 304,
        aspectRatio: 4 / 3,
      },
      {
        src: '/Dhack Images/8.jpeg',
        alt: 'DhACK Event Image 8',
        height: 352,
        aspectRatio: 3 / 4,
      },
      {
        src: '/Dhack Images/9.jpeg',
        alt: 'DhACK Event Image 9',
        height: 384,
        aspectRatio: 4 / 3,
      },
      {
        src: '/Dhack Images/10.jpeg',
        alt: 'DhACK Event Image 10',
        height: 256,
        aspectRatio: 16 / 9,
      },
      {
        src: '/Dhack Images/11.jpeg',
        alt: 'DhACK Event Image 11',
        height: 320,
        aspectRatio: 3 / 4,
      },
      {
        src: '/Dhack Images/12.jpeg',
        alt: 'DhACK Event Image 12',
        height: 288,
        aspectRatio: 4 / 3,
      },
      {
        src: '/Dhack Images/13.jpeg',
        alt: 'DhACK Event Image 13',
        height: 448,
        aspectRatio: 2 / 3,
      },
      {
        src: '/Dhack Images/14.jpeg',
        alt: 'DhACK Event Image 14',
        height: 224,
        aspectRatio: 16 / 9,
      },
      {
        src: '/Dhack Images/15.jpeg',
        alt: 'DhACK Event Image 15',
        height: 304,
        aspectRatio: 4 / 3,
      },
      {
        src: '/Dhack Images/16.jpeg',
        alt: 'DhACK Event Image 16',
        height: 352,
        aspectRatio: 3 / 4,
      },
      {
        src: '/Dhack Images/17.jpeg',
        alt: 'DhACK Event Image 17',
        height: 384,
        aspectRatio: 4 / 3,
      },
      {
        src: '/Dhack Images/18.jpeg',
        alt: 'DhACK Event Image 18',
        height: 256,
        aspectRatio: 16 / 9,
      },
      {
        src: '/Dhack Images/19.jpeg',
        alt: 'DhACK Event Image 19',
        height: 320,
        aspectRatio: 3 / 4,
      },
      {
        src: '/Dhack Images/20.jpeg',
        alt: 'DhACK Event Image 20',
        height: 288,
        aspectRatio: 4 / 3,
      },
      {
        src: '/Dhack Images/21.jpeg',
        alt: 'DhACK Event Image 21',
        height: 448,
        aspectRatio: 2 / 3,
      },
      {
        src: '/Dhack Images/22.jpeg',
        alt: 'DhACK Event Image 22',
        height: 224,
        aspectRatio: 16 / 9,
      },
      {
        src: '/Dhack Images/23.jpeg',
        alt: 'DhACK Event Image 23',
        height: 304,
        aspectRatio: 4 / 3,
      },
      {
        src: '/Dhack Images/24.jpeg',
        alt: 'DhACK Event Image 24',
        height: 352,
        aspectRatio: 3 / 4,
      },
      {
        src: '/Dhack Images/25.jpeg',
        alt: 'DhACK Event Image 25',
        height: 384,
        aspectRatio: 4 / 3,
      },
      {
        src: '/Dhack Images/26.jpeg',
        alt: 'DhACK Event Image 26',
        height: 256,
        aspectRatio: 16 / 9,
      },
      {
        src: '/Dhack Images/27.jpeg',
        alt: 'DhACK Event Image 27',
        height: 320,
        aspectRatio: 3 / 4,
      },
      {
        src: '/Dhack Images/28.jpeg',
        alt: 'DhACK Event Image 28',
        height: 288,
        aspectRatio: 4 / 3,
      },
      {
        src: '/Dhack Images/29.jpeg',
        alt: 'DhACK Event Image 29',
        height: 448,
        aspectRatio: 2 / 3,
      },
      {
        src: '/Dhack Images/30.jpeg',
        alt: 'DhACK Event Image 30',
        height: 224,
        aspectRatio: 16 / 9,
      },
      {
        src: '/Dhack Images/31.jpeg',
        alt: 'DhACK Event Image 31',
        height: 304,
        aspectRatio: 4 / 3,
      },
      {
        src: '/Dhack Images/32.jpeg',
        alt: 'DhACK Event Image 32',
        height: 352,
        aspectRatio: 3 / 4,
      },
      {
        src: '/Dhack Images/33.jpeg',
        alt: 'DhACK Event Image 33',
        height: 384,
        aspectRatio: 4 / 3,
      },
      {
        src: '/Dhack Images/34.jpeg',
        alt: 'DhACK Event Image 34',
        height: 256,
        aspectRatio: 16 / 9,
      },
    ],
    []
  );

  // Intersection Observer for performance optimization
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '100px 0px',
      }
    );

    if (galleryRef.current) {
      observer.observe(galleryRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Preload critical images
  useEffect(() => {
    if (isIntersecting) {
      const priorityImages = images.slice(0, 8);
      priorityImages.forEach(img => {
        trackImageLoadStart(img.src);
        const image = document.createElement('img');
        image.src = img.src;
        image.onload = () => {
          trackImageLoadComplete(img.src);
          setLoadedImages(prev => new Set(Array.from(prev).concat(img.src)));
        };
        image.onerror = () => {
          console.warn(`Failed to load image: ${img.src}`);
        };
      });
    }
  }, [isIntersecting, images, trackImageLoadStart, trackImageLoadComplete]);

  // JavaScript-based marquee animation for better performance
  useEffect(() => {
    if (!marqueeRef.current || !isIntersecting) return;

    const marqueeElement = marqueeRef.current;
    let position = 0;
    const speed = 1; // pixels per frame
    const totalWidth = marqueeElement.scrollWidth / 2; // Since we have duplicated content

    let isPageHidden = false;
    const onVisibility = () => {
      isPageHidden = document.hidden;
    };
    document.addEventListener('visibilitychange', onVisibility);

    const animate = () => {
      if (isMarqueePaused || isPageHidden) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      position -= speed;

      // Reset position when we've scrolled through the first set of images
      if (Math.abs(position) >= totalWidth) {
        position = 0;
      }

      marqueeElement.style.transform = `translate3d(${position}px, 0, 0)`;
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [isIntersecting, isMarqueePaused]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const openModal = useCallback((imageSrc: string) => {
    lastFocusedElementRef.current = document.activeElement as HTMLElement;
    setSelectedImage(imageSrc);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedImage(null);
    lastFocusedElementRef.current?.focus?.();
  }, []);

  useEffect(() => {
    if (!selectedImage) return;
    const trap = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeModal();
        return;
      }
      if (e.key !== 'Tab') return;
      const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', trap);
    setTimeout(() => {
      const firstFocusable = modalRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus?.();
    }, 0);
    return () => document.removeEventListener('keydown', trap);
  }, [selectedImage, closeModal]);

  // Distribute images into 3 columns for better balance
  const columns = useMemo(() => {
    const cols: GalleryImage[][] = [[], [], []];
    const colHeights = [0, 0, 0];

    images.forEach(img => {
      const shortestColIndex = colHeights.indexOf(Math.min(...colHeights));
      cols[shortestColIndex].push(img);
      colHeights[shortestColIndex] += img.height;
    });

    return cols;
  }, [images]);

  const renderCard = useCallback(
    (image: GalleryImage, key?: React.Key, isMobile: boolean = false) => {
      const isLoaded = loadedImages.has(image.src);
      const heightClass = isMobile ? 'h-48' : `h-[${image.height}px]`;

      const paddingTop = `${100 / image.aspectRatio}%`;

      if (isMobile) {
        // Fixed-size card for mobile to ensure all images are the same size
        const MOBILE_W = 240;
        const MOBILE_H = 160;
        return (
          <div
            key={key}
            className={`group cursor-pointer transition-opacity duration-500 ${
              isLoaded ? 'opacity-100' : 'opacity-70'
            }`}
            onClick={() => openModal(image.src)}
            style={{ willChange: 'transform' }}
          >
            <div className='relative w-[240px] h-[160px] overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-1 bg-gradient-to-r from-dhack-orange to-dhack-teal'>
              <div className='relative w-full h-full overflow-hidden rounded-lg bg-background/90 backdrop-blur-sm'>
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={MOBILE_W}
                  height={MOBILE_H}
                  className={`w-full h-full object-cover transition-opacity duration-500 ${
                    isLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  loading={isIntersecting ? 'lazy' : 'eager'}
                  sizes='240px'
                  onLoadStart={() => trackImageLoadStart(image.src)}
                  onLoad={() => {
                    trackImageLoadComplete(image.src);
                    setLoadedImages(
                      prev => new Set(Array.from(prev).concat(image.src))
                    );
                  }}
                  onError={() => {
                    console.warn(`Failed to load image: ${image.src}`);
                  }}
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
              </div>
            </div>
          </div>
        );
      }

      return (
        <div
          key={key}
          className={`group cursor-pointer mb-4 transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-70'
          }`}
          onClick={() => openModal(image.src)}
          style={{ willChange: 'transform' }}
        >
          <div className='relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-1 bg-gradient-to-r from-dhack-orange to-dhack-teal'>
            <div className='relative overflow-hidden rounded-lg bg-background/90 backdrop-blur-sm'>
              {/* Aspect ratio box to prevent CLS */}
              <div className='w-full' style={{ paddingTop }} />
              <div
                className={`absolute inset-0 ${heightClass} bg-muted/20 flex items-center justify-center`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={800}
                  height={Math.round(800 / image.aspectRatio)}
                  className={`w-full h-full object-cover transition-opacity duration-500 ${
                    isLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  loading={isIntersecting ? 'lazy' : 'eager'}
                  sizes='(max-width: 640px) 260px, (max-width: 1024px) 33vw, 400px'
                  onLoadStart={() => trackImageLoadStart(image.src)}
                  onLoad={() => {
                    trackImageLoadComplete(image.src);
                    setLoadedImages(
                      prev => new Set(Array.from(prev).concat(image.src))
                    );
                  }}
                  onError={() => {
                    console.warn(`Failed to load image: ${image.src}`);
                  }}
                />
              </div>
              <div className='absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
            </div>
          </div>
        </div>
      );
    },
    [
      loadedImages,
      openModal,
      isIntersecting,
      trackImageLoadStart,
      trackImageLoadComplete,
    ]
  );

  return (
    <section
      id='gallery'
      ref={galleryRef}
      className='pt-12 pb-8 relative overflow-hidden bg-background'
    >
      <div className='max-w-1200 mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-8'>
          <h2 className='text-4xl md:text-5xl font-bold mb-4'>
            Event <span className='gradient-text'>Gallery</span>
          </h2>
          <div className='w-24 h-1 bg-gradient-to-r from-dhack-orange to-dhack-teal mx-auto mb-4' />
          <p className='text-lg text-muted-foreground max-w-3xl mx-auto mb-8'>
            Relive the excitement and innovation from our previous events. See
            the creativity, collaboration, and amazing solutions that emerged.
          </p>
        </div>

        {isIntersecting && (
          <>
            {/* Mobile: Smooth horizontal marquee with seamless looping and fixed-size items */}
            <div className='block sm:hidden'>
              <div className='gallery-marquee-container relative overflow-hidden'>
                <div className='gallery-fade-left absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none'></div>
                <div className='gallery-fade-right absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none'></div>

                <div
                  ref={marqueeRef}
                  className='gallery-marquee-track flex'
                  style={{ gap: '0.25rem' }}
                  onMouseEnter={() => setIsMarqueePaused(true)}
                  onMouseLeave={() => setIsMarqueePaused(false)}
                >
                  <div
                    className='gallery-sequence flex'
                    style={{ gap: '0.25rem' }}
                  >
                    {images.slice(0, 6).map((img, idx) => (
                      <div
                        key={`mobile-a-${idx}`}
                        className='w-[240px] flex-shrink-0'
                      >
                        {renderCard(img, `mobile-card-a-${idx}`, true)}
                      </div>
                    ))}
                  </div>
                  <div
                    className='gallery-sequence flex'
                    aria-hidden='true'
                    style={{ gap: '0.25rem' }}
                  >
                    {images.slice(0, 6).map((img, idx) => (
                      <div
                        key={`mobile-b-${idx}`}
                        className='w-[240px] flex-shrink-0'
                      >
                        {renderCard(img, `mobile-card-b-${idx}`, true)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop: Smooth 3-column vertical marquee */}
            <div className='hidden sm:block relative'>
              <div className='gallery-fade-top absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none'></div>
              <div className='gallery-fade-bottom absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none'></div>

              <div className='grid grid-cols-3 gap-6 h-[36rem] md:h-[42rem] overflow-hidden'>
                {columns.map((colImages, colIdx) => (
                  <div key={colIdx} className='relative overflow-hidden'>
                    <div
                      className={`gallery-column-track flex flex-col gap-4 ${
                        colIdx === 1
                          ? 'animate-marquee-up'
                          : 'animate-marquee-down'
                      }`}
                      style={{
                        animationDelay: `${colIdx * 0.5}s`,
                        animationDuration: `${80 + colIdx * 10}s`,
                      }}
                    >
                      {[...colImages, ...colImages].map((img, idx) => (
                        <div key={`col-${colIdx}-${idx}`}>
                          {renderCard(img, `desktop-${colIdx}-${idx}`)}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Loading state */}
        {!isIntersecting && (
          <div className='flex items-center justify-center h-96'>
            <div className='text-center'>
              <div className='w-12 h-12 border-4 border-dhack-teal border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
              <p className='text-muted-foreground'>Loading gallery...</p>
            </div>
          </div>
        )}
      </div>

      {/* Optimized Modal */}
      {selectedImage && (
        <div
          className='fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4'
          onClick={closeModal}
          role='dialog'
          aria-modal='true'
          aria-labelledby='gallery-modal'
          aria-label='Enlarged gallery image'
        >
          <div
            ref={modalRef}
            className='relative max-w-4xl max-h-full p-2 bg-gradient-to-r from-dhack-orange to-dhack-teal rounded-xl'
            onClick={e => e.stopPropagation()}
          >
            <div className='relative overflow-hidden rounded-lg bg-background/95 backdrop-blur-sm'>
              <Image
                src={selectedImage}
                alt='Gallery image'
                width={800}
                height={600}
                className='max-w-full max-h-full object-contain'
                priority
                sizes='(max-width: 768px) 100vw, 800px'
              />
            </div>
            <button
              onClick={closeModal}
              className='absolute top-2 right-2 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50'
              aria-label='Close gallery image'
            >
              <svg
                className='w-6 h-6 text-white'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                aria-hidden='true'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .gallery-marquee-track:hover,
        .gallery-column-track:hover {
          animation-play-state: paused;
        }

        @keyframes marquee-up {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(0, -50%, 0);
          }
        }

        @keyframes marquee-down {
          0% {
            transform: translate3d(0, -50%, 0);
          }
          100% {
            transform: translate3d(0, 0, 0);
          }
        }

        .animate-marquee-up {
          animation: marquee-up 80s linear infinite;
          will-change: transform;
          transform: translateZ(0);
        }

        .animate-marquee-down {
          animation: marquee-down 90s linear infinite;
          will-change: transform;
          transform: translateZ(0);
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-marquee-up,
          .animate-marquee-down {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
};

export default Gallery;

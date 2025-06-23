import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Slide {
  id: number;
  color: string;
  title: string;
  activeImage: string;
  inactiveImage: string;
  position?: number;
}

const InteractiveSlider = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const slides: Slide[] = [
    { 
      id: 0, 
      color: 'bg-sky-300', 
      title: 'Elder Care', 
      activeImage: '/images/slide1.png',
      inactiveImage: '/images/slide1_inactive.png'
    },
    { 
      id: 1, 
      color: 'bg-red-400', 
      title: 'Child Care', 
      activeImage: '/images/slide2.png',
      inactiveImage: '/images/slide2_inactive.png'
    },
    { 
      id: 2, 
      color: 'bg-green-400', 
      title: 'Special Needs', 
      activeImage: '/images/slide3.png',
      inactiveImage: '/images/slide3_inactive.png'
    },
    { 
      id: 3, 
      color: 'bg-purple-400', 
      title: 'Home Healthcare', 
      activeImage: '/images/slide4.png',
      inactiveImage: '/images/slide4_inactive.png'
    },
    { 
      id: 4, 
      color: 'bg-yellow-400', 
      title: 'Respite Care', 
      activeImage: '/images/slide5.png',
      inactiveImage: '/images/slide5_inactive.png'
    },
    { 
      id: 5, 
      color: 'bg-pink-400', 
      title: 'Overnight Care', 
      activeImage: '/images/slide6.png',
      inactiveImage: '/images/slide6_inactive.png'
    },
    { 
      id: 6, 
      color: 'bg-indigo-400', 
      title: 'Companion Care', 
      activeImage: '/images/slide7.png',
      inactiveImage: '/images/slide7_inactive.png'
    }
  ];

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % slides.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const handleSlideClick = (slideId: number) => {
    setActiveSlide(slideId);
    setIsAutoPlaying(false);
    // Resume auto-play after 5 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const handleKeyDown = (e: React.KeyboardEvent, slideId: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSlideClick(slideId);
    }
  };

  const nextSlide = () => {
    setActiveSlide(prev => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setActiveSlide(prev => prev === 0 ? slides.length - 1 : prev - 1);
  };

  // Create visible slides array (active slide + next 2 slides)
  const getVisibleSlides = (): (Slide & { position: number })[] => {
    const visibleSlides = [];
    for (let i = 0; i < 3; i++) {
      const slideIndex = (activeSlide + i) % slides.length;
      visibleSlides.push({
        ...slides[slideIndex],
        position: i
      });
    }
    return visibleSlides;
  };

const slideVariants = {
    active: (custom?: number) => ({
        width: "min(820px, 45vw)",
        height: "min(480px, 50vh)",
        filter: 'brightness(1)',
        zIndex: 10,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 30,
            mass: 0.8
        }
    }),
    inactive: (custom?: number) => ({
        width: "min(325px, 25vw)",
        height: "min(480px, 50vh)",
        filter: 'brightness(0.7)',
        zIndex: 5,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 30,
            mass: 0.8
        }
    }),
    hover: {
        filter: 'brightness(1.1)',
        transition: {
            type: 'spring',
            stiffness: 400,
            damping: 25
        }
    }
};

  const contentVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.8
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        delay: 0.2,
        ease: 'easeOut'
      }
    }
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const dotVariants = {
    inactive: {
      scale: 1,
      backgroundColor: '#9CA3AF',
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 20
      }
    },
    active: {
      scale: 1.25,
      backgroundColor: '#374151',
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 20
      }
    },
    hover: {
      backgroundColor: '#4B5563',
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center overflow-hidden w-full max-w-[1746px] px-4 md:px-8 lg:px-10 mt-10 mx-auto">
      <div className="flex items-center justify-center gap-4 mb-8 w-full overflow-x-auto">
        <motion.div 
          className="flex items-center justify-center gap-3 mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence mode="wait">
            {getVisibleSlides().map((slide) => (
              <motion.div
                key={`${slide.id}-${slide.position}`}
                className={`
                  rounded-3xl 
                  cursor-pointer 
                  shadow-lg
                  focus:outline-none
                  focus:ring-4
                  focus:ring-blue-300
                  focus:ring-opacity-50
                  flex items-center justify-center
                  flex-shrink-0
                  relative
                  overflow-hidden
                `}
                variants={slideVariants}
                initial="inactive"
                animate={slide.position === 0 ? 'active' : 'inactive'}
                whileHover={slide.position !== 0 ? 'hover' : {}}
                whileTap={{}}
                onClick={() => handleSlideClick(slide.id)}
                onKeyDown={(e) => handleKeyDown(e, slide.id)}
                tabIndex={0}
                role="button"
                aria-label={`Select ${slide.title}`}
                style={{
                  boxShadow: slide.position === 0 
                    ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' 
                    : '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
                layout
                transition={{
                  layout: {
                    type: 'spring',
                    stiffness: 300,
                    damping: 30
                  }
                }}
                custom={slide.position}
              >
                <img 
                  src={slide.position === 0 ? slide.activeImage : slide.inactiveImage}
                  alt={slide.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="text-gray-600 hover:text-gray-800 bg-transparent p-2 px-2 z-10 absolute top-5 right-5 rounded-xl backdrop-blur-2xl shadow-2xl">
                  <AnimatePresence>
                    {slide.position === 0 && (
                      <motion.p 
                        className="text-lg opacity-90"
                        variants={contentVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                      >
                        Book Now
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Navigation dots */}
      <div className="flex gap-2 flex-wrap justify-center max-w-md mx-auto">
        {slides.map((slide) => (
          <motion.button
            key={slide.id}
            className="w-3 h-3 rounded-full"
            variants={dotVariants}
            initial="inactive"
            animate={activeSlide === slide.id ? 'active' : 'inactive'}
            whileHover={activeSlide !== slide.id ? 'hover' : {}}
            whileTap={{}}
            onClick={() => handleSlideClick(slide.id)}
            aria-label={`Go to ${slide.title}`}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="mt-4 w-64 h-1 bg-gray-300 rounded-full overflow-hidden mx-auto">
        <motion.div
          className="h-full bg-blue-500"
          initial={{ width: '0%' }}
          animate={{ width: isAutoPlaying ? '100%' : '0%' }}
          transition={{
            duration: isAutoPlaying ? 10 : 0,
            ease: 'linear',
            repeat: isAutoPlaying ? Infinity : 0
          }}
        />
      </div>
    </div>
  );
};

export default InteractiveSlider;

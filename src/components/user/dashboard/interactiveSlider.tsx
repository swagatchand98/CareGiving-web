import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Slide {
  id: number;
  color: string;
  title: string;
  position?: number;
}

const InteractiveSlider = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const slides: Slide[] = [
    { id: 0, color: 'bg-sky-300', title: 'Slide 1' },
    { id: 1, color: 'bg-red-400', title: 'Slide 2' },
    { id: 2, color: 'bg-green-400', title: 'Slide 3' },
    { id: 3, color: 'bg-purple-400', title: 'Slide 4' },
    { id: 4, color: 'bg-yellow-400', title: 'Slide 5' },
    { id: 5, color: 'bg-pink-400', title: 'Slide 6' },
    { id: 6, color: 'bg-indigo-400', title: 'Slide 7' },
    { id: 7, color: 'bg-orange-400', title: 'Slide 8' },
    { id: 8, color: 'bg-teal-400', title: 'Slide 9' },
    { id: 9, color: 'bg-cyan-400', title: 'Slide 10' }
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

  // Create visible slides array (active slide + next 4 slides)
  const getVisibleSlides = (): (Slide & { position: number })[] => {
    const visibleSlides = [];
    for (let i = 0; i < 5; i++) {
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
        width: "900px",
        height: "480px",
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
        width: "300px",
        height: "480px",
        filter: 'brightness(0.8)',
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
    <div className="flex flex-col items-center justify-center overflow-hidden w-[1746px] ml-10 mt-10">
      <div className="flex items-center gap-4 mb-8 pl-50">
        <motion.div 
          className="flex items-center gap-3 ml-160"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence mode="wait">
            {getVisibleSlides().map((slide) => (
              <motion.div
                key={`${slide.id}-${slide.position}`}
                className={`
                  ${slide.color} 
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
                <div className="text-white text-center px-2">
                  <motion.h3 
                    className="font-bold mb-2"
                  >
                    {slide.title}
                  </motion.h3>
                  <AnimatePresence>
                    {slide.position === 0 && (
                      <motion.p 
                        className="text-lg opacity-90"
                        variants={contentVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                      >
                        Active content
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
      <div className="flex gap-2 flex-wrap justify-center max-w-md ml-25">
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
      <div className="mt-4 w-64 h-1 bg-gray-300 rounded-full overflow-hidden ml-25">
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
/**
 * Animation utilities for the caregiving web application
 */

// Initialize scroll animations using Intersection Observer
export function initScrollAnimations() {
  // Check if window is available (for SSR compatibility)
  if (typeof window === 'undefined') return;
  
  // Create observer for reveal animations
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          // Once the animation has played, we can stop observing
          if (!entry.target.dataset.repeat) {
            revealObserver.unobserve(entry.target);
          }
        } else if (entry.target.dataset.repeat) {
          // If element has data-repeat attribute, remove active class when out of view
          entry.target.classList.remove('active');
        }
      });
    },
    {
      threshold: 0.1, // Trigger when 10% of the element is visible
      rootMargin: '0px 0px -50px 0px' // Adjust when animation triggers
    }
  );

  // Select all elements with reveal classes
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });
}

// Initialize counter animations
export function initCounters() {
  if (typeof window === 'undefined') return;
  
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target;
          const countTo = parseInt(target.dataset.count, 10);
          
          if (isNaN(countTo)) return;
          
          let count = 0;
          const duration = 2000; // 2 seconds
          const increment = countTo / (duration / 16); // Update every 16ms (60fps)
          
          const counter = setInterval(() => {
            count += increment;
            if (count >= countTo) {
              target.textContent = target.dataset.format 
                ? formatNumber(countTo, target.dataset.format) 
                : countTo;
              clearInterval(counter);
            } else {
              target.textContent = target.dataset.format 
                ? formatNumber(Math.floor(count), target.dataset.format) 
                : Math.floor(count);
            }
          }, 16);
          
          counterObserver.unobserve(target);
        }
      });
    },
    {
      threshold: 0.5
    }
  );
  
  const counterElements = document.querySelectorAll('[data-count]');
  counterElements.forEach((element) => {
    counterObserver.observe(element);
  });
}

// Format numbers with commas or plus sign
function formatNumber(number, format) {
  if (format === 'plus') {
    return number.toLocaleString() + '+';
  }
  return number.toLocaleString();
}

// Initialize parallax effects
export function initParallax() {
  if (typeof window === 'undefined') return;
  
  const parallaxElements = document.querySelectorAll('.parallax');
  
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    
    parallaxElements.forEach((element) => {
      const speed = element.dataset.speed || 0.2;
      const offset = scrollY * speed;
      element.style.transform = `translateY(${offset}px)`;
    });
  });
}

// Initialize hover effects that require JavaScript
export function initHoverEffects() {
  if (typeof window === 'undefined') return;
  
  const hoverElements = document.querySelectorAll('.js-hover-effect');
  
  hoverElements.forEach((element) => {
    element.addEventListener('mouseenter', (e) => {
      const effect = element.dataset.effect;
      
      if (effect === 'tilt') {
        initTiltEffect(element, e);
      }
    });
  });
}

// Create a tilt effect on hover
function initTiltEffect(element, e) {
  element.addEventListener('mousemove', handleTilt);
  element.addEventListener('mouseleave', resetTilt);
  
  function handleTilt(e) {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const tiltX = (x - centerX) / centerX * 10; // Max tilt of 10 degrees
    const tiltY = (y - centerY) / centerY * 10;
    
    element.style.transform = `perspective(1000px) rotateX(${-tiltY}deg) rotateY(${tiltX}deg)`;
  }
  
  function resetTilt() {
    element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
    element.removeEventListener('mousemove', handleTilt);
    element.removeEventListener('mouseleave', resetTilt);
  }
}

// Initialize all animations
export function initAllAnimations() {
  // Wait for DOM to be fully loaded
  if (typeof window !== 'undefined') {
    if (document.readyState === 'complete') {
      runAnimations();
    } else {
      window.addEventListener('load', runAnimations);
    }
  }
  
  function runAnimations() {
    initScrollAnimations();
    initCounters();
    initParallax();
    initHoverEffects();
  }
}

// Typed text effect
export function initTypedText(element, texts, options = {}) {
  if (!element) return;
  
  const defaultOptions = {
    typeSpeed: 50,
    backSpeed: 30,
    backDelay: 1500,
    loop: true
  };
  
  const settings = { ...defaultOptions, ...options };
  let textIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingTimeout;
  
  function type() {
    const currentText = texts[textIndex];
    
    if (isDeleting) {
      element.textContent = currentText.substring(0, charIndex - 1);
      charIndex--;
    } else {
      element.textContent = currentText.substring(0, charIndex + 1);
      charIndex++;
    }
    
    // Speed adjustments
    let typeSpeed = isDeleting ? settings.backSpeed : settings.typeSpeed;
    
    // If complete, start deleting after delay
    if (!isDeleting && charIndex === currentText.length) {
      typeSpeed = settings.backDelay;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      textIndex = (textIndex + 1) % texts.length;
    }
    
    typingTimeout = setTimeout(type, typeSpeed);
  }
  
  // Start the typing animation
  type();
  
  // Return a cleanup function
  return () => {
    if (typingTimeout) clearTimeout(typingTimeout);
  };
}

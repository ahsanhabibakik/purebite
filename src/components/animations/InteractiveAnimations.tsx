"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation, useInView } from 'framer-motion';
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  Award, 
  Zap, 
  TrendingUp,
  Gift,
  Sparkles,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info
} from 'lucide-react';

// Floating Action Button with Ripple Effect
export function FloatingActionButton({ 
  children, 
  onClick, 
  className = "",
  size = "md",
  variant = "primary" 
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "danger";
}) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
  
  const sizeClasses = {
    sm: "h-12 w-12",
    md: "h-14 w-14", 
    lg: "h-16 w-16"
  };
  
  const variantClasses = {
    primary: "bg-green-600 hover:bg-green-700 text-white",
    secondary: "bg-gray-600 hover:bg-gray-700 text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white"
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const newRipple = { x, y, id: Date.now() };
    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
    
    onClick?.();
  };

  return (
    <motion.button
      className={`
        relative overflow-hidden rounded-full shadow-lg 
        ${sizeClasses[size]} ${variantClasses[variant]} ${className}
        flex items-center justify-center
        transition-all duration-200 ease-out
        hover:shadow-xl hover:scale-110
        active:scale-95
      `}
      onClick={handleClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
      
      {/* Ripple Effects */}
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.span
            key={ripple.id}
            className="absolute bg-white/30 rounded-full pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
            }}
            initial={{ width: 0, height: 0, x: '-50%', y: '-50%' }}
            animate={{ 
              width: 80, 
              height: 80, 
              x: '-50%', 
              y: '-50%',
              opacity: [0.7, 0]
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>
    </motion.button>
  );
}

// Animated Badge Component
export function AnimatedBadge({ 
  children, 
  variant = "default",
  animate = true,
  icon: Icon,
  pulse = false 
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "new" | "trending";
  animate?: boolean;
  icon?: any;
  pulse?: boolean;
}) {
  const variants = {
    default: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
    success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100", 
    danger: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
    new: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    trending: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100"
  };

  return (
    <motion.span
      className={`
        inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium
        ${variants[variant]}
        ${pulse ? 'animate-pulse' : ''}
      `}
      initial={animate ? { scale: 0, opacity: 0 } : false}
      animate={animate ? { scale: 1, opacity: 1 } : false}
      transition={{ 
        type: "spring", 
        stiffness: 500, 
        damping: 30,
        delay: Math.random() * 0.2
      }}
      whileHover={{ scale: 1.05 }}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {children}
    </motion.span>
  );
}

// Interactive Heart Button
export function InteractiveHeartButton({ 
  isLiked = false, 
  onToggle,
  size = "md" 
}: {
  isLiked?: boolean;
  onToggle?: (liked: boolean) => void;
  size?: "sm" | "md" | "lg";
}) {
  const [liked, setLiked] = useState(isLiked);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10"
  };

  const handleToggle = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    onToggle?.(newLiked);

    if (newLiked) {
      // Create heart particles
      const newParticles = Array.from({ length: 6 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 20 - 10,
        y: Math.random() * 20 - 10,
      }));
      
      setParticles(newParticles);
      
      setTimeout(() => setParticles([]), 1000);
    }
  };

  return (
    <div className="relative">
      <motion.button
        className={`
          relative ${sizeClasses[size]} flex items-center justify-center
          text-gray-400 hover:text-red-500 transition-colors duration-200
        `}
        onClick={handleToggle}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <motion.div
          animate={liked ? { scale: [1, 1.3, 1] } : { scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Heart 
            className={`${sizeClasses[size]} ${
              liked ? 'fill-red-500 text-red-500' : 'text-current'
            } transition-all duration-200`}
          />
        </motion.div>
      </motion.button>

      {/* Floating Heart Particles */}
      <AnimatePresence>
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            className="absolute pointer-events-none"
            initial={{ 
              x: 0, 
              y: 0, 
              opacity: 1, 
              scale: 0.5 
            }}
            animate={{ 
              x: particle.x * 3, 
              y: particle.y * 3 - 20, 
              opacity: 0, 
              scale: 0.8 
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <Heart className="h-3 w-3 fill-red-500 text-red-500" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Animated Counter
export function AnimatedCounter({ 
  value, 
  duration = 1,
  prefix = "",
  suffix = "" 
}: {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref);

  useEffect(() => {
    if (!isInView) return;

    let startTime: number | null = null;
    const startValue = displayValue;
    
    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      
      const currentValue = Math.round(startValue + (value - startValue) * progress);
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value, duration, isInView]);

  return (
    <span ref={ref} className="font-mono">
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  );
}

// Loading Dots Animation
export function LoadingDots({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-1 w-1",
    md: "h-2 w-2", 
    lg: "h-3 w-3"
  };

  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`${sizeClasses[size]} bg-current rounded-full`}
          animate={{
            y: [0, -8, 0],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  );
}

// Stagger Animation Container
export function StaggerContainer({ 
  children, 
  staggerDelay = 0.1,
  className = "" 
}: {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
    >
      {children}
    </motion.div>
  );
}

// Stagger Item
export function StaggerItem({ 
  children, 
  className = "",
  y = 20 
}: {
  children: React.ReactNode;
  className?: string;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { y: y, opacity: 0 },
        visible: { 
          y: 0, 
          opacity: 1,
          transition: {
            type: "spring",
            stiffness: 100,
            damping: 12
          }
        }
      }}
    >
      {children}
    </motion.div>
  );
}

// Notification Toast Component
export function AnimatedNotification({
  type = "info",
  title,
  message,
  isVisible,
  onClose,
  duration = 5000
}: {
  type?: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}) {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info
  };

  const colors = {
    success: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-800 dark:text-green-100",
    error: "bg-red-50 border-red-200 text-red-800 dark:bg-red-900 dark:border-red-800 dark:text-red-100",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:border-yellow-800 dark:text-yellow-100",
    info: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900 dark:border-blue-800 dark:text-blue-100"
  };

  const Icon = icons[type];

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`
            fixed top-4 right-4 z-50 max-w-md w-full
            ${colors[type]}
            border rounded-lg shadow-lg p-4
          `}
          initial={{ opacity: 0, x: 300, scale: 0.3 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.5 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <div className="flex items-start gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
            </motion.div>
            
            <div className="flex-1">
              <motion.h4 
                className="font-medium mb-1"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {title}
              </motion.h4>
              <motion.p 
                className="text-sm opacity-90"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {message}
              </motion.p>
            </div>
            
            <motion.button
              className="text-current opacity-60 hover:opacity-100 transition-opacity"
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <XCircle className="h-4 w-4" />
            </motion.button>
          </div>
          
          {/* Progress Bar */}
          {duration > 0 && (
            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-current opacity-30 rounded-b-lg"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: duration / 1000, ease: "linear" }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Morphing Shape Button
export function MorphingButton({ 
  children, 
  onClick,
  isLoading = false,
  className = "" 
}: {
  children: React.ReactNode;
  onClick?: () => void;
  isLoading?: boolean;
  className?: string;
}) {
  return (
    <motion.button
      className={`
        relative overflow-hidden px-6 py-3 rounded-lg
        bg-gradient-to-r from-green-600 to-green-700
        text-white font-medium
        transition-all duration-300
        ${className}
      `}
      onClick={onClick}
      disabled={isLoading}
      whileHover={{ 
        scale: 1.05,
        boxShadow: "0 10px 25px rgba(22, 163, 74, 0.3)"
      }}
      whileTap={{ scale: 0.95 }}
      animate={isLoading ? { 
        borderRadius: ["8px", "50px", "8px"]
      } : {}}
      transition={{ duration: 0.6, repeat: isLoading ? Infinity : 0 }}
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center"
          >
            <LoadingDots />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// Parallax Card
export function ParallaxCard({ 
  children, 
  className = "",
  intensity = 10 
}: {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    setMousePosition({
      x: (x - centerX) / centerX,
      y: (y - centerY) / centerY
    });
  };

  return (
    <motion.div
      className={`transform-gpu ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePosition({ x: 0, y: 0 });
      }}
      animate={{
        rotateX: isHovered ? mousePosition.y * intensity : 0,
        rotateY: isHovered ? mousePosition.x * intensity : 0,
        scale: isHovered ? 1.05 : 1
      }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      }}
      style={{
        transformStyle: "preserve-3d"
      }}
    >
      {children}
    </motion.div>
  );
}
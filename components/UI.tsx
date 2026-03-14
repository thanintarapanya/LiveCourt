import React from 'react';
import { motion } from 'framer-motion';

export type GlassCardProps = React.ComponentProps<typeof motion.div> & {
  children: React.ReactNode;
  className?: string;
  variant?: 'frosted' | 'clear' | 'dark';
};

export const GlassCard = ({ children, className = '', variant = 'frosted', ...props }: GlassCardProps) => {
  const baseStyles = "rounded-2xl backdrop-blur-xl transition-all duration-300";
  
  const variants = {
    // Light mode frosted glass: High opacity white, subtle border, soft shadow
    frosted: "bg-white/70 border border-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:bg-white/80 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]",
    // Clear glass
    clear: "bg-transparent border border-gray-200/50",
    // Dark accent card
    dark: "bg-brand-black/90 text-white shadow-lg",
  };

  return (
    <motion.div 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: React.ReactNode;
}

export const NeonButton: React.FC<NeonButtonProps> = ({ children, variant = 'primary', icon, className = '', ...props }) => {
  const baseStyles = "relative px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 overflow-hidden group";
  
  const variants = {
    // Orange Gradient
    primary: "bg-gradient-to-r from-brand-orange to-orange-600 text-white shadow-[0_4px_14px_rgba(249,115,22,0.4)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.6)] border border-transparent hover:-translate-y-0.5",
    // White/Grey Secondary
    secondary: "bg-white/80 text-gray-700 border border-gray-200 hover:bg-white hover:border-brand-orange/50 hover:text-brand-orange shadow-sm",
    // Danger
    danger: "bg-red-50 text-red-500 border border-red-100 hover:bg-red-100",
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      <span className="relative z-10 flex items-center gap-2">{icon}{children}</span>
      {variant === 'primary' && (
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
      )}
    </button>
  );
};

export const Badge: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = 'bg-orange-100 text-orange-700' }) => (
  <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${color}`}>
    {children}
  </span>
);
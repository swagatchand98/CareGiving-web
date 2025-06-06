import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'google' | 'outline';
  fullWidth?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  fullWidth = false,
  children,
  className = '',
  ...props
}) => {
  const baseStyles = 'py-3 px-4 rounded-md font-medium transition-colors focus:outline-none';
  
  const variantStyles = {
    primary: 'bg-black text-white hover:bg-gray-800',
    secondary: 'bg-white text-black border border-gray-300 hover:bg-gray-50',
    google: 'bg-white text-black border border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-2',
    outline: 'bg-transparent text-black border border-black hover:bg-gray-100'
  };
  
  const widthStyles = fullWidth ? 'w-full' : '';
  
  // Add disabled styles
  const disabledStyles = props.disabled ? 
    'opacity-50 cursor-not-allowed hover:bg-opacity-100' : '';
  
  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${widthStyles} ${disabledStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;

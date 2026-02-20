import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "px-4 py-2 rounded font-semibold transition-colors duration-200 border-2";
  
  const variants = {
    primary: "border-[#D2B48C] text-[#D2B48C] hover:bg-[#D2B48C] hover:text-black",
    secondary: "border-gray-600 text-gray-400 hover:border-gray-400 hover:text-gray-200",
    danger: "border-red-800 text-red-500 hover:bg-red-900/30",
    success: "border-green-800 text-green-500 hover:bg-green-900/30",
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
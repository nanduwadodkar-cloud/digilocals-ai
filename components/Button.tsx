
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, icon, ...props }) => {
  return (
    <button
      {...props}
      className={`
        flex items-center justify-center gap-2 px-6 py-3 bg-[#00BFFF] text-white font-semibold rounded-lg 
        shadow-md hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75
        transition-all duration-200 ease-in-out disabled:bg-gray-500 disabled:cursor-not-allowed
        ${props.className || ''}
      `}
    >
      {icon}
      {children}
    </button>
  );
};

export default Button;

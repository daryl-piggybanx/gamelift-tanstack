import React from 'react';
import { X, Eye, Hand, Edit } from 'lucide-react';

interface StreamControlButtonsProps {
  onTerminate?: () => void;
  onViewControls?: () => void;
  onToggleTouch?: () => void;
  onEditControls?: () => void;
  visible?: boolean;
}

export const StreamControlButtons: React.FC<StreamControlButtonsProps> = ({
  onTerminate,
  onViewControls,
  onToggleTouch,
  onEditControls,
  visible = true
}) => {
  if (!visible) return null;

  const buttonClass = "inline-flex items-center justify-center border-none bg-transparent cursor-pointer p-0 transition-all duration-300 hover:opacity-80 active:scale-95";

  return (
    <div className="fixed top-1 left-1/2 transform -translate-x-1/2 z-[99999] flex flex-row justify-center items-center opacity-100 visible pointer-events-auto p-1 rounded-md bg-transparent">
      <div className="flex space-x-2">
        <button
          onClick={onTerminate}
          className={`${buttonClass} w-10 h-10 lg:w-12 lg:h-12 p-2 lg:p-3 rounded-3xl bg-[#242424] border-2 border-white hover:bg-[#363636]`}
          aria-label="Terminate Stream"
        >
          <X className="w-full h-full text-white" />
        </button>
        
        <button
          onClick={onViewControls}
          className={`${buttonClass} w-10 h-10 lg:w-12 lg:h-12 p-2 lg:p-3 rounded-3xl bg-[#242424] border-2 border-white hover:bg-[#363636]`}
          aria-label="View Controls"
        >
          <Eye className="w-full h-full text-white" />
        </button>
        
        <button
          onClick={onToggleTouch}
          className={`${buttonClass} w-10 h-10 lg:w-12 lg:h-12 p-2 lg:p-3 rounded-3xl bg-[#242424] border-2 border-white hover:bg-[#363636]`}
          aria-label="Toggle Touch Controls"
        >
          <Hand className="w-full h-full text-white" />
        </button>
        
        <button
          onClick={onEditControls}
          className={`${buttonClass} w-10 h-10 lg:w-12 lg:h-12 p-2 lg:p-3 rounded-3xl bg-[#242424] border-2 border-white hover:bg-[#363636]`}
          aria-label="Edit Controls"
        >
          <Edit className="w-full h-full text-white" />
        </button>
      </div>
    </div>
  );
};
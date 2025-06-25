import { ChevronRight } from 'lucide-react';

const SettingsDropdown = ({ 
  title, 
  icon: Icon, 
  isExpanded, 
  onToggle, 
  children,
  className = ""
}) => {
  // Determine if this is the delete account section based on className
  const isDeleteSection = className.includes('red');
  
  return (
    <div className={`border rounded-2xl overflow-hidden ${
      isDeleteSection 
        ? 'border-red-500/30 bg-red-900/10' 
        : 'border-neutral-800 bg-neutral-950/50'
    } ${className}`}>
      {/* Header */}
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-6 py-4 text-left transition-colors ${
          isDeleteSection 
            ? 'hover:bg-red-900/20' 
            : 'hover:bg-neutral-900/50'
        }`}
      >
        <div className="flex items-center space-x-3">
          {Icon && <Icon className={`w-5 h-5 ${
            isDeleteSection ? 'text-red-400' : 'text-gray-400'
          }`} />}
          <span className={`font-medium ${
            isDeleteSection ? 'text-red-400' : 'text-white'
          }`}>{title}</span>
        </div>
        <ChevronRight 
          className={`w-5 h-5 transition-transform duration-200 ${
            isDeleteSection ? 'text-red-400' : 'text-gray-400'
          } ${isExpanded ? 'rotate-90' : ''}`} 
        />
      </button>

      {/* Content */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
        isExpanded 
          ? 'max-h-96 opacity-100' 
          : 'max-h-0 opacity-0'
      }`}>
        <div className={`px-6 pb-6 border-t ${
          isDeleteSection ? 'border-red-500/30' : 'border-neutral-800'
        }`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default SettingsDropdown;

import { ChevronRight } from 'lucide-react';

const SettingsDropdown = ({ 
  title, 
  icon: Icon, 
  isExpanded, 
  onToggle, 
  children,
  className = ""
}) => {
  return (
    <div className={`border border-neutral-800 rounded-2xl bg-neutral-950/50 overflow-hidden ${className}`}>
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-neutral-900/50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          {Icon && <Icon className="w-5 h-5 text-gray-400" />}
          <span className="text-white font-medium">{title}</span>
        </div>
        <ChevronRight 
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isExpanded ? 'rotate-90' : ''
          }`} 
        />
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-neutral-800">
          {children}
        </div>
      )}
    </div>
  );
};

export default SettingsDropdown;

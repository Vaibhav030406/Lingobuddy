import { useState, useRef, useEffect } from 'react';
import { PaletteIcon } from 'lucide-react';
import { useThemeSelector } from '../hooks/useThemeSelector';
import { THEMES } from '../constants';

const ThemeSelector = () => {
  const { theme, setTheme } = useThemeSelector();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        className="btn btn-outline flex items-center gap-2 bg-gray-800/70 text-gray-200 hover:bg-pink-500/90 hover:text-white transition-all duration-200 rounded-lg"
        onClick={toggleDropdown}
      >
        <PaletteIcon className="w-4 h-4" />
        Theme
      </button>
      {isOpen && (
        <div className="absolute top-12 right-0 bg-gray-900/95 text-gray-200 shadow-xl rounded-lg p-3 min-w-[16rem] max-w-full max-h-80 overflow-y-auto border border-pink-500/20 z-50 animate-fade-in">
          {THEMES.map((themeOption) => (
            <button
              key={themeOption.name}
              onClick={() => {
                setTheme(`theme-${themeOption.name.toLowerCase()}`);
                setIsOpen(false); // Close dropdown after selection
              }}
              className={`flex items-center justify-between w-full px-3 py-2 rounded hover:bg-pink-500/90 hover:text-white transition-all duration-200 ${
                theme === `theme-${themeOption.name.toLowerCase()}` ? 'bg-pink-500/90 text-white' : ''
              }`}
            >
              <span className="flex items-center gap-2">
                <PaletteIcon className="w-3 h-3" />
                {themeOption.label}
              </span>
              <div className="flex gap-1">
                {themeOption.colors.map((color, idx) => (
                  <span
                    key={idx}
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;
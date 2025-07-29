import { useState, useRef, useEffect } from 'react';
import { PaletteIcon } from 'lucide-react';
import { useThemeSelector } from '../hooks/useThemeSelector';
import { THEMES } from '../constants';

const ThemeSelector = () => {
  const { theme, setTheme } = useThemeSelector();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

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
    <div className="relative" ref={dropdownRef}>
      <button
        className="p-2 rounded-full hover:bg-[var(--primary)]/10 transition-colors"
        onClick={toggleDropdown}
      >
        <PaletteIcon className="w-5 h-5 text-[var(--text)] opacity-70" />
      </button>
      
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-[var(--background)] border border-[var(--primary)] shadow-lg rounded-lg p-2 min-w-[16rem] max-h-80 overflow-y-auto z-50">
          {THEMES.map((themeOption) => (
            <button
              key={themeOption.name}
              onClick={() => {
                setTheme(`theme-${themeOption.name.toLowerCase()}`);
                setIsOpen(false);
              }}
              className={`flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-[var(--primary)]/10 transition-colors ${
                theme === `theme-${themeOption.name.toLowerCase()}` 
                  ? 'bg-[var(--primary)] text-white' 
                  : 'text-[var(--text)]'
              }`}
            >
              <span className="flex items-center gap-2">
                <PaletteIcon className="w-4 h-4" />
                {themeOption.label}
              </span>
              <div className="flex gap-1">
                {themeOption.colors.map((color, idx) => (
                  <span
                    key={idx}
                    className="w-3 h-3 rounded-full border border-gray-300"
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

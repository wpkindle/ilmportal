'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

export default function CustomSelect({
  options = [],
  value = '',
  onChange,
  placeholder = 'Select option...',
  icon: Icon,
  searchable = false,
  className = '',
  variant = 'default', // 'default' | 'hero' | 'filter' | 'form'
  placement = 'bottom', // 'bottom' | 'top'
  disabled = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Normalize options to { value, label, sublabel, badge }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt };
    }
    return opt;
  });

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Filter options by search query
  const filteredOptions = searchable && searchQuery.trim()
    ? normalizedOptions.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (opt.sublabel && opt.sublabel.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : normalizedOptions;

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen, searchable]);

  // Variant-specific styling
  const variantStyles = {
    hero: 'bg-transparent text-slate-900 font-semibold text-xs sm:text-sm py-2 px-2.5 rounded-full hover:bg-slate-100/90',
    default: 'bg-[#0f172a] border border-white/20 text-white font-medium text-xs sm:text-sm py-2.5 px-3.5 rounded-2xl hover:border-emerald-500/50 shadow-md',
    filter: 'bg-[#0f172a] border border-emerald-500/40 text-slate-100 font-medium text-xs py-2 px-3 rounded-xl hover:border-emerald-400 shadow-sm',
    form: 'bg-[#0f172a] border border-slate-700 text-slate-100 font-medium text-sm py-2.5 px-3.5 rounded-xl hover:border-emerald-500 focus-within:border-emerald-500'
  };

  const placementClass = placement === 'top'
    ? 'bottom-full mb-2'
    : 'top-full mt-1.5';

  return (
    <div ref={containerRef} className={`relative select-none text-left ${className}`}>
      
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between gap-2 transition-all cursor-pointer text-left outline-none ${
          variantStyles[variant] || variantStyles.default
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${
          isOpen ? 'ring-2 ring-emerald-500/50 border-emerald-500' : ''
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 truncate text-left">
          {Icon && <Icon className="w-4 h-4 text-emerald-600 shrink-0" />}
          <span className={`truncate text-left ${selectedOption ? 'font-bold' : 'text-slate-500 font-normal'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
            variant === 'hero' ? 'text-slate-600' : 'text-slate-400'
          } ${isOpen ? (placement === 'top' ? '-rotate-180 text-emerald-600' : 'rotate-180 text-emerald-600') : ''}`}
        />
      </button>

      {/* Popover Dropdown Menu (Solid 100% Opaque Slate-900 Container) */}
      {isOpen && (
        <div
          role="listbox"
          className={`absolute left-0 right-0 ${placementClass} z-50 rounded-2xl bg-[#0f172a] border-2 border-emerald-500/60 shadow-2xl shadow-black text-white text-left overflow-hidden animate-in fade-in zoom-in-95 duration-150 min-w-[260px] max-w-[320px]`}
          style={{ backgroundColor: '#0f172a' }}
        >
          {/* Search Bar */}
          {searchable && (
            <div className="p-2.5 border-b border-slate-700 bg-[#1e293b] sticky top-0 z-10 flex items-center gap-2 text-left">
              <Search className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-transparent text-xs text-white placeholder:text-slate-400 outline-none font-medium py-1 px-1 text-left"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-slate-400 hover:text-white p-1 rounded-md cursor-pointer hover:bg-slate-700"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto p-1.5 space-y-1 custom-scrollbar text-left bg-[#0f172a]">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 font-medium">
                No matching options found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <div
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center justify-between gap-2.5 cursor-pointer text-left ${
                      isSelected
                        ? 'bg-emerald-600 text-white font-bold shadow-md'
                        : 'text-slate-200 hover:bg-[#1e293b] hover:text-emerald-300'
                    }`}
                  >
                    <div className="flex flex-col min-w-0 text-left">
                      <span className="font-semibold text-white truncate text-left">
                        {opt.label}
                      </span>
                      {opt.sublabel && (
                        <span className={`text-[10px] truncate text-left ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                          {opt.sublabel}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {opt.sublabel && !isSelected && (
                        <span className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                          {opt.sublabel.split(' ')[0]}
                        </span>
                      )}
                      {isSelected && (
                        <Check className="w-4 h-4 text-white shrink-0" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

    </div>
  );
}

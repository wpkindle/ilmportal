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
  allowCustom = false,
  customPlaceholder = 'Add as custom value...',
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
    hero: 'bg-transparent text-stone-900 font-semibold text-xs sm:text-sm py-2 px-2.5 rounded-full hover:bg-stone-100/90',
    default: 'bg-white border border-[#ebe3d3] text-[#141c19] font-medium text-xs sm:text-sm py-2.5 px-3.5 rounded-2xl hover:border-[#d4a359]/70 shadow-xs',
    filter: 'bg-white border border-[#ebe3d3] text-[#141c19] font-medium text-xs py-2 px-3 rounded-xl hover:border-[#d4a359] shadow-xs',
    form: 'bg-[#faf8f5] hover:bg-white focus:bg-white border border-[#e6ded1] hover:border-[#d4a359] focus:border-[#0c2217] text-slate-900 font-bold text-xs py-2.5 px-3.5 rounded-2xl shadow-2xs h-[42px] transition-all',
    profile: 'bg-[#faf8f5] hover:bg-white focus:bg-white border border-[#e6ded1] hover:border-[#d4a359] focus:border-[#0c2217] text-slate-900 font-bold text-xs py-2.5 px-3.5 rounded-2xl shadow-2xs h-[42px] transition-all'
  };

  const placementClass = placement === 'top'
    ? 'bottom-full mb-2'
    : 'top-full mt-1.5';

  const hasValue = (selectedOption && selectedOption.value !== '') || (value && value !== '');
  const displayLabel = selectedOption
    ? (selectedOption.value !== '' ? selectedOption.label : placeholder)
    : (value || placeholder);

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
          isOpen ? 'ring-2 ring-[#d4a359]/40 border-[#d4a359] bg-white' : ''
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 truncate text-left">
          {Icon && <Icon className="w-4 h-4 text-[#b85d34] shrink-0" />}
          <span className={`truncate text-left ${hasValue ? 'font-bold text-[#141c19]' : 'text-stone-400 font-normal'}`}>
            {displayLabel}
          </span>
        </div>

        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
            variant === 'hero' ? 'text-stone-600' : 'text-[#b85d34]'
          } ${isOpen ? (placement === 'top' ? '-rotate-180 text-[#b85d34]' : 'rotate-180 text-[#b85d34]') : ''}`}
        />
      </button>

      {/* Popover Dropdown Menu (Solid 100% Opaque Container) */}
      {isOpen && (
        <div
          role="listbox"
          className={`absolute left-0 ${placementClass} z-50 rounded-2xl bg-white border-2 border-[#d4a359]/70 shadow-2xl text-[#141c19] text-left overflow-hidden animate-in fade-in zoom-in-95 duration-150 w-full min-w-full sm:min-w-[260px] max-w-[420px]`}
        >
          {/* Search Bar */}
          {searchable && (
            <div className="p-2.5 border-b border-[#ebe3d3] bg-[#faf8f5] sticky top-0 z-10 flex items-center gap-2 text-left">
              <Search className="w-3.5 h-3.5 text-[#b85d34] shrink-0 ml-1" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-transparent text-xs text-[#141c19] placeholder:text-stone-400 outline-none font-medium py-1 px-1 text-left"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-stone-400 hover:text-stone-700 p-1 rounded-md cursor-pointer hover:bg-stone-200/50"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-1 custom-scrollbar text-left bg-white">
            {/* Allow Custom Quick Action */}
            {allowCustom && searchQuery.trim() && !filteredOptions.some(o => o.value?.toLowerCase() === searchQuery.trim().toLowerCase()) && (
              <div
                role="option"
                onClick={() => {
                  onChange(searchQuery.trim());
                  setIsOpen(false);
                  setSearchQuery('');
                }}
                className="p-2.5 my-1 rounded-xl bg-[#fdf6ec] hover:bg-[#faebd4] border border-[#d4a359] text-[#ba4c18] font-bold text-xs cursor-pointer flex items-center justify-between transition-all"
              >
                <div className="flex flex-col text-left min-w-0 pr-2">
                  <span className="truncate">Use &ldquo;{searchQuery.trim()}&rdquo;</span>
                  <span className="text-[10px] text-stone-500 font-normal">Add as custom area / location</span>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-[#ba4c18] text-white text-[10.5px] font-bold shrink-0 shadow-2xs">
                  + Select
                </span>
              </div>
            )}

            {filteredOptions.length === 0 && (!allowCustom || !searchQuery.trim()) ? (
              <div className="p-4 text-center text-xs text-stone-500 font-medium">
                No matching options found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                const isSpecial = opt.value === '__other__' || opt.isAction;

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
                        ? 'bg-[#0c2217] text-[#faf8f5] font-bold shadow-md'
                        : isSpecial
                        ? 'text-[#ba4c18] font-bold bg-[#fdfaf4] hover:bg-[#faebd4] border-t border-[#f0e6d6] mt-1'
                        : 'text-stone-800 hover:bg-[#f5f0e6] hover:text-[#0c2217]'
                    }`}
                  >
                    <div className="flex flex-col min-w-0 text-left">
                      <span className={`truncate text-left ${
                        isSelected
                          ? 'text-[#faf8f5] font-bold'
                          : isSpecial
                          ? 'text-[#ba4c18] font-bold'
                          : 'text-[#141c19] font-semibold'
                      }`}>
                        {opt.label}
                      </span>
                      {opt.sublabel && (
                        <span className={`text-[10px] truncate text-left ${
                          isSelected ? 'text-[#d4a359]' : 'text-stone-500'
                        }`}>
                          {opt.sublabel}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {opt.sublabel && !isSelected && !isSpecial && (
                        <span className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-[#faf8f5] text-stone-600 border border-[#ebe3d3]">
                          {opt.sublabel.split(' ')[0]}
                        </span>
                      )}
                      {isSelected && (
                        <Check className="w-4 h-4 text-[#d4a359] shrink-0" />
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

/**
 * Reusable StyledNativeSelect wrapper for professional, modern selects
 * Replaces unstyled native OS dropdowns with consistent IlmiDunya styling
 */
export function StyledNativeSelect({
  value,
  onChange,
  children,
  icon: Icon,
  className = '',
  selectClassName = '',
  disabled = false,
  required = false,
  name,
  id
}) {
  return (
    <div className={`relative w-full ${className}`}>
      {Icon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#b85d34] z-10">
          <Icon className="w-4 h-4" />
        </div>
      )}
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`w-full appearance-none bg-[#faf8f5] hover:bg-white focus:bg-white border border-[#e6ded1] hover:border-[#d4a359] focus:border-[#0c2217] focus:ring-2 focus:ring-[#d4a359]/20 rounded-2xl ${
          Icon ? 'pl-10' : 'pl-4'
        } pr-10 py-2.5 text-xs text-slate-900 font-semibold cursor-pointer shadow-2xs transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed ${selectClassName}`}
      >
        {children}
      </select>
      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#b85d34]">
        <ChevronDown className="w-4 h-4" />
      </div>
    </div>
  );
}

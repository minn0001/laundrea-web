import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, X } from 'lucide-react';

export interface PhotonAddressResult {
  formatted: string;
  name?: string;
  street?: string;
  district?: string;
  city?: string;
  state?: string;
  country?: string;
}

interface PhotonAddressInputProps {
  initialValue?: string;
  onChange: (value: string) => void;
  required?: boolean;
  idPrefix?: string;
  placeholder?: string;
  helperText?: string;
}

export const PhotonAddressInput: React.FC<PhotonAddressInputProps> = ({
  initialValue = '',
  onChange,
  required = true,
  idPrefix = 'addr',
  placeholder = 'Ketik nama jalan, komplek, atau area (min. 3 karakter)...',
  helperText = 'Tulis alamat selengkap mungkin: nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan, kota, dan patokan.',
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [fullAddress, setFullAddress] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync external initialValue if it changes externally
  useEffect(() => {
    if (initialValue && initialValue !== fullAddress) {
      setFullAddress(initialValue);
      setSearchTerm(initialValue);
    }
  }, [initialValue]);

  // Click outside to close suggestion dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Clear debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (val.trim().length < 3) {
      setSuggestions([]);
      setIsLoading(false);
      setIsDropdownOpen(false);
      return;
    }

    // 400ms debounce
    debounceTimerRef.current = setTimeout(async () => {
      setIsLoading(true);
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        // Bias to Indonesia with lat/lon approximate center (e.g. lat=-6.2, lon=106.81 or bbox/bias)
        // Photon supports &lang=en&limit=5&lat=-6.2088&lon=106.8456 or standard q with Indonesia bias
        const query = encodeURIComponent(val.trim());
        const res = await fetch(
          `https://photon.komoot.io/api/?q=${query}&limit=5&lang=en&lat=-6.2088&lon=106.8456`,
          { signal: controller.signal }
        );

        if (!res.ok) {
          throw new Error(`Photon status ${res.status}`);
        }

        const data = await res.json();
        if (data && Array.isArray(data.features)) {
          const list: string[] = [];
          for (const feat of data.features) {
            const p = feat.properties || {};
            // Build nice Indonesian format: street, kelurahan/district, city, state
            const parts: string[] = [];
            if (p.name) parts.push(p.name);
            if (p.street && p.street !== p.name) parts.push(p.street);
            if (p.district) parts.push(p.district);
            if (p.city && p.city !== p.district) parts.push(p.city);
            if (p.state) parts.push(p.state);

            const label = parts.length > 0 ? parts.join(', ') : p.name || val;
            if (!list.includes(label)) {
              list.push(label);
            }
          }
          setSuggestions(list);
          setIsDropdownOpen(list.length > 0);
        } else {
          setSuggestions([]);
          setIsDropdownOpen(false);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          // Never block submission, silently fallback to manual typing
          setSuggestions([]);
          setIsDropdownOpen(false);
        }
      } finally {
        setIsLoading(false);
      }
    }, 400);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setSearchTerm(suggestion);
    setIsDropdownOpen(false);
    setSuggestions([]);

    // If textarea is empty or just matches search, populate or append
    setFullAddress((prev) => {
      let next = prev.trim();
      if (!next || next === searchTerm) {
        next = suggestion;
      } else if (!next.includes(suggestion)) {
        next = `${next}, ${suggestion}`;
      }
      onChange(next);
      return next;
    });
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setFullAddress(val);
    onChange(val);
  };

  return (
    <div className="space-y-3" ref={dropdownRef}>
      {/* 1. Search field with live suggestions using Photon API */}
      <div>
        <label
          htmlFor={`${idPrefix}-search`}
          className="block text-[11px] font-bold text-[#254117] mb-1"
        >
          Cari Lokasi / Area (Autocomplete)
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#254117]/50">
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#cd6184]" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </div>
          <input
            id={`${idPrefix}-search`}
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setIsDropdownOpen(true);
            }}
            placeholder={placeholder}
            className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-[#254117] placeholder:text-gray-400 focus:outline-none focus:border-[#cd6184] focus:ring-1 focus:ring-[#cd6184]/20 transition-all shadow-xs"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSuggestions([]);
                setIsDropdownOpen(false);
              }}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Autocomplete Dropdown List */}
          {isDropdownOpen && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-40 animate-in fade-in max-h-56 overflow-y-auto">
              <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Pilih Saran Alamat:
              </div>
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSuggestion(item)}
                  className="w-full text-left px-3.5 py-2 hover:bg-[#ffecf2]/50 text-xs font-medium text-[#254117] flex items-start gap-2 cursor-pointer transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#cd6184] shrink-0 mt-0.5" />
                  <span className="line-clamp-2 leading-relaxed">{item}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Required Textarea: Alamat Lengkap with standard helper text */}
      <div>
        <label
          htmlFor={`${idPrefix}-full`}
          className="block text-[11px] font-bold text-[#254117] mb-1"
        >
          Alamat Lengkap {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <textarea
            id={`${idPrefix}-full`}
            rows={3}
            value={fullAddress}
            onChange={handleTextareaChange}
            placeholder="Contoh: Jl. Senopati No. 42, RT 02/RW 05, Kel. Selong, Kec. Kebayoran Baru, Jakarta Selatan (Pagar hitam samping pos satpam)"
            required={required}
            className="w-full p-3 rounded-xl border border-gray-200 bg-white text-xs font-medium text-[#254117] placeholder:text-gray-400 focus:outline-none focus:border-[#cd6184] focus:ring-1 focus:ring-[#cd6184]/20 transition-all resize-none shadow-xs"
          />
        </div>
        <p className="text-[11px] text-[#254117]/60 mt-1 leading-relaxed">
          {helperText}
        </p>
      </div>
    </div>
  );
};

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
  helperText = 'Tulis ciri khas lokasi supaya kurir mudah menemukan, misalnya warna pagar atau bangunan terdekat.',
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [patokan, setPatokan] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Gabungkan alamat (autocomplete) + patokan, lalu kirim ke komponen induk
  const emit = (addr: string, pat: string) => {
    const a = addr.trim();
    const p = pat.trim();
    onChange(a ? (p ? `${a} (Patokan: ${p})` : a) : '');
  };

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
    emit(val, patokan);

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
    emit(suggestion, patokan);
  };

  const handlePatokanChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setPatokan(val);
    emit(searchTerm, val);
  };

  return (
    <div className="space-y-3" ref={dropdownRef}>
      {/* 1. Alamat: cari dengan autocomplete Photon, boleh juga diketik manual */}
      <div>
        <label
          htmlFor={`${idPrefix}-search`}
          className="block text-[11px] font-bold text-[#254117] mb-1"
        >
          Cari Lokasi / Area (Autocomplete) {required && <span className="text-red-500">*</span>}
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
            required={required}
            className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-[#254117] placeholder:text-gray-400 focus:outline-none focus:border-[#cd6184] focus:ring-1 focus:ring-[#cd6184]/20 transition-all shadow-xs"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSuggestions([]);
                setIsDropdownOpen(false);
                emit('', patokan);
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

      {/* 2. Patokan */}
      <div>
        <label
          htmlFor={`${idPrefix}-patokan`}
          className="block text-[11px] font-bold text-[#254117] mb-1"
        >
          Patokan
        </label>
        <textarea
          id={`${idPrefix}-patokan`}
          rows={2}
          value={patokan}
          onChange={handlePatokanChange}
          placeholder="Contoh: Dekat Indomaret, pagar hitam, lantai 2"
          className="w-full p-3 rounded-xl border border-gray-200 bg-white text-xs font-medium text-[#254117] placeholder:text-gray-400 focus:outline-none focus:border-[#cd6184] focus:ring-1 focus:ring-[#cd6184]/20 transition-all resize-none shadow-xs"
        />
        <p className="text-[11px] text-[#254117]/60 mt-1 leading-relaxed">
          {helperText}
        </p>
      </div>
    </div>
  );
};

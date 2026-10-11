import React, { useState, useEffect, useRef } from 'react';
import {
  WilayahItem,
  StructuredAddressData,
  getProvinces,
  getRegencies,
  getDistricts,
  getVillages,
  formatWilayahName,
  buildCombinedAddress,
  wilayahCache,
} from '../../services/wilayahService';
import { Loader2, AlertCircle, MapPin, RefreshCw } from 'lucide-react';

interface CascadingAddressSelectorProps {
  initialCombinedAddress?: string;
  initialStructured?: StructuredAddressData;
  onChange: (data: {
    combinedAddress: string;
    structured: StructuredAddressData;
    isValid: boolean;
  }) => void;
  required?: boolean;
  idPrefix?: string;
}

export const CascadingAddressSelector: React.FC<CascadingAddressSelectorProps> = ({
  initialCombinedAddress = '',
  initialStructured,
  onChange,
  required = true,
  idPrefix = 'address',
}) => {
  // Lists for dropdown options
  const [provinces, setProvinces] = useState<WilayahItem[]>([]);
  const [regencies, setRegencies] = useState<WilayahItem[]>([]);
  const [districts, setDistricts] = useState<WilayahItem[]>([]);
  const [villages, setVillages] = useState<WilayahItem[]>([]);

  // Selected values (holding both ID and Name)
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>(
    initialStructured?.provinceId || ''
  );
  const [selectedProvinceName, setSelectedProvinceName] = useState<string>(
    initialStructured?.provinceName || ''
  );

  const [selectedRegencyId, setSelectedRegencyId] = useState<string>(
    initialStructured?.regencyId || ''
  );
  const [selectedRegencyName, setSelectedRegencyName] = useState<string>(
    initialStructured?.regencyName || ''
  );

  const [selectedDistrictId, setSelectedDistrictId] = useState<string>(
    initialStructured?.districtId || ''
  );
  const [selectedDistrictName, setSelectedDistrictName] = useState<string>(
    initialStructured?.districtName || ''
  );

  const [selectedVillageId, setSelectedVillageId] = useState<string>(
    initialStructured?.villageId || ''
  );
  const [selectedVillageName, setSelectedVillageName] = useState<string>(
    initialStructured?.villageName || ''
  );

  // Required Textarea: Alamat Lengkap (jalan, nomor, RT/RW, patokan)
  const [streetAddress, setStreetAddress] = useState<string>(() => {
    if (initialStructured?.streetAddress) return initialStructured.streetAddress;
    if (initialCombinedAddress) {
      const parts = initialCombinedAddress.split(',');
      return parts[0]?.trim() || initialCombinedAddress;
    }
    return '';
  });

  // Always render four select dropdowns by default.
  // Switch to plain text inputs only if every request option still fails.
  const [isManualFallback, setIsManualFallback] = useState<boolean>(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  // Manual fallback inputs (only used when isManualFallback is true)
  const [manualProvince, setManualProvince] = useState<string>(
    initialStructured?.provinceName || ''
  );
  const [manualRegency, setManualRegency] = useState<string>(
    initialStructured?.regencyName || ''
  );
  const [manualDistrict, setManualDistrict] = useState<string>(
    initialStructured?.districtName || ''
  );
  const [manualVillage, setManualVillage] = useState<string>(
    initialStructured?.villageName || ''
  );

  // Loading states
  const [isLoadingProvinces, setIsLoadingProvinces] = useState<boolean>(false);
  const [isLoadingRegencies, setIsLoadingRegencies] = useState<boolean>(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState<boolean>(false);
  const [isLoadingVillages, setIsLoadingVillages] = useState<boolean>(false);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Function to load regencies for a given province ID
  const fetchAndSetRegencies = async (provinceId: string, preselectRegId?: string) => {
    if (!provinceId) {
      setRegencies([]);
      return;
    }
    setIsLoadingRegencies(true);
    try {
      const regList = await getRegencies(provinceId);
      setRegencies(regList);
      setIsLoadingRegencies(false);

      const targetRegId = preselectRegId || selectedRegencyId;
      if (targetRegId) {
        const found = regList.find((r) => r.id === targetRegId);
        if (found) {
          setSelectedRegencyId(found.id);
          setSelectedRegencyName(found.name);
          fetchAndSetDistricts(found.id);
        }
      } else if (initialCombinedAddress) {
        // Try auto-matching regency from existing address string (e.g. "Jakarta Selatan")
        const lowerAddr = initialCombinedAddress.toLowerCase();
        const matchReg = regList.find((r) =>
          lowerAddr.includes(r.name.toLowerCase().replace('kota ', '').replace('kabupaten ', ''))
        );
        if (matchReg) {
          setSelectedRegencyId(matchReg.id);
          setSelectedRegencyName(matchReg.name);
          fetchAndSetDistricts(matchReg.id);
        }
      }
    } catch (err: any) {
      console.error('Gagal memuat daftar Kota/Kabupaten:', err);
      setIsLoadingRegencies(false);
      setErrorCode(err?.code || 'jaringan');
      setIsManualFallback(true);
    }
  };

  // Function to load districts for a given regency ID
  const fetchAndSetDistricts = async (regencyId: string, preselectDistId?: string) => {
    if (!regencyId) {
      setDistricts([]);
      return;
    }
    setIsLoadingDistricts(true);
    try {
      const distList = await getDistricts(regencyId);
      setDistricts(distList);
      setIsLoadingDistricts(false);

      const targetDistId = preselectDistId || selectedDistrictId;
      if (targetDistId) {
        const found = distList.find((d) => d.id === targetDistId);
        if (found) {
          setSelectedDistrictId(found.id);
          setSelectedDistrictName(found.name);
          fetchAndSetVillages(found.id);
        }
      } else if (initialCombinedAddress) {
        const lowerAddr = initialCombinedAddress.toLowerCase();
        const matchDist = distList.find((d) =>
          lowerAddr.includes(d.name.toLowerCase())
        );
        if (matchDist) {
          setSelectedDistrictId(matchDist.id);
          setSelectedDistrictName(matchDist.name);
          fetchAndSetVillages(matchDist.id);
        }
      }
    } catch (err: any) {
      console.error('Gagal memuat daftar Kecamatan:', err);
      setIsLoadingDistricts(false);
      setErrorCode(err?.code || 'jaringan');
      setIsManualFallback(true);
    }
  };

  // Function to load villages for a given district ID
  const fetchAndSetVillages = async (districtId: string, preselectVilId?: string) => {
    if (!districtId) {
      setVillages([]);
      return;
    }
    setIsLoadingVillages(true);
    try {
      const vilList = await getVillages(districtId);
      setVillages(vilList);
      setIsLoadingVillages(false);

      const targetVilId = preselectVilId || selectedVillageId;
      if (targetVilId) {
        const found = vilList.find((v) => v.id === targetVilId);
        if (found) {
          setSelectedVillageId(found.id);
          setSelectedVillageName(found.name);
        }
      } else if (initialCombinedAddress) {
        const lowerAddr = initialCombinedAddress.toLowerCase();
        const matchVil = vilList.find((v) =>
          lowerAddr.includes(v.name.toLowerCase())
        );
        if (matchVil) {
          setSelectedVillageId(matchVil.id);
          setSelectedVillageName(matchVil.name);
        }
      }
    } catch (err: any) {
      console.error('Gagal memuat daftar Kelurahan/Desa:', err);
      setIsLoadingVillages(false);
      setErrorCode(err?.code || 'jaringan');
      setIsManualFallback(true);
    }
  };

  // Load provinces on mount and preselect DKI JAKARTA (id: 31)
  const loadInitialProvinces = async () => {
    setIsLoadingProvinces(true);
    setIsManualFallback(false);
    setErrorCode(null);

    try {
      const provList = await getProvinces();
      setProvinces(provList);
      setIsLoadingProvinces(false);

      // Pre-select "DKI JAKARTA" (match by name, case-insensitive; its id is 31)
      let targetProvId = selectedProvinceId;
      let targetProvName = selectedProvinceName;

      if (!targetProvId) {
        const dki = provList.find(
          (p) => p.name.toUpperCase().includes('DKI JAKARTA') || p.id === '31'
        );
        if (dki) {
          targetProvId = dki.id;
          targetProvName = dki.name;
          setSelectedProvinceId(dki.id);
          setSelectedProvinceName(dki.name);
        }
      }

      // Automatically load its regencies
      if (targetProvId) {
        await fetchAndSetRegencies(targetProvId);
      }
    } catch (err: any) {
      console.error('Gagal memuat daftar Provinsi dari API Wilayah:', err);
      setIsLoadingProvinces(false);
      setErrorCode(err?.code || 'jaringan');
      setIsManualFallback(true);
    }
  };

  useEffect(() => {
    loadInitialProvinces();
  }, []);

  // Handle Retry button when fallback is shown
  const handleRetry = () => {
    wilayahCache.clear();
    loadInitialProvinces();
  };

  // 1. Changing Province clears and disables all lower selects
  const handleProvinceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provId = e.target.value;
    const provObj = provinces.find((p) => p.id === provId);
    setSelectedProvinceId(provId);
    setSelectedProvinceName(provObj?.name || '');

    // Clear lower levels
    setSelectedRegencyId('');
    setSelectedRegencyName('');
    setSelectedDistrictId('');
    setSelectedDistrictName('');
    setSelectedVillageId('');
    setSelectedVillageName('');
    setRegencies([]);
    setDistricts([]);
    setVillages([]);

    if (provId) {
      await fetchAndSetRegencies(provId);
    }
  };

  // 2. Changing Regency clears and disables all lower selects
  const handleRegencyChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const regId = e.target.value;
    const regObj = regencies.find((r) => r.id === regId);
    setSelectedRegencyId(regId);
    setSelectedRegencyName(regObj?.name || '');

    // Clear lower levels
    setSelectedDistrictId('');
    setSelectedDistrictName('');
    setSelectedVillageId('');
    setSelectedVillageName('');
    setDistricts([]);
    setVillages([]);

    if (regId) {
      await fetchAndSetDistricts(regId);
    }
  };

  // 3. Changing District clears and disables village select
  const handleDistrictChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const distId = e.target.value;
    const distObj = districts.find((d) => d.id === distId);
    setSelectedDistrictId(distId);
    setSelectedDistrictName(distObj?.name || '');

    // Clear village
    setSelectedVillageId('');
    setSelectedVillageName('');
    setVillages([]);

    if (distId) {
      await fetchAndSetVillages(distId);
    }
  };

  // 4. Changing Village
  const handleVillageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const vilId = e.target.value;
    const vilObj = villages.find((v) => v.id === vilId);
    setSelectedVillageId(vilId);
    setSelectedVillageName(vilObj?.name || '');
  };

  // Emit synchronized address state to parent whenever changes happen
  useEffect(() => {
    const provName = isManualFallback ? manualProvince : selectedProvinceName;
    const regName = isManualFallback ? manualRegency : selectedRegencyName;
    const distName = isManualFallback ? manualDistrict : selectedDistrictName;
    const vilName = isManualFallback ? manualVillage : selectedVillageName;

    const combined = buildCombinedAddress({
      streetAddress,
      villageName: vilName,
      districtName: distName,
      regencyName: regName,
      provinceName: provName,
    });

    const structured: StructuredAddressData = {
      provinceId: selectedProvinceId,
      provinceName: provName,
      regencyId: selectedRegencyId,
      regencyName: regName,
      districtId: selectedDistrictId,
      districtName: distName,
      villageId: selectedVillageId,
      villageName: vilName,
      streetAddress: streetAddress.trim(),
      combinedAddress: combined,
    };

    const hasStreet = streetAddress.trim().length > 0;
    const hasFullRegions =
      Boolean(provName.trim()) &&
      Boolean(regName.trim()) &&
      Boolean(distName.trim()) &&
      Boolean(vilName.trim());

    const isValid = required
      ? hasStreet && hasFullRegions
      : hasStreet || hasFullRegions;

    onChangeRef.current({
      combinedAddress: combined || initialCombinedAddress,
      structured,
      isValid: Boolean(isValid || (initialCombinedAddress && streetAddress.trim().length > 0)),
    });
  }, [
    isManualFallback,
    streetAddress,
    selectedProvinceId,
    selectedProvinceName,
    selectedRegencyId,
    selectedRegencyName,
    selectedDistrictId,
    selectedDistrictName,
    selectedVillageId,
    selectedVillageName,
    manualProvince,
    manualRegency,
    manualDistrict,
    manualVillage,
    required,
    initialCombinedAddress,
  ]);

  return (
    <div className="space-y-3">
      {/* If both base URLs fail, show message with error code and "Coba lagi" button */}
      {isManualFallback && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-2 text-xs text-amber-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>
              Daftar wilayah tidak dapat dimuat (kode: {errorCode || 'jaringan'}), isi manual.
            </span>
          </div>
          <button
            type="button"
            onClick={handleRetry}
            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold rounded-lg text-[11px] transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Coba lagi</span>
          </button>
        </div>
      )}

      {/* 4 Dependent Cascading Select Dropdowns (Default) or Plain Text Inputs (Fallback only) */}
      {isManualFallback ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Plain Text Fallback: 1. Provinsi */}
          <div>
            <label className="block text-[11px] font-bold text-[#254117] mb-1">
              Provinsi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={manualProvince}
              onChange={(e) => setManualProvince(e.target.value)}
              placeholder="Contoh: DKI Jakarta"
              required={required}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-[#254117] focus:outline-none focus:border-[#cd6184]"
            />
          </div>

          {/* Plain Text Fallback: 2. Kota / Kabupaten */}
          <div>
            <label className="block text-[11px] font-bold text-[#254117] mb-1">
              Kota / Kabupaten <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={manualRegency}
              onChange={(e) => setManualRegency(e.target.value)}
              placeholder="Contoh: Kota Jakarta Selatan"
              required={required}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-[#254117] focus:outline-none focus:border-[#cd6184]"
            />
          </div>

          {/* Plain Text Fallback: 3. Kecamatan */}
          <div>
            <label className="block text-[11px] font-bold text-[#254117] mb-1">
              Kecamatan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={manualDistrict}
              onChange={(e) => setManualDistrict(e.target.value)}
              placeholder="Contoh: Kebayoran Baru"
              required={required}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-[#254117] focus:outline-none focus:border-[#cd6184]"
            />
          </div>

          {/* Plain Text Fallback: 4. Kelurahan / Desa */}
          <div>
            <label className="block text-[11px] font-bold text-[#254117] mb-1">
              Kelurahan / Desa <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={manualVillage}
              onChange={(e) => setManualVillage(e.target.value)}
              placeholder="Contoh: Senayan"
              required={required}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-[#254117] focus:outline-none focus:border-[#cd6184]"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* 1. Provinsi Dropdown */}
          <div>
            <label
              htmlFor={`${idPrefix}-province`}
              className="block text-[11px] font-bold text-[#254117] mb-1"
            >
              Provinsi <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id={`${idPrefix}-province`}
                value={selectedProvinceId}
                onChange={handleProvinceChange}
                disabled={isLoadingProvinces}
                required={required}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-[#254117] focus:outline-none focus:border-[#cd6184] transition-colors disabled:bg-gray-50"
              >
                <option value="">
                  {isLoadingProvinces ? 'Memuat...' : 'Pilih Provinsi'}
                </option>
                {provinces.map((p) => (
                  <option key={p.id} value={p.id}>
                    {formatWilayahName(p.name)}
                  </option>
                ))}
              </select>
              {isLoadingProvinces && (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#cd6184] absolute right-3 top-3 pointer-events-none" />
              )}
            </div>
          </div>

          {/* 2. Kota / Kabupaten Dropdown (Disabled until Province chosen) */}
          <div>
            <label
              htmlFor={`${idPrefix}-regency`}
              className="block text-[11px] font-bold text-[#254117] mb-1"
            >
              Kota / Kabupaten <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id={`${idPrefix}-regency`}
                value={selectedRegencyId}
                onChange={handleRegencyChange}
                disabled={!selectedProvinceId || isLoadingRegencies}
                required={required}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-[#254117] focus:outline-none focus:border-[#cd6184] transition-colors disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="">
                  {isLoadingRegencies
                    ? 'Memuat...'
                    : !selectedProvinceId
                    ? 'Pilih provinsi terlebih dahulu'
                    : 'Pilih Kota / Kabupaten'}
                </option>
                {regencies.map((r) => (
                  <option key={r.id} value={r.id}>
                    {formatWilayahName(r.name)}
                  </option>
                ))}
              </select>
              {isLoadingRegencies && (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#cd6184] absolute right-3 top-3 pointer-events-none" />
              )}
            </div>
          </div>

          {/* 3. Kecamatan Dropdown (Disabled until Regency chosen) */}
          <div>
            <label
              htmlFor={`${idPrefix}-district`}
              className="block text-[11px] font-bold text-[#254117] mb-1"
            >
              Kecamatan <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id={`${idPrefix}-district`}
                value={selectedDistrictId}
                onChange={handleDistrictChange}
                disabled={!selectedRegencyId || isLoadingDistricts}
                required={required}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-[#254117] focus:outline-none focus:border-[#cd6184] transition-colors disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="">
                  {isLoadingDistricts
                    ? 'Memuat...'
                    : !selectedRegencyId
                    ? 'Pilih kota/kabupaten terlebih dahulu'
                    : 'Pilih Kecamatan'}
                </option>
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {formatWilayahName(d.name)}
                  </option>
                ))}
              </select>
              {isLoadingDistricts && (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#cd6184] absolute right-3 top-3 pointer-events-none" />
              )}
            </div>
          </div>

          {/* 4. Kelurahan / Desa Dropdown (Disabled until District chosen) */}
          <div>
            <label
              htmlFor={`${idPrefix}-village`}
              className="block text-[11px] font-bold text-[#254117] mb-1"
            >
              Kelurahan / Desa <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id={`${idPrefix}-village`}
                value={selectedVillageId}
                onChange={handleVillageChange}
                disabled={!selectedDistrictId || isLoadingVillages}
                required={required}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-[#254117] focus:outline-none focus:border-[#cd6184] transition-colors disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="">
                  {isLoadingVillages
                    ? 'Memuat...'
                    : !selectedDistrictId
                    ? 'Pilih kecamatan terlebih dahulu'
                    : 'Pilih Kelurahan / Desa'}
                </option>
                {villages.map((v) => (
                  <option key={v.id} value={v.id}>
                    {formatWilayahName(v.name)}
                  </option>
                ))}
              </select>
              {isLoadingVillages && (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#cd6184] absolute right-3 top-3 pointer-events-none" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Required Textarea: Alamat Lengkap (jalan, nomor, RT/RW, patokan) */}
      <div>
        <label
          htmlFor={`${idPrefix}-street`}
          className="block text-[11px] font-bold text-[#254117] mb-1"
        >
          Alamat Lengkap (jalan, nomor, RT/RW, patokan) <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute top-2.5 left-3 pointer-events-none text-[#254117]/40">
            <MapPin className="w-4 h-4" />
          </div>
          <textarea
            id={`${idPrefix}-street`}
            rows={2}
            value={streetAddress}
            onChange={(e) => setStreetAddress(e.target.value)}
            placeholder="Contoh: Jl. Senopati No. 42, RT 02/RW 05, pagar hitam samping pos"
            required={required}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-medium text-[#254117] placeholder:text-gray-400 focus:outline-none focus:border-[#cd6184] focus:ring-1 focus:ring-[#cd6184]/20 transition-all resize-none"
          />
        </div>
      </div>
    </div>
  );
};

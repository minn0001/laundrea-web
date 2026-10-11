/**
 * Service for fetching and caching Indonesian administrative territory data (Wilayah Indonesia)
 * Primary Base URL: https://emsifa.com/api-wilayah-indonesia/api/
 * Secondary Fallback URL: https://emsifa.github.io/api-wilayah-indonesia/api/
 */

export interface WilayahItem {
  id: string;
  name: string;
  province_id?: string;
  regency_id?: string;
  district_id?: string;
}

export interface StructuredAddressData {
  provinceId?: string;
  provinceName?: string;
  regencyId?: string;
  regencyName?: string;
  districtId?: string;
  districtName?: string;
  villageId?: string;
  villageName?: string;
  streetAddress?: string;
  combinedAddress?: string;
}

export const PRIMARY_BASE_URL = 'https://emsifa.com/api-wilayah-indonesia/api/';
export const SECONDARY_BASE_URL = 'https://emsifa.github.io/api-wilayah-indonesia/api/';

// In-memory cache across component re-renders
export const wilayahCache = {
  provinces: null as WilayahItem[] | null,
  regencies: new Map<string, WilayahItem[]>(),
  districts: new Map<string, WilayahItem[]>(),
  villages: new Map<string, WilayahItem[]>(),
  clear() {
    this.provinces = null;
    this.regencies.clear();
    this.districts.clear();
    this.villages.clear();
  },
};

/**
 * Plain fetch without custom headers checking response.ok.
 * 1. Primary: https://emsifa.com/api-wilayah-indonesia/api/
 * 2. If primary fails, retry once with secondary: https://emsifa.github.io/api-wilayah-indonesia/api/
 * 3. If both fail, logs real reason via console.error and throws with code ({status} or 'jaringan').
 */
async function fetchWilayahEndpoint<T>(endpoint: string): Promise<T> {
  let primaryError: any = null;
  let primaryStatus: number | null = null;

  // 1. Primary Base URL Attempt (plain fetch without custom headers)
  try {
    const primaryUrl = `${PRIMARY_BASE_URL}${endpoint}`;
    const res = await fetch(primaryUrl);
    if (res.ok) {
      return (await res.json()) as T;
    }
    primaryStatus = res.status;
    primaryError = new Error(`Primary endpoint returned HTTP ${res.status}`);
  } catch (err: any) {
    primaryError = err;
  }

  // 2. Retry once with Secondary Base URL (old base URL)
  let secondaryStatus: number | null = null;
  try {
    const secondaryUrl = `${SECONDARY_BASE_URL}${endpoint}`;
    const res = await fetch(secondaryUrl);
    if (res.ok) {
      return (await res.json()) as T;
    }
    secondaryStatus = res.status;
    const secondaryErr = new Error(`Secondary endpoint returned HTTP ${res.status}`);
    const code = String(secondaryStatus || primaryStatus || 'jaringan');
    console.error('Wilayah API error on both primary and secondary base URLs:', {
      endpoint,
      primaryUrl: `${PRIMARY_BASE_URL}${endpoint}`,
      secondaryUrl: `${SECONDARY_BASE_URL}${endpoint}`,
      primaryError,
      secondaryError: secondaryErr,
      statusCode: secondaryStatus,
    });
    const finalErr: any = new Error(`Daftar wilayah tidak dapat dimuat (kode: ${code}), isi manual.`);
    finalErr.code = code;
    finalErr.realError = secondaryErr;
    throw finalErr;
  } catch (err: any) {
    if (err.code) throw err;

    const code = secondaryStatus
      ? String(secondaryStatus)
      : primaryStatus
      ? String(primaryStatus)
      : 'jaringan';

    console.error('Wilayah API error on both primary and secondary base URLs (network/cors):', {
      endpoint,
      primaryUrl: `${PRIMARY_BASE_URL}${endpoint}`,
      secondaryUrl: `${SECONDARY_BASE_URL}${endpoint}`,
      primaryError,
      secondaryError: err,
      code,
    });
    const finalErr: any = new Error(`Daftar wilayah tidak dapat dimuat (kode: ${code}), isi manual.`);
    finalErr.code = code;
    finalErr.realError = err;
    throw finalErr;
  }
}

/**
 * Fetch all provinces, sorted alphabetically, cached in memory
 */
export async function getProvinces(): Promise<WilayahItem[]> {
  if (wilayahCache.provinces) {
    return wilayahCache.provinces;
  }
  const data = await fetchWilayahEndpoint<WilayahItem[]>('provinces.json');
  data.sort((a, b) => a.name.localeCompare(b.name, 'id'));
  wilayahCache.provinces = data;
  return data;
}

/**
 * Fetch regencies (Kota/Kabupaten) for a province, sorted alphabetically, cached in memory
 */
export async function getRegencies(provinceId: string): Promise<WilayahItem[]> {
  if (wilayahCache.regencies.has(provinceId)) {
    return wilayahCache.regencies.get(provinceId)!;
  }
  const data = await fetchWilayahEndpoint<WilayahItem[]>(`regencies/${provinceId}.json`);
  data.sort((a, b) => a.name.localeCompare(b.name, 'id'));
  wilayahCache.regencies.set(provinceId, data);
  return data;
}

/**
 * Fetch districts (Kecamatan) for a regency, sorted alphabetically, cached in memory
 */
export async function getDistricts(regencyId: string): Promise<WilayahItem[]> {
  if (wilayahCache.districts.has(regencyId)) {
    return wilayahCache.districts.get(regencyId)!;
  }
  const data = await fetchWilayahEndpoint<WilayahItem[]>(`districts/${regencyId}.json`);
  data.sort((a, b) => a.name.localeCompare(b.name, 'id'));
  wilayahCache.districts.set(regencyId, data);
  return data;
}

/**
 * Fetch villages (Kelurahan/Desa) for a district, sorted alphabetically, cached in memory
 */
export async function getVillages(districtId: string): Promise<WilayahItem[]> {
  if (wilayahCache.villages.has(districtId)) {
    return wilayahCache.villages.get(districtId)!;
  }
  const data = await fetchWilayahEndpoint<WilayahItem[]>(`villages/${districtId}.json`);
  data.sort((a, b) => a.name.localeCompare(b.name, 'id'));
  wilayahCache.villages.set(districtId, data);
  return data;
}

/**
 * Format administrative names to Indonesian Title Case (keeping DKI/DI and roman numerals)
 */
export function formatWilayahName(name?: string): string {
  if (!name) return '';
  const trimmed = name.trim();
  if (trimmed.toUpperCase() === 'DKI JAKARTA') return 'DKI Jakarta';
  if (trimmed.toUpperCase() === 'DI YOGYAKARTA') return 'DI Yogyakarta';

  return trimmed
    .toLowerCase()
    .split(' ')
    .map((word) => {
      if (['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'].includes(word)) {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Build combined address string according to specification:
 * “{alamat lengkap}, Kel. {kelurahan}, Kec. {kecamatan}, {kota}, {provinsi}”
 */
export function buildCombinedAddress(params: {
  streetAddress: string;
  villageName?: string;
  districtName?: string;
  regencyName?: string;
  provinceName?: string;
}): string {
  const street = params.streetAddress.trim();
  const parts: string[] = [];

  if (street) parts.push(street);

  if (params.villageName) {
    const raw = formatWilayahName(params.villageName).trim();
    const formatted = raw.toLowerCase().startsWith('kel. ') ? raw : `Kel. ${raw}`;
    parts.push(formatted);
  }

  if (params.districtName) {
    const raw = formatWilayahName(params.districtName).trim();
    const formatted = raw.toLowerCase().startsWith('kec. ') ? raw : `Kec. ${raw}`;
    parts.push(formatted);
  }

  if (params.regencyName) {
    parts.push(formatWilayahName(params.regencyName).trim());
  }

  if (params.provinceName) {
    parts.push(formatWilayahName(params.provinceName).trim());
  }

  return parts.join(', ');
}

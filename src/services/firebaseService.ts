import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID and enable ignoreUndefinedProperties
let firestoreDb;
try {
  firestoreDb = initializeFirestore(
    app,
    { ignoreUndefinedProperties: true },
    firebaseConfig.firestoreDatabaseId || undefined
  );
} catch {
  firestoreDb = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);
}
export const db = firestoreDb;

// Initialize Auth
export const auth = getAuth(app);

/**
 * Safely removes undefined values recursively from an object/array so Firestore setDoc/updateDoc never fails.
 */
export function sanitizeFirestoreData<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return null as unknown as T;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeFirestoreData(item)) as unknown as T;
  }
  if (typeof obj === 'object') {
    // If it's a special object like Date or non-plain object, keep it
    if (obj instanceof Date || (obj.constructor && obj.constructor.name !== 'Object')) {
      return obj;
    }
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = sanitizeFirestoreData(value);
      }
    }
    return cleaned as T;
  }
  return obj;
}

// Normalizes phone numbers: digits only, treating leading '62' and leading '0' identically.
export function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('62')) {
    digits = '0' + digits.slice(2);
  } else if (digits.startsWith('8')) {
    digits = '0' + digits;
  }
  return digits;
}

export interface CustomerFirestoreData {
  name: string;
  address: string;
  phone: string;
  createdAt: string;
  province?: string;
  provinceId?: string;
  city?: string;
  cityId?: string;
  district?: string;
  districtId?: string;
  village?: string;
  villageId?: string;
  streetAddress?: string;
}

export const DEFAULT_DEMO_PHONE = '081234567890';
export const DEFAULT_DEMO_NAME = 'Yaya';
export const DEFAULT_DEMO_ADDRESS = 'Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan';

// All sample customers from seed data to seed in Firestore if missing
export const SEED_CUSTOMERS: CustomerFirestoreData[] = [
  {
    name: 'Yaya',
    phone: '081234567890',
    address: 'Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan',
    createdAt: '2026-08-01T08:00:00.000Z',
  },
  {
    name: 'Rizky Ramadhan',
    phone: '081399887766',
    address: 'Apartemen Menteng Park Tower A 12B, Jakarta Pusat',
    createdAt: '2026-08-15T09:00:00.000Z',
  },
  {
    name: 'Jessica Tan',
    phone: '085712345678',
    address: 'Jl. Surya Wijaya Blok C No. 15, Kedoya, Jakarta Barat',
    createdAt: '2026-08-20T10:00:00.000Z',
  },
  {
    name: 'Fajar Nugraha',
    phone: '082155667788',
    address: 'Jl. Gandaria I No. 8, Gandaria, Jakarta Selatan',
    createdAt: '2026-08-25T11:00:00.000Z',
  },
  {
    name: 'Maya Indah',
    phone: '081922334455',
    address: 'Jl. Panglima Polim IX No. 12, Jakarta Selatan',
    createdAt: '2026-08-28T14:00:00.000Z',
  },
  {
    name: 'Hendro Wijaya',
    phone: '081733445566',
    address: 'Jl. Teuku Umar No. 20, Menteng, Jakarta Pusat',
    createdAt: '2026-09-01T15:00:00.000Z',
  },
];

// Ensure anonymous auth is established silently if needed
export async function ensureSilentAuth(): Promise<void> {
  try {
    if (!auth.currentUser) {
      await signInAnonymously(auth);
    }
  } catch (err) {
    console.warn('Anonymous auth silent sign-in notice:', err);
  }
}

// Fetch customer profile from Firestore by phone number.
// Enforces that demo number is named "Yaya" everywhere.
export async function getCustomerFromFirestore(
  phone: string
): Promise<CustomerFirestoreData | null> {
  const normPhone = normalizePhoneNumber(phone);
  if (!normPhone) return null;

  await ensureSilentAuth();

  const customerDocRef = doc(db, 'customers', normPhone);

  try {
    const snapshot = await getDoc(customerDocRef);

    if (snapshot.exists()) {
      const data = snapshot.data() as CustomerFirestoreData;
      let name = data.name || '';
      let address = data.address || '';
      const createdAt = data.createdAt || new Date().toISOString();

      // Requirement: If demo number has a different name in Firestore, update it to "Yaya"
      if (normPhone === normalizePhoneNumber(DEFAULT_DEMO_PHONE)) {
        if (name !== DEFAULT_DEMO_NAME || address !== DEFAULT_DEMO_ADDRESS) {
          name = DEFAULT_DEMO_NAME;
          address = DEFAULT_DEMO_ADDRESS;
          updateDoc(customerDocRef, { name, address }).catch((e) =>
            console.warn('Failed updating demo account name in Firestore:', e)
          );
        }
      }

      return {
        name,
        address,
        phone: data.phone || normPhone,
        createdAt,
      };
    }
  } catch (err) {
    console.warn('Error reading customer doc from Firestore, checking seed customers:', err);
  }

  // If this phone matches any of our seed customers, auto-create it in Firestore
  const seedMatch = SEED_CUSTOMERS.find(
    (sc) => normalizePhoneNumber(sc.phone) === normPhone
  );

  if (seedMatch) {
    try {
      await setDoc(customerDocRef, seedMatch);
      return seedMatch;
    } catch (saveErr) {
      console.warn('Auto-create seed account in Firestore error, using fallback:', saveErr);
      return seedMatch;
    }
  }

  return null;
}

// Seed all initial sample customers in Firestore on app boot if missing
export async function seedSampleCustomersIfMissing(): Promise<void> {
  try {
    await ensureSilentAuth();
    for (const seedCust of SEED_CUSTOMERS) {
      const norm = normalizePhoneNumber(seedCust.phone);
      const customerDocRef = doc(db, 'customers', norm);
      const snapshot = await getDoc(customerDocRef);

      if (!snapshot.exists()) {
        await setDoc(customerDocRef, seedCust);
      } else if (norm === normalizePhoneNumber(DEFAULT_DEMO_PHONE)) {
        // Ensure name is "Yaya" and address is default Senopati
        const existingData = snapshot.data();
        if (existingData.name !== DEFAULT_DEMO_NAME || existingData.address !== DEFAULT_DEMO_ADDRESS) {
          await updateDoc(customerDocRef, {
            name: DEFAULT_DEMO_NAME,
            address: DEFAULT_DEMO_ADDRESS,
          });
        }
      }
    }
  } catch (err) {
    console.warn('Seed sample customers in Firestore notice:', err);
  }
}

// Save or create customer profile in Firestore
export async function saveCustomerToFirestore(
  phone: string,
  name: string,
  address: string,
  structuredAddress?: {
    provinceName?: string;
    provinceId?: string;
    regencyName?: string;
    regencyId?: string;
    districtName?: string;
    districtId?: string;
    villageName?: string;
    villageId?: string;
    streetAddress?: string;
  }
): Promise<CustomerFirestoreData> {
  const normPhone = normalizePhoneNumber(phone);
  if (!normPhone) {
    throw new Error('Nomor telepon tidak valid.');
  }

  await ensureSilentAuth();

  const customerDocRef = doc(db, 'customers', normPhone);
  const existingDoc = await getDoc(customerDocRef).catch(() => null);

  const nowIso = new Date().toISOString();
  const customerData: CustomerFirestoreData = {
    name: name.trim(),
    address: address.trim(),
    phone: phone.trim() || normPhone,
    createdAt: existingDoc && existingDoc.exists() ? (existingDoc.data()?.createdAt || nowIso) : nowIso,
    ...(structuredAddress?.provinceName && { province: structuredAddress.provinceName }),
    ...(structuredAddress?.provinceId && { provinceId: structuredAddress.provinceId }),
    ...(structuredAddress?.regencyName && { city: structuredAddress.regencyName }),
    ...(structuredAddress?.regencyId && { cityId: structuredAddress.regencyId }),
    ...(structuredAddress?.districtName && { district: structuredAddress.districtName }),
    ...(structuredAddress?.districtId && { districtId: structuredAddress.districtId }),
    ...(structuredAddress?.villageName && { village: structuredAddress.villageName }),
    ...(structuredAddress?.villageId && { villageId: structuredAddress.villageId }),
    ...(structuredAddress?.streetAddress && { streetAddress: structuredAddress.streetAddress }),
  };

  await setDoc(customerDocRef, sanitizeFirestoreData(customerData));
  return customerData;
}

// Update existing customer profile in Firestore
export async function updateCustomerInFirestore(
  phone: string,
  fields: {
    name?: string;
    address?: string;
    structuredAddress?: {
      provinceName?: string;
      provinceId?: string;
      regencyName?: string;
      regencyId?: string;
      districtName?: string;
      districtId?: string;
      villageName?: string;
      villageId?: string;
      streetAddress?: string;
    };
  }
): Promise<void> {
  const normPhone = normalizePhoneNumber(phone);
  if (!normPhone) return;

  await ensureSilentAuth();

  const customerDocRef = doc(db, 'customers', normPhone);
  const snapshot = await getDoc(customerDocRef).catch(() => null);

  const updatePayload: Record<string, string> = {};
  if (fields.name) updatePayload.name = fields.name.trim();
  if (fields.address) updatePayload.address = fields.address.trim();

  if (fields.structuredAddress) {
    const sa = fields.structuredAddress;
    if (sa.provinceName) updatePayload.province = sa.provinceName;
    if (sa.provinceId) updatePayload.provinceId = sa.provinceId;
    if (sa.regencyName) updatePayload.city = sa.regencyName;
    if (sa.regencyId) updatePayload.cityId = sa.regencyId;
    if (sa.districtName) updatePayload.district = sa.districtName;
    if (sa.districtId) updatePayload.districtId = sa.districtId;
    if (sa.villageName) updatePayload.village = sa.villageName;
    if (sa.villageId) updatePayload.villageId = sa.villageId;
    if (sa.streetAddress) updatePayload.streetAddress = sa.streetAddress;
  }

  if (snapshot && snapshot.exists()) {
    await updateDoc(customerDocRef, sanitizeFirestoreData(updatePayload));
  } else {
    const data: CustomerFirestoreData = {
      name: fields.name?.trim() || DEFAULT_DEMO_NAME,
      address: fields.address?.trim() || DEFAULT_DEMO_ADDRESS,
      phone: normPhone,
      createdAt: new Date().toISOString(),
      ...updatePayload,
    };
    await setDoc(customerDocRef, sanitizeFirestoreData(data));
  }
}

// Subscribe to real-time customer list from Firestore collection 'customers'
export function subscribeToCustomers(
  onSuccess: (customers: CustomerFirestoreData[]) => void,
  onError: (error: Error) => void
): () => void {
  ensureSilentAuth().catch(() => {});

  const customersCol = collection(db, 'customers');
  const unsubscribe = onSnapshot(
    customersCol,
    (snapshot) => {
      const results: CustomerFirestoreData[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        let name = d.name || '';
        let address = d.address || '';
        const phone = d.phone || docSnap.id;
        const norm = normalizePhoneNumber(phone);

        // Demo account name normalization guard:
        // If a Firestore document for this number has a different name, update it to "Yaya"
        if (norm === normalizePhoneNumber(DEFAULT_DEMO_PHONE)) {
          if (name !== DEFAULT_DEMO_NAME || address !== DEFAULT_DEMO_ADDRESS) {
            name = DEFAULT_DEMO_NAME;
            address = DEFAULT_DEMO_ADDRESS;
            updateDoc(docSnap.ref, { name, address }).catch((err) => {
              console.warn('Auto-repair demo account name in Firestore notice:', err);
            });
          }
        }

        results.push({
          name,
          phone,
          address,
          createdAt: d.createdAt || new Date().toISOString(),
        });
      });

      // Sort by createdAt desc or name
      results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      onSuccess(results);
    },
    (err) => {
      console.error('subscribeToCustomers error:', err);
      onError(err);
    }
  );

  return unsubscribe;
}

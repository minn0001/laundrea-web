import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import {
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

// Initialize Firestore with specific database ID if present in config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);

// Initialize Auth
export const auth = getAuth(app);

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
  address: string
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
  };

  await setDoc(customerDocRef, customerData);
  return customerData;
}

// Update existing customer profile in Firestore
export async function updateCustomerInFirestore(
  phone: string,
  fields: { name?: string; address?: string }
): Promise<void> {
  const normPhone = normalizePhoneNumber(phone);
  if (!normPhone) return;

  await ensureSilentAuth();

  const customerDocRef = doc(db, 'customers', normPhone);
  const snapshot = await getDoc(customerDocRef).catch(() => null);

  if (snapshot && snapshot.exists()) {
    const updatePayload: Record<string, string> = {};
    if (fields.name) updatePayload.name = fields.name.trim();
    if (fields.address) updatePayload.address = fields.address.trim();
    await updateDoc(customerDocRef, updatePayload);
  } else {
    const data: CustomerFirestoreData = {
      name: fields.name?.trim() || DEFAULT_DEMO_NAME,
      address: fields.address?.trim() || DEFAULT_DEMO_ADDRESS,
      phone: normPhone,
      createdAt: new Date().toISOString(),
    };
    await setDoc(customerDocRef, data);
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

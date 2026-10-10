import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID if present in config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);

// Initialize Auth
export const auth = getAuth(app);

// Normalizes phone numbers: digits only, treating leading '62' and leading '0' identically.
// e.g. '081234567890' -> '081234567890', '+6281234567890' -> '081234567890', '6281234567890' -> '081234567890'
export function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('62')) {
    digits = '0' + digits.slice(2);
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

// Ensure anonymous auth is established silently if needed
export async function ensureSilentAuth(): Promise<void> {
  try {
    if (!auth.currentUser) {
      await signInAnonymously(auth);
    }
  } catch (err) {
    // If anonymous auth is not enabled on project, standard unauthenticated rules apply
    console.warn('Anonymous auth silent sign-in notice:', err);
  }
}

// Fetch customer profile from Firestore by phone number
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
    return {
      name: data.name || '',
      address: data.address || '',
      phone: data.phone || normPhone,
      createdAt: data.createdAt || new Date().toISOString(),
    };
  }

  // If this is the demo phone and does not exist in Firestore yet, automatically seed it in Firestore
  if (normPhone === normalizePhoneNumber(DEFAULT_DEMO_PHONE)) {
    const demoData: CustomerFirestoreData = {
      name: DEFAULT_DEMO_NAME,
      address: DEFAULT_DEMO_ADDRESS,
      phone: DEFAULT_DEMO_PHONE,
      createdAt: new Date().toISOString(),
    };
    try {
      await setDoc(customerDocRef, demoData);
      return demoData;
    } catch (saveErr) {
      console.warn('Auto-create demo account in Firestore error, using fallback:', saveErr);
      return demoData;
    }
  }

  return null;
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
    // If not existing, create it
    const data: CustomerFirestoreData = {
      name: fields.name?.trim() || DEFAULT_DEMO_NAME,
      address: fields.address?.trim() || DEFAULT_DEMO_ADDRESS,
      phone: normPhone,
      createdAt: new Date().toISOString(),
    };
    await setDoc(customerDocRef, data);
  }
}

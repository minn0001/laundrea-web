/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { CustomerLoginPortal } from './components/auth/CustomerLoginPortal';
import { StaffLoginPortal } from './components/auth/StaffLoginPortal';
import { CustomerApp } from './components/customer/CustomerApp';
import { CourierApp } from './components/courier/CourierApp';
import { AdminApp } from './components/admin/AdminApp';
import { useRouter } from './utils/useRouter';

const AppContent: React.FC = () => {
  const { role, isCustomerVerified, isCourierLoggedIn, isAdminLoggedIn } = useApp();
  const { isStaff, navigate } = useRouter();

  // 1. STAFF LINK: /staff
  // Opening /staff shows a login screen only for Kurir and Admin.
  // After login, the user goes to their Kurir or Admin dashboard as usual.
  // Prevent cross-access: a customer session can't open staff dashboards and vice versa.
  if (isStaff) {
    if (role === 'courier' && isCourierLoggedIn) {
      return (
        <div className="min-h-screen flex flex-col bg-white text-[#254117] w-full">
          <CourierApp />
        </div>
      );
    }

    if (role === 'admin' && isAdminLoggedIn) {
      return (
        <div className="min-h-screen flex flex-col bg-white text-[#254117] w-full">
          <AdminApp />
        </div>
      );
    }

    // Fallbacks if one is logged in but role variable was unset
    if (isAdminLoggedIn) {
      return (
        <div className="min-h-screen flex flex-col bg-white text-[#254117] w-full">
          <AdminApp />
        </div>
      );
    }

    if (isCourierLoggedIn) {
      return (
        <div className="min-h-screen flex flex-col bg-white text-[#254117] w-full">
          <CourierApp />
        </div>
      );
    }

    // Unauthenticated staff route: shows staff login with toggle (Kurir / Admin ONLY)
    return <StaffLoginPortal onNavigateCustomer={() => navigate('/')} />;
  }

  // 2. CUSTOMER LINK: / (root)
  // Opening the root URL goes straight to the Pelanggan login screen (WhatsApp OTP flow).
  // No role selection screen.
  // After login, the user goes to the customer dashboard as usual.
  // Prevent cross-access: courier or admin sessions cannot open customer dashboard.
  if (isCustomerVerified) {
    return (
      <div className="min-h-screen flex flex-col bg-white text-[#254117] w-full">
        <CustomerApp />
      </div>
    );
  }

  // Unauthenticated customer route: goes straight to Pelanggan WhatsApp OTP login
  return <CustomerLoginPortal onNavigateStaff={() => navigate('/staff')} />;
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}


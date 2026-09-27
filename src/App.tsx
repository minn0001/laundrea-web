/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { RoleLoginPortal } from './components/auth/RoleLoginPortal';
import { CustomerApp } from './components/customer/CustomerApp';
import { CourierApp } from './components/courier/CourierApp';
import { AdminApp } from './components/admin/AdminApp';

const AppContent: React.FC = () => {
  const { role, isCustomerVerified, isCourierLoggedIn, isAdminLoggedIn } = useApp();

  const isSessionActive =
    (role === 'customer' && isCustomerVerified) ||
    (role === 'courier' && isCourierLoggedIn) ||
    (role === 'admin' && isAdminLoggedIn);

  if (!isSessionActive) {
    return <RoleLoginPortal />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#254117] w-full">
      {/* Role-based portal rendering without any role switcher tab */}
      <div className="flex-1 w-full">
        {role === 'customer' && <CustomerApp />}
        {role === 'courier' && <CourierApp />}
        {role === 'admin' && <AdminApp />}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}


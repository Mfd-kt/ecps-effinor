import React from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';

const AdminLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      {/* Main content area with left margin to account for fixed sidebar (256px = w-64) - only on desktop */}
      <div className="flex-1 flex flex-col overflow-x-hidden lg:ml-64">
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
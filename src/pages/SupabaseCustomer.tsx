import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { CustomerPage } from '../components/CustomerPage';
import type { DatabaseManager } from '../utils/database';

interface SupabaseContextType {
  userId: string;
  isAdmin: boolean;
  mode: 'supabase';
  db?: DatabaseManager;
}

export const SupabaseCustomer: React.FC = () => {
  const { userId, isAdmin, mode } = useOutletContext<SupabaseContextType>();
  const db = new (require('../utils/database').DatabaseManager)();

  return (
    <CustomerPage
      db={db}
      mode={mode}
      userId={userId}
      isAdmin={isAdmin}
    />
  );
};

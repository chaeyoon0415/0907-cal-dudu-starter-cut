import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { AdminPage } from '../components/AdminPage';
import type { DatabaseManager } from '../utils/database';

interface SupabaseContextType {
  userId: string;
  isAdmin: boolean;
  mode: 'supabase';
  db?: DatabaseManager;
}

export const SupabaseAdmin: React.FC = () => {
  const { userId, isAdmin, mode } = useOutletContext<SupabaseContextType>();
  const db = new (require('../utils/database').DatabaseManager)();

  return (
    <AdminPage
      db={db}
      mode={mode}
      userId={userId}
      isAdmin={isAdmin}
    />
  );
};

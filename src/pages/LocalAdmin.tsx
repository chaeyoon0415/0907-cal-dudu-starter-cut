import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { AdminPage } from '../components/AdminPage';
import type { DatabaseManager } from '../utils/database';

interface LocalContextType {
  db: DatabaseManager;
  mode: 'local';
}

export const LocalAdmin: React.FC = () => {
  const { db, mode } = useOutletContext<LocalContextType>();

  return <AdminPage db={db} mode={mode} />;
};

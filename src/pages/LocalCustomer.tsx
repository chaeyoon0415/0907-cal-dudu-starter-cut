import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { CustomerPage } from '../components/CustomerPage';
import type { DatabaseManager } from '../utils/database';

interface LocalContextType {
  db: DatabaseManager;
  mode: 'local';
}

export const LocalCustomer: React.FC = () => {
  const { db, mode } = useOutletContext<LocalContextType>();

  return <CustomerPage db={db} mode={mode} />;
};

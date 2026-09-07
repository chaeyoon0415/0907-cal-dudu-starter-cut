import { createBrowserRouter, RouteObject } from 'react-router-dom';
import { ModeSelector } from './pages/ModeSelector';
import { LocalMode } from './pages/LocalMode';
import { LocalCustomerSelect } from './pages/LocalCustomerSelect';
import { LocalCustomerWithId } from './pages/LocalCustomerWithId';
import { LocalAdmin } from './pages/LocalAdmin';
import { SupabaseMode } from './pages/SupabaseMode';
import { SupabaseAuth } from './pages/SupabaseAuth';
import { AuthCallback } from './pages/AuthCallback';
import { SupabaseCustomer } from './pages/SupabaseCustomer';
import { SupabaseAdmin } from './pages/SupabaseAdmin';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <ModeSelector />,
  },
  {
    path: '/auth/callback',
    element: <AuthCallback />,
  },
  {
    path: '/local',
    element: <LocalMode />,
    children: [
      {
        path: 'select',
        element: <LocalCustomerSelect />,
      },
      {
        path: 'customer/:customerId',
        element: <LocalCustomerWithId />,
      },
      {
        path: 'admin',
        element: <LocalAdmin />,
      },
    ],
  },
  {
    path: '/supabase',
    element: <SupabaseMode />,
    children: [
      {
        path: 'auth',
        element: <SupabaseAuth />,
      },
      {
        path: 'customer',
        element: <SupabaseCustomer />,
      },
      {
        path: 'admin',
        element: <SupabaseAdmin />,
      },
    ],
  },
];

export const router = createBrowserRouter(routes);

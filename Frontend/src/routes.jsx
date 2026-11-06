import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoutes'; 
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/LoginPage';
import PipelinePage from './pages/PipelinePage';
import ClientPage from './pages/ClientsPage';
export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { index: true, element: <PipelinePage /> },
          { path: '/clients', element: <ClientPage /> }
          // If you build a separate Lead Details/Timeline page, add it here:
          // { path: 'lead/:id', element: <LeadDetailsPage /> }
        ],
      },
    ]
  },
  {
    path: '*',
    element: <PipelinePage /> // Fallback route
  }
]);
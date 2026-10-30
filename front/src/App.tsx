import { ReactElement } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/login/Login';
import Home from './pages/home/Home';
import TiersList from './pages/tiers/TiersList';
import TiersDetail from './pages/tiers/TiersDetail';
import TiersImportRecap from './pages/tiers/TiersImportRecap';
import TiersPendingApprovalList from './pages/tiers/TiersPendingApprovalList';
import SocietesList from './pages/societes/SocietesList';
import CustomAttributesList from './pages/customAttributes/CustomAttributesList';
import RolesList from './pages/roles/RolesList';
import ValueListsPage from './pages/valueLists/ValueListsPage';
import UsersList from './pages/users/UsersList';
import NotFound from './pages/notFound/NotFound';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

interface AppRoute {
  index?: boolean;
  path: string;
  element: ReactElement;
  requiresLayout?: boolean;
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
}

const routes: AppRoute[] = [
  {
    index: true,
    path: '/',
    element: <Login />,
    requiresLayout: false,
    requiresAuth: false,
  },
  {
    path: '/home',
    element: <Home />,
    requiresLayout: false,
    requiresAuth: true,
  },
  {
    path: '/tiers',
    element: <TiersList />,
    requiresLayout: true,
    requiresAuth: true,
  },
  {
    path: '/tiers/import-recap',
    element: <TiersImportRecap />,
    requiresLayout: true,
    requiresAuth: true,
  },
  {
    path: '/tiers/:uuid',
    element: <TiersDetail />,
    requiresLayout: true,
    requiresAuth: true,
  },
  {
    path: '/tiers-pending-approval',
    element: <TiersPendingApprovalList />,
    requiresLayout: true,
    requiresAuth: true,
  },
  {
    path: '/societes',
    element: <SocietesList />,
    requiresLayout: true,
    requiresAuth: true,
  },
  {
    path: '/custom-attributes',
    element: <CustomAttributesList />,
    requiresLayout: true,
    requiresAuth: true,
  },
  {
    path: '/roles',
    element: <RolesList />,
    requiresLayout: true,
    requiresAuth: true,
  },
  {
    path: '/value-lists',
    element: <ValueListsPage />,
    requiresLayout: true,
    requiresAuth: true,
  },
  {
    path: '/users',
    element: <UsersList />,
    requiresLayout: true,
    requiresAuth: true,
    requiresAdmin: true,
  }
];

function AppRoutes() {
  return (
    <Routes>
      {routes.map((route) => {
        let element = route.element;

        if (route.requiresLayout) {
          element = <Layout>{element}</Layout>;
        }

        if (route.requiresAuth) {
          element = <ProtectedRoute>{element}</ProtectedRoute>;
        }

        if (route.requiresAdmin) {
          element = <AdminRoute>{element}</AdminRoute>;
        }

        return (
          <Route
            key={route.path}
            index={route.index}
            path={route.path}
            element={element}
          />
        );
      })}

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
//const snackBarContext = useContext(SnackbarContext);

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
